---
title: How to install Java
date: 2025-09-13
tags:
   - java
---
<!-- steps -->
1. [install SDKMAN!](how-to-install-sdkman)

2. ```bash
   sdk install java 21.ea.35-open
   ```
   Installs Java 21.

3. ```bash
   java --version
   ```
   Check Java installation.

## Configure a specific Java version for a project

<!-- steps -->
1. Add `.sdkmanrc` file to the project directory.
    
   ```ini
   java=21.ea.35-open
   ```

2. Enable switching SDK versions automatically when you `cd` into a directory

   ```ini
   sdkman_auto_env=true
   ```

3. After setting up the `.sdkmanrc` files, SDKMAN! will automatically switch to the required Java version when you `cd` into the project directories.

   If specified Java version is not installed, SDKMAN! will prompt you to install it.

   Run to install it:

   ```bash
   sdk env install
   ```   

## Links

- [JDK Distributions](https://sdkman.io/jdks) 
