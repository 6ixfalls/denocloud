import {
    Application,
    Router,
    Request,
    Response,
    Status,
} from "https://deno.land/x/oak@v10.6.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import axiod from "https://deno.land/x/axiod@0.26.1/mod.ts";
import { redis, docker, supabase, getTokenKey, getJSON, parseRedisResponse } from "./apis.ts";
import { ProjectState, createNewContainer } from "./docker.ts";

const app = new Application();
const router = new Router();

const TLDRegex = new RegExp(/^(?=.{1,253}\.?$)(?:(?!-|[^.]+_)[A-Za-z0-9-_]{1,63}(?<!-)(?:\.|$)){2,}$/gim);
const DockerStatusMap = new Map<string, ProjectState>([
    ["created", ProjectState.STARTING],
    ["running", ProjectState.RUNNING],
    ["paused", ProjectState.STOPPED],
    ["restarting", ProjectState.STARTING],
    ["removing", ProjectState.FAILED],
    ["exited", ProjectState.FAILED],
    ["dead", ProjectState.FAILED],
]);

async function addNewProxy(domainName: string, host: string, port: number) {
    return await axiod({
        url: `${Deno.env.get("NPM_URL")}/api/nginx/proxy-hosts`,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${await getTokenKey()}`,
        },
        data: {
            "domain_names": [
                domainName,
            ],
            "forward_scheme": "http",
            "forward_host": host, // TODO: add host etc
            "forward_port": port,
            "access_list_id": "0",
            "certificate_id": "new",
            "meta": {
                "letsencrypt_email": "denocloud+proxy@sixfalls.me",
                "letsencrypt_agree": true,
                "dns_challenge": false
            },
            "advanced_config": "",
            "locations": [],
            "block_exploits": false,
            "caching_enabled": false,
            "allow_websocket_upgrade": true,
            "http2_support": false,
            "hsts_enabled": false,
            "hsts_subdomains": false,
            "ssl_forced": true
        }
    });
}

async function patchProxy(oldDomainName: string, newDomainName: string, hostname: string) {
    const proxyHosts = await axiod({
        url: `${Deno.env.get("NPM_URL")}/api/nginx/proxy-hosts`,
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${await getTokenKey()}`,
        },
    });

    const hostData = proxyHosts.data.find((host: any) => host.domain_names[0] === oldDomainName);

    if (!hostData)
        return await addNewProxy(newDomainName, hostname, 80);
    hostData.domain_names[0] = newDomainName;
    hostData.access_list_id = hostData.access_list_id.toString();
    hostData.certificate_id = "new";
    hostData.meta = {
        "letsencrypt_email": "denocloud+proxy@sixfalls.me",
        "letsencrypt_agree": true,
        "dns_challenge": false
    };
    delete hostData.access_list;
    delete hostData.certificate;
    delete hostData.created_on;
    delete hostData.enabled;
    let id = hostData.id;
    delete hostData.id;
    delete hostData.modified_on;
    delete hostData.owner;
    delete hostData.owner_user_id;
    hostData.allow_websocket_upgrade = !!hostData.allow_websocket_upgrade;
    hostData.block_exploits = !!hostData.block_exploits;
    hostData.caching_enabled = !!hostData.caching_enabled;
    hostData.hsts_enabled = !!hostData.hsts_enabled;
    hostData.hsts_subdomains = !!hostData.hsts_subdomains;
    hostData.http2_support = !!hostData.http2_support;
    hostData.ssl_forced = !!hostData.ssl_forced;

    return await axiod({
        url: `${Deno.env.get("NPM_URL")}/api/nginx/proxy-hosts/${id}`,
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${await getTokenKey()}`,
        },
        data: hostData
    });
}

async function deleteProxy(domainName: string) {
    try {
        const proxyHosts = await axiod({
            url: `${Deno.env.get("NPM_URL")}/api/nginx/proxy-hosts`,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${await getTokenKey()}`,
            },
        });
        const SSLCerts = await axiod({
            url: `${Deno.env.get("NPM_URL")}/api/nginx/certificates`,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${await getTokenKey()}`,
            },
        });

        const host = proxyHosts.data.find((host: any) => host.domain_names[0] === domainName);
        const cert = SSLCerts.data.find((cert: any) => cert.domain_names[0] === domainName);

        if (cert && cert.id)
            await axiod({
                url: `${Deno.env.get("NPM_URL")}/api/nginx/certificates/${cert.id}`,
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${await getTokenKey()}`,
                },
            });

        if (!host || !host.id)
            throw new Error("Missing host id!");

        await axiod({
            url: `${Deno.env.get("NPM_URL")}/api/nginx/proxy-hosts/${host.id}`,
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${await getTokenKey()}`,
            },
        });

        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

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
        },
        next
    ) => {
        if (request.method !== "OPTIONS" && request.method !== "POST") {
            const user = await getUserByRequest(request, response);
            if (!user.error) state.user = user;
        }
        await next();
    }
);

router.get(
    "/projects/list",
    async ({
        request,
        response,
        cookies,
        state,
    }) => {
        if (state.user) {
            const { data, error } = await supabase.from('workers').select('*').eq("owner", state.user.user.id).order("name", { ascending: true });
            console.log("s1");
            if (error) {
                response.status = 500;
                response.body = { error: error.message };
            } else if (data) {
                console.log("s2");
                const pl = redis.pipeline();
                data.forEach(worker => {
                    pl.sendCommand("JSON.GET", worker.name, "$.status");
                });
                console.log("s3", redis.isConnected, redis.isClosed);
                const statuses = (await pl.flush()).map(val => val && parseRedisResponse(val.toString()) as ProjectState);
                console.log("s4");
                await Promise.all(data.map(async (worker, index) => {
                    let status = statuses[index];
                    if (!status) {
                        const ContainerInfo = await docker.containers.inspect(worker.container_id);
                        if (!ContainerInfo.message)
                            status = DockerStatusMap.get(ContainerInfo.State.Status);
                        else
                            status = ProjectState.UNKNOWN;
                    }

                    worker.status = status;

                    delete worker.container_id;
                }));
                console.log("s5");
                response.status = 200;
                response.body = data;
            }
        } else {
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
    }) => {
        const token = await request.headers.get("Authorization");
        if (token) {
            const accesstoken = token.replace(/^bearer/i, "").trim();
            if (accesstoken === Deno.env.get("SUPABASE_AUTH_TOKEN")) {
                const result = await request.body().value;
                if (!result.record)
                    result.record = result.old_record;
                result.record.domain = result.record.domain[0] || "";
                if (result.old_record)
                    result.old_record.domain = result.old_record.domain[0] || "";
                const { data: user, error } = await supabase.auth.api.getUserById(result.record.owner);

                if (error)
                    return response.status = Status.InternalServerError;

                switch (result.type) {
                    case "INSERT": {
                        console.log("INSERT");
                        const { success, id: ContainerId, error } = await createNewContainer(user.id, result.record.name);
                        console.log(success, ContainerId, error);
                        if (!success) {
                            response.status = Status.InternalServerError;
                            break;
                        }

                        const ContainerInfo = await docker.containers.inspect(ContainerId);

                        if (ContainerInfo.message) {
                            // deepcode ignore PT: removes container, not a file + uses local socket, not public
                            await docker.containers.rm(ContainerId);
                            await redis.sendCommand("JSON.DEL", result.record.name, "$");
                            await supabase.storage.from("worker-storage").remove([`${result.record.owner}/${result.record.name}.js`]);
                            response.status = Status.InternalServerError;
                            break;
                        }

                        if (result.record.domain.match(TLDRegex)) {
                            try {
                                await addNewProxy(result.record.domain, ContainerInfo.Config.Hostname, 80);
                            } catch (e) {
                                await deleteProxy(result.record.domain);
                            }
                        }

                        const startResponse = await docker.containers.start(ContainerId);
                        if (startResponse && startResponse.message) {
                            // deepcode ignore PT: removes container, not a file + uses local socket, not public
                            await docker.containers.rm(ContainerId);
                            await redis.sendCommand("JSON.DEL", result.record.name, "$");
                            await supabase.storage.from("worker-storage").remove([`${result.record.owner}/${result.record.name}.js`]);
                            console.log("FATAL: ", startResponse.message);
                            response.status = Status.InternalServerError;
                        } else {
                            await redis.sendCommand("JSON.DEL", result.record.name, "$.status");
                        }

                        break;
                    }
                    case "UPDATE": {
                        console.log("UPDATE");

                        const ContainerId = result.record.container_id;
                        const res = await docker.containers.start(ContainerId);
                        console.log(res);
                        const ContainerInfo = await docker.containers.inspect(ContainerId);

                        if (!ContainerInfo.message) {
                            //TODO: case doesnt seem to break
                            if (result.old_record.domain.match(TLDRegex)) {
                                if (result.record.domain.match(TLDRegex)) {
                                    await patchProxy(result.old_record.domain, result.record.domain, ContainerInfo.Config.Hostname);
                                } else {
                                    try {
                                        await deleteProxy(result.old_record.domain);
                                    } catch (e) { }
                                }
                            } else if (result.record.domain.match(TLDRegex)) {
                                await addNewProxy(result.record.domain, ContainerInfo.Config.Hostname, 80);
                            }
                        }
                        break;
                    }
                    case "DELETE": {
                        console.log("DELETE");
                        const ContainerId = result.record.container_id;
                        const ContainerInfo = await docker.containers.inspect(ContainerId);

                        if (!ContainerInfo.message) {
                            // deepcode ignore PT: removes container, not a file + uses local socket, not public
                            await docker.containers.stop(ContainerId);
                            await docker.containers.rm(ContainerId);
                            await redis.sendCommand("JSON.DEL", result.record.name, "$");
                            await supabase.storage.from("worker-storage").remove([`${result.record.owner}/${result.record.name}.js`]);
                            if (result.record.domain.match(TLDRegex)) {
                                try {
                                    await deleteProxy(result.record.domain);
                                } catch (e) { }
                            }
                        }
                        break;
                    }
                }
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
