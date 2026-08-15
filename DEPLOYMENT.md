# Deployment Architecture — Viber

## Overview
Viber is containerized with Docker and deployed to AWS via an automated CI/CD 
pipeline. Production traffic is served from Vercel; this document also covers 
a bounded AWS EC2 + ECR deployment exercise used to validate the containerized 
deployment path end-to-end.

## What's containerized
- Next.js app built in `standalone` output mode, minimizing image size by 
  tracing only required dependencies at build time.
- Multi-stage Dockerfile: separate `dependencies`, `builder`, and `runner` 
  stages, with the final runtime image containing only the standalone build 
  output and static assets — not the full `node_modules` or source tree.
- Runs as a non-root `node` user inside the container for security.

## CI/CD pipeline (GitHub Actions)
- Trigger: push to `main`.
- Job 1 (`build-and-test`): install dependencies, lint, and build the app to 
  catch errors before any deployment step runs.
- Job 2 (`deploy-to-ecr`): runs only if Job 1 succeeds (`needs:` dependency), 
  and only on direct pushes to `main` (not pull requests). Authenticates to 
  AWS using repository secrets, logs into Amazon ECR, builds the Docker 
  image, and pushes it with the `latest` tag.

## AWS infrastructure
- **ECR (Elastic Container Registry)**: private registry storing the built 
  image, region `ap-south-1` (Mumbai).
- **EC2**: a `t3.micro` Amazon Linux 2023 instance in the same region, with 
  Docker installed manually via `dnf`. The instance authenticates to ECR 
  using IAM user credentials (exported as environment variables for this 
  exercise) to pull the image, then runs it via `docker run`, mapping 
  container port 3000 to the host.
- **Security group**: SSH (22) restricted to a single IP; app port (3000) 
  open for demo reachability testing.

## What's manual vs. automated
- Automated: build, lint, image build, and push to ECR on every push to main.
- Manual (for this bounded exercise): EC2 provisioning, Docker installation 
  on the instance, image pull, and container start. A production setup 
  would replace these manual steps with Infrastructure as Code (e.g. 
  Terraform) and/or an orchestration layer (ECS, EKS) to automate 
  provisioning and deployment fully.

## Production note
Live traffic is served via Vercel (`viber.noblechicken.me`), which handles 
HTTPS, CDN, and zero-downtime deploys natively. This EC2 exercise exists to 
demonstrate direct AWS container deployment skills; the EC2 instance is 
terminated after this exercise to avoid ongoing cost.