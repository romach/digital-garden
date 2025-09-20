---
title: How to install Node.js
tags:
   - javascript
---

## Install Node Version Manager (NVM)?

<!-- steps -->
1. Install Curl
   ```bash
   sudo apt install -y curl
   ```
2. Run the installation script
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
   ```
3. Reopen the terminal or run
   ```bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
   ```

## Install Node.js

```bash
nvm install 22.12.0
```

## Setup specific Node.js for a project

```ini title=".nvmrc"
22.12.0
```

