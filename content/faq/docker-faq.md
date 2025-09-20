---
title: Docker FAQ
tags:
    - faq
    - docker
---

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
