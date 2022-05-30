import {
    Application,
    Request,
    Status,
    Context,
} from "https://deno.land/x/oak@v10.6.0/mod.ts";

const app = new Application();

const X_FORWARDED_HOST = "x-forwarded-host";

function sanitizeHeaders(headers: Headers): Headers {
    const sanitizedHeaders = new Headers();
    const headerDenyList = ["set-cookie"];

    headers.forEach((value, key) => {
        if (!headerDenyList.includes(key.toLowerCase())) {
            sanitizedHeaders.set(key, value);
        }
    });
    return sanitizedHeaders;
}

function patchedReq(req: Request): [URL, RequestInit] {
    // Parse & patch URL (preserve path and querystring)
    const url = req.url;
    const denoOrigin = new URL(
        Deno.env.get("DENO_ORIGIN") || "http://localhost:8000"
    );
    url.host = denoOrigin.host;
    url.port = denoOrigin.port;
    url.protocol = denoOrigin.protocol;
    // Patch Headers
    const xHost = url.hostname;

    return [
        url,
        {
            headers: {
                ...Object.fromEntries(req.headers.entries()),
                [X_FORWARDED_HOST]: xHost,
            },
            body: (req.hasBody
                ? req.body({ type: "stream" }).value
                : undefined) as unknown as BodyInit,
            method: req.method,
        },
    ];
}

async function relayTo(req: Request): Promise<Response> {
    const [url, init] = patchedReq(req);
    try {
        return await fetch(url, init);
    } catch (e) {
        return new Response(e.message, { status: 500 });
    }
}

app.use(async (ctx: Context, next: () => Promise<unknown>) => {
    try {
        await next();
    } catch (err) {
        console.error(err);
        ctx.response.body = err.message;
        ctx.response.headers.append("x-relay-error", "true");
        ctx.response.status = err.status || 500;
    }
});

app.use(async (ctx: Context, next: () => Promise<unknown>) => {
    const { request, response } = ctx;

    if (!(request.method === "GET")) {
        console.error(`${request.method} not supported`);
        return ctx.throw(
            Status.MethodNotAllowed,
            "Only GET requests are supported"
        );
    }

    const resp = await relayTo(request);

    response.body = resp.body;
    response.status = resp.status;
    response.headers = sanitizeHeaders(resp.headers);
    response.type = resp.type;

    await next();
});

if (import.meta.main) {
    const port = 80;
    const hostname = "0.0.0.0";

    console.log(`Listening on http://${hostname}:${port}`);
    await app.listen({ port, hostname });
}
