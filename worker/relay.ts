import { writeAll } from "https://deno.land/x/std@0.143.0/streams/conversion.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@1.35.3";
import { connect, RedisValue } from "https://deno.land/x/redis@v0.26.0/mod.ts";
import {
    Application,
    Request,
    Status,
    Context,
} from "https://deno.land/x/oak@v10.6.0/mod.ts";

const app = new Application();

let ENV: {
    [key: string]: string;
} = {};

type Worker = {
    name: string,
    env: {
        key: string,
        value: string,
    }[],
}

const X_FORWARDED_HOST = "x-forwarded-host";

const supabase = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_KEY") || ""
);

const redis = await connect({
    hostname: Deno.env.get("REDIS_HOST") || "",
    port: Deno.env.get("REDIS_PORT") || 6379,
    password: Deno.env.get("REDIS_PASSWORD") || "",
});

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
        // deepcode ignore Ssrf: Proxying to local server
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

app.addEventListener("listen", ({ hostname, port, secure }) => {
    console.log(
        `[Relay]: Listening on: ${secure ? "https://" : "http://"}${hostname ??
        "localhost"
        }:${port}`,
    );
});

async function pipeOutput(readable: ReadableStream<Uint8Array>, writer: Deno.Writer, error = false) {
    const reader = readable.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    reader.read().then(async function process({ done, value }): Promise<any> {
        if (done) return;

        const line = decoder.decode(value);

        await writeAll(writer, encoder.encode(`[Worker ${error ? "stderr" : "stdout"}]: ${line}`));

        if (Deno.env.get("PROJECT_NAME") && Deno.env.get("OWNER_ID")) {
            const pl = redis.pipeline();
            pl.sendCommand("JSON.ARRINSERT", Deno.env.get("PROJECT_NAME") as RedisValue, "$.logs", "0", JSON.stringify({
                content: line,
                timestamp: new Date().toISOString(),
                isError: error,
            }));
            pl.sendCommand("JSON.ARRTRIM", Deno.env.get("PROJECT_NAME") as RedisValue, "$.logs", "0", "100");
            await pl.flush();
        }

        return await reader.read().then(process);
    });
}

async function workerLoop() {
    const workerProcess = Deno.spawnChild(Deno.execPath(), {
        args: ["run", "--allow-net", "--allow-env", "/app/worker.ts"],
        clearEnv: true,
        stdout: "piped",
        stderr: "piped",
        env: {
            DENO_DIR: "/deno-dir/",
            ...ENV
        }
    });

    pipeOutput(workerProcess.stdout, Deno.stdout);
    pipeOutput(workerProcess.stderr, Deno.stderr, true);

    const status = await workerProcess.status;
    console.log(`[Relay]: Worker exited with code ${status.code} and signal ${status.signal}`);
    console.log("[Relay]: Restarting worker");

    setTimeout(workerLoop, 1000);
}

if (import.meta.main) {
    const { data, error } = await supabase.from<Worker>("workers").select("env").eq("name", Deno.env.get("PROJECT_NAME") || " ".repeat(51)).single();
    if (error) {
        console.error(error);
        const pl = redis.pipeline();
        pl.sendCommand("JSON.ARRINSERT", Deno.env.get("PROJECT_NAME") as RedisValue, "$.logs", "0", JSON.stringify({
            content: "[Relay]: Worker failed to start. If this error repeats, delete and create the worker again.",
            timestamp: new Date().toISOString(),
            isError: error,
        }));
        pl.sendCommand("JSON.ARRTRIM", Deno.env.get("PROJECT_NAME") as RedisValue, "$.logs", "0", "100");
        await pl.flush();
    } else {
        data.env.forEach(envVar => {
            ENV[envVar.key] = envVar.value;
        });
        workerLoop();
        await app.listen({ port: 80, hostname: "0.0.0.0" });
    }
}