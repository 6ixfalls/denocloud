import Docker from "https://deno.land/x/denocker@v0.2.0/index.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@1.35.3";
import { connect } from "https://deno.land/x/redis@v0.26.0/mod.ts";

const supabase = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_KEY") || ""
);

const redis = await connect({
    hostname: Deno.env.get("REDIS_HOST") || "",
    port: Deno.env.get("REDIS_PORT") || 6379,
})

const docker = new Docker("/var/run/docker.sock");

export { supabase, redis, docker };