# DenoCloud
Simple Cloud Functions for Deno

## Prerequisites
Docker CLI - [installation](https://docs.docker.com/engine/install/)<br>
Docker Compose - [installation](https://docs.docker.com/compose/install/)<br>
.env Setup - You can either use the [dotenv file](https://github.com/6ixfalls/denocloud/blob/main/.env.example) or preferably use a secret manager such as [Doppler](https://www.doppler.com/). Doppler start & stop scripts are provided in the repository, rename them without `.example`, enter your service tokens and remember to use `chmod +x start.sh` and `chmod +x stop.sh` to make them executable.

## Usage
Clone the repository to your machine:<br>
`git pull https://github.com/6ixfalls/denocloud.git`<br>

Pull the docker image from Docker Hub:<br>
`docker pull sixfalls/deno:latest` (Or alternatively, [create the image yourself](https://hub.docker.com/r/sixfalls/deno))<br>

Run the container:<br>
`./start.sh` and `./stop.sh` if using Doppler, and `docker compose up -d` and `docker compose down` if not.
