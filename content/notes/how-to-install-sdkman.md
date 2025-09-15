---
title: How to install SDKMAN!
---
[SDKMAN!](https://sdkman.io/) is a tool for managing parallel versions of multiple Software Development Kits on Unix-based systems. It's useful for installing multiple versions of Java, Maven, Spring Initializer, etc.

## Steps to install SDKMAN!

<!-- steps -->
1. ```bash
   sudo apt install -y unzip zip curl
   ```
   Installs curl, unzip, and zip.
   - The `curl` tool is required to download the installation script.
   - The `unzip` and `zip` tools are used in the installation script.

2. ```bash
   curl -s "https://get.sdkman.io" | bash
   ```
   Downloads and executes the installation script.

3. ```bash
   source ~/.sdkman/bin/sdkman-init.sh
   ```
   Completes the installation.

## More details

To check the SDKMAN! version, run:

```bash
sdk version
```
