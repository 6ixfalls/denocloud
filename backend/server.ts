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
import { createClient } from "https://esm.sh/@supabase/supabase-js@1.35.3";

const app = new Application();
const router = new Router();
const supabase = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_KEY") || ""
);

async function getUserByRequest(
    request: Request,
    response: Response,
    cookies: Cookies
) {
    try {
        const accesstoken = await cookies.get("access-token");
        const refreshtoken = await cookies.get("refresh-token");

        if (!accesstoken) throw new Error("No access token");

        const { user, error: getUserError } = await supabase.auth.api.getUser(
            accesstoken
        );
        if (getUserError) {
            if (!refreshtoken) throw new Error("No refresh token");
            const { data, error } = await supabase.auth.api.refreshAccessToken(
                refreshtoken
            );
            if (error) {
                throw error;
            } else if (data) {
                await cookies.set("access-token", data.access_token, {
                    domain: "",
                    maxAge: 60 * 60 * 8,
                    path: "/",
                    sameSite: "lax",
                });
                await cookies.set("refresh-token", data.refresh_token!, {
                    domain: "",
                    maxAge: 60 * 60 * 8,
                    path: "/",
                    sameSite: "lax",
                });
                return {
                    token: data.access_token,
                    user: data.user,
                    data: user,
                    error: null,
                };
            }
        }
        return { token: accesstoken, user: user, data: user, error: null };
    } catch (e) {
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
        const user = await getUserByRequest(request, response, cookies);
        if (!user.error) state.user = user;
        next();
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
        if (state.user)
            response.body = `Hello ${JSON.stringify(state.user, null, 2)}`;
        else {
            response.status = Status.Unauthorized;
        }
    }
);

app.use(router.routes());
app.use(router.allowedMethods());

if (import.meta.main) {
    const port = 80;
    const hostname = "0.0.0.0";

    console.log(`Listening on http://${hostname}:${port}`);
    await app.listen({ port, hostname });
}
