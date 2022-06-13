import { Application, Router, Request, Response, Cookies, State, Status } from "https://deno.land/x/oak/mod.ts";
import { supabase } from "./apis.ts";

const app = new Application();
const router = new Router();

router.get("/", (context) => {
    context.response.body = `<form action="/" method="POST"><input type="submit" value="what"></form>`;
    context.response.type = "text/html";
});

router.post(
    "/update_proxy",
    async ({
        request,
        response,
        cookies,
        state,
    }) => {
        const token = await request.headers.get("Authorization");
        if (token) {
            const accesstoken = token.replace(/^bearer/i, "").trim();
            if (accesstoken === Deno.env.get("SUPABASE_AUTH_TOKEN")) {
                const result = request.body();
                console.log(result);
                //@ts-ignore
                console.log(request, await result.value);
            } else {
                response.status = Status.Unauthorized;
            }
        } else {
            response.status = Status.Unauthorized;
        }
    }
)

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({port: 80});