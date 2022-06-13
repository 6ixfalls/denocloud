import { ensureFile } from "https://deno.land/std@0.143.0/fs/mod.ts";
import { supabase, redis, docker } from "./apis.ts";

const ROOT_DIR = new URL('..', import.meta.url).pathname;

export async function createNewContainer(userID: string, projectName: string) {
    try {
        const ContainerFilePath = `${ROOT_DIR}worker_storage/${userID}/${projectName}.js`;
        await ensureFile(ContainerFilePath);
        let { data, error: downloadError } = await supabase.storage.from("worker-storage").download(`${userID}/${projectName}.js`);
        const dataString = await data?.text();
        if (downloadError || !dataString)
            throw downloadError || new Error("Failed to download container file");

        await Deno.writeTextFile(ContainerFilePath, dataString);

        const container = await docker.containers.create(projectName, {
            Image: "sixfalls/deno:latest",
            User: "deno",
            WorkingDir: "/app",
            ExposedPorts: { "80": {} },
            Volumes: {
                [`${ContainerFilePath}:/app/worker.js`]: {},
                [`${ROOT_DIR}worker:/app`]: {},
            },
            Entrypoint: ["/bin/sh", "-c"],
            Cmd: ["./entrypoint.sh"],
            HostConfig: {
                // @ts-ignore Denocker is missing typings for ReadonlyRootfs in HostConfig interface
                ReadonlyRootfs: true,
                NetworkMode: "nginx-proxy-manager_default"
            }
        });

        if (container.message)
            throw new Error(container.message);

        let { error: workerError } = await supabase.from("workers").update({ container_id: container.Id }).eq("name", projectName);
        if (workerError) {
            // should never be undefined because if container.message is present, Id is not
            await docker.containers.rm(container.Id || "");
            console.log(workerError.message);
            throw new Error("Failed to write container_id to database");
        }

        return { success: true, id: container.Id };
    } catch (e) {
        return { success: false, id: e.message };
    }
}