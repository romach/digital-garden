---
title: Docker FAQ
tags:
    - faq
    - docker
---

## How to run Postgres in Docker container?

```bash
docker run -d \
  --name book-service \
  -e POSTGRES_PASSWORD=root \
  -p 5432:5432 \
  postgres:18.1
```

You can connect to Postgres using the following command:
```bash
psql -h 127.0.0.1 -p 5432 -U postgres -d postgres
```

## How to connect to a running Docker container?

```bash
docker exec -it container_name bash
```

## How to run Ubuntu in Docker?

<!-- steps -->
1. Run Ubuntu container
   ```bash
   docker run -d --name ubuntu -it ubuntu
   ```
2. Connect to ubuntu container
   ```bash
   docker exec -it ubuntu bash
   ```
3. Install sudo
   ```bash
   apt update && apt install -y sudo
   ```
