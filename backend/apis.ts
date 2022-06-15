import Docker from "https://deno.land/x/sdenocker@v0.2.2/index.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@1.35.3";
import { connect } from "https://deno.land/x/redis@v0.26.0/mod.ts";
import axiod from "https://deno.land/x/axiod@0.26.1/mod.ts";

const supabase = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_KEY") || ""
);

const redis = await connect({
    hostname: Deno.env.get("REDIS_HOST") || "",
    port: Deno.env.get("REDIS_PORT") || 6379,
    password: Deno.env.get("REDIS_PASSWORD") || "",
})

const docker = new Docker("/var/run/docker.sock");

// nginx proxy manager
let BearerToken = "";
let BearerTokenExpiry = new Date(1970, 0, 1);

async function getNewTokenKey() {
    const response = await axiod({
        url: `${Deno.env.get("NPM_URL")}/api/tokens`,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: {
            "identity": Deno.env.get("NPM_IDENTITY") || "",
            "secret": Deno.env.get("NPM_SECRET") || ""
        }
    });

    BearerToken = response.data.token;
    BearerTokenExpiry = new Date(response.data.expires);
}

async function getTokenKey() {
    if (BearerTokenExpiry < new Date())
        await getNewTokenKey();
    return BearerToken;
}

function parseRedisResponse(response: string) {
    return JSON.parse(response)[0];
}

async function getJSON(objectKey: string, JSONkey: string) {
    const value = (await redis.sendCommand("JSON.GET", objectKey, JSONkey)).value();

    if (value)
        return parseRedisResponse(value.toString());
    else
        return null;
}

export { supabase, redis, docker, getTokenKey, parseRedisResponse, getJSON };