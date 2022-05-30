import { serve } from "https://deno.land/std@0.141.0/http/server.ts";

const encoder = new TextEncoder();

function buf2hex(buffer: ArrayBuffer) {
    // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("");
}

async function hmac(key: string | ArrayBuffer, string: string) {
    // @ts-ignore // https://github.com/microsoft/TypeScript/issues/38715
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        typeof key === "string" ? encoder.encode(key) : key,
        { name: "HMAC", hash: { name: "SHA-256" } },
        false,
        ["sign"]
    );
    return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(string));
}

async function getFile(key: string) {
    const FetchDate = new Date().toISOString();
    const YYYYMMDD = FetchDate.split("T")[0].replace(/-/g, "");
    const xamzcontentsha256 =
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"; // hardcoded empty string hash
    const CanonicalRequest = `GET\n/${key}\n\nhost:${Deno.env.get(
        "BUCKET_NAME"
    )}.${Deno.env.get(
        "ENDPOINT"
    )}\nx-amz-content-sha256:${xamzcontentsha256.trim()}\nx-amz-date:${(
        FetchDate.split(".")[0] + "Z"
    ).replace(
        /-|\.|:/g,
        ""
    )}\n\nhost;x-amz-content-sha256;x-amz-date\n${xamzcontentsha256}`;
    const StringToSign = `AWS4-HMAC-SHA256\n${(
        FetchDate.split(".")[0] + "Z"
    ).replace(/-|\.|:/g, "")}\n${YYYYMMDD}/us-east-1/s3/aws4_request\n${buf2hex(
        await crypto.subtle.digest("SHA-256", encoder.encode(CanonicalRequest))
    )}`;
    const SigningKey = await hmac(
        await hmac(
            await hmac(
                // deepcode ignore HardcodedSecret: aws4 signature requires hardcoded secret
                await hmac("AWS4" + Deno.env.get("ACCESS_KEY"), YYYYMMDD),
                "us-east-1"
            ),
            "s3"
        ),
        "aws4_request"
    );
    const Signature = buf2hex(await hmac(SigningKey, StringToSign));
    const Authorization = `AWS4-HMAC-SHA256 Credential=${Deno.env.get(
        "ACCESS_KEY_ID"
    )}/${YYYYMMDD}/us-east-1/s3/aws4_request,SignedHeaders=host;x-amz-content-sha256;x-amz-date,Signature=${Signature}`;

    try {
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set("Authorization", Authorization);
        requestHeaders.set("x-amz-content-sha256", xamzcontentsha256);
        requestHeaders.set(
            "x-amz-date",
            (FetchDate.split(".")[0] + "Z").replace(/-|\.|:/g, "")
        );

        const response = await fetch(
            "https://" +
                Deno.env.get("BUCKET_NAME") +
                "." +
                Deno.env.get("ENDPOINT") +
                "/" +
                encodeURIComponent(key),
            {
                method: "GET",
                headers: requestHeaders,
            }
        );

        let { readable, writable } = new TransformStream();
        response.body?.pipeTo(writable);

        const responseHeaders: HeadersInit = new Headers();
        responseHeaders.set(
            "Content-Type",
            response.headers.get("content-type") || "application/octet-stream"
        );
        return new Response(readable, {
            status: 200,
            headers: responseHeaders,
        });
    } catch (err) {
        console.log(err);
        return new Response("File not found", { status: 404 });
    }
}

serve(async (request) => {
    const key = request.url.substring(request.url.lastIndexOf("/") + 1);
    if (key) {
        const file = await getFile(key);
        return file;
    } else {
        return new Response("OK", { status: 200 });
    }
});

