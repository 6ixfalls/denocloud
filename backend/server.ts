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
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@1.35.3";

const app = new Application();
const router = new Router();
const supabase = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_KEY") || ""
);

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
        console.log(e);
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
        const user = await getUserByRequest(request, response);
        if (!user.error) state.user = user;
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
            response.body = `[{"name": "roproxy"}, {"name": "test"}]`;
        else {
            response.status = Status.Unauthorized;
        }
    }
);

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
