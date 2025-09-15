---
title: How to install Java
tags:
   - java
---
<!-- steps -->
1. [Install SDKMAN!](how-to-install-sdkman)

2. Choose Java version [here](https://sdkman.io/jdks/)

3. Install the chosen Java version

   ```bash
   sdk install java 24.0.2-tem
   ```

4. Check Java installation

   ```bash
   java --version
   ```

## Configure a specific Java version for a project

<!-- steps -->
1. Add a `.sdkmanrc` file to the project directory

   ```ini title=".sdkmanrc"
   java=21.ea.35-open
   ```

2. Enable switching SDK versions in SDKMAN! config

   ```ini title="~/.sdkman/etc/config"
   sdkman_auto_env=true
   ```

3. After setting up the `.sdkmanrc` files, SDKMAN! will automatically switch to the required Java version when you `cd` into the project directories.

   If the specified Java version is not installed, SDKMAN! will prompt you to install it.

   Run to install it:

   ```bash
   sdk env install
   ```
