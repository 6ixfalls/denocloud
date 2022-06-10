import {
    Application,
    Router,
    Request,
    Response,
    Cookies,
    State,
    Status,
    Context,
} from "https://deno.land/x/oak@v10.6.0/mod.ts";
import { readAll } from "https://deno.land/x/std@0.143.0/io/util.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { supabase } from "./apis.ts";

const app = new Application();
const router = new Router();

async function getUserByRequest(request: Request, response: Response) {
    try {
        const token = await request.headers.get("Authorization");
        if (token) {
            const accesstoken = token.replace(/^bearer/i, "").trim();
            const { user, error: getUserError } =
                await supabase.auth.api.getUser(accesstoken);
            if (getUserError) throw new Error("Expired access token");
            return { token: accesstoken, user: user, data: user, error: null };
        } else {
            throw new Error("No access token");
        }
    } catch (e) {
        console.log(e.message);
        return { token: null, user: null, data: null, error: e };
    }
}

app.use(
    async (
        {
            request,
            response,
            cookies,
            state,
        }: {
            request: Request;
            response: Response;
            cookies: Cookies;
            state: State;
        },
        next
    ) => {
        if (request.method !== "OPTIONS") {
            const user = await getUserByRequest(request, response);
            if (!user.error) state.user = user;
        }
        next();
    }
);

router.get(
    "/projects/list",
    async ({
        request,
        response,
        cookies,
        state,
    }: {
        request: Request;
        response: Response;
        cookies: Cookies;
        state: State;
    }) => {
        if (state.user)
            response.body = `[{"name": "roproxy", "state": "RUNNING"}, {"name": "test", "state": "STOPPED"}, {"name": "test", "state": "STARTING"}, {"name": "test", "state": "FAILED"}, {"name": "test", "state": "UNKNOWN"}]`;
        else {
            response.status = Status.Unauthorized;
        }
    }
);

router.post(
    "/update_proxy",
    async ({
        request,
        response,
        cookies,
        state,
    }: {
        request: Request;
        response: Response;
        cookies: Cookies;
        state: State;
    }) => {
        const token = await request.headers.get("Authorization");
        if (token) {
            const accesstoken = token.replace(/^bearer/i, "").trim();
            if (accesstoken === Deno.env.get("SUPABASE_AUTH_TOKEN")) {
                const result = request.body();
                console.log(result);
                //@ts-ignore
                console.log(request, result.value);
            } else {
                response.status = Status.Unauthorized;
            }
        } else {
            response.status = Status.Unauthorized;
        }
    }
)

router.get(
    "/",
    async ({
        request,
        response,
        cookies,
        state,
    }: {
        request: Request;
        response: Response;
        cookies: Cookies;
        state: State;
    }) => {
        if (state.user) response.body = `Hello ${state.user.data.email}`;
        else {
            response.status = Status.Unauthorized;
        }
    }
);

app.use(oakCors({ origin: /^.+localhost:(1234|3000)$/ }));
app.use(router.routes());
app.use(router.allowedMethods());

if (import.meta.main) {
    const port = 80;
    const hostname = "0.0.0.0";

    console.log(`Listening on http://${hostname}:${port}`);
    await app.listen({ port, hostname });
}
