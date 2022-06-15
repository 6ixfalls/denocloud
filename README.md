# DenoCloud
Simple Cloud Functions for Deno<br>
```diff
+ Only works on aarch64, no other arch is supported as of now. (Docker image, todo to fix)
- This project is not ready for use.
```

## Prerequisites
Docker CLI - [installation](https://docs.docker.com/engine/install/)<br>
Docker Compose - [installation](https://docs.docker.com/compose/install/)<br>
Supabase Project - [homepage](https://supabase.io/) - I'm not sure how to share my supabase project configuration as of now, so you'll probably be unable to get a working version. Feel free to contact me for the database configs or reply to [issue #1](https://github.com/6ixfalls/denocloud/issues/1) if you know a way to share the config/database tables, etc.<br>
.env Setup - You can either use the [dotenv file](https://github.com/6ixfalls/denocloud/blob/main/.env.example) or preferably use a secret manager such as [Doppler](https://www.doppler.com/). Doppler start & stop scripts are provided in the repository, rename them without `.example`, enter your service tokens and remember to use `chmod +x start.sh` and `chmod +x stop.sh` to make them executable.<br>

## Usage
Clone the repository to your machine:<br>
`git pull https://github.com/6ixfalls/denocloud.git`<br>

Pull the docker image from Docker Hub:<br>
`docker pull sixfalls/deno:latest` (Or alternatively, [create the image yourself](https://hub.docker.com/r/sixfalls/deno))<br>

Run the container:<br>
`./start.sh` and `./stop.sh` if using Doppler, and `docker compose up -d` and `docker compose down` if not.
