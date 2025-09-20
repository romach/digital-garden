---
title: Git FAQ
tags:
    - git
    - faq
---

## How to configure user email and username for local git repository?

```bash
git config user.name "Your Name Here"
git config user.email your@email.example
```

**When to use?**
- When you need to set up your username and email for commits.

## How to configure global user email and username?

```bash
git config --global user.name "Your Name Here"
git config --global user.email your@email.example
```

**When to use?**
- When you need to set up global username and email for all local repositories.

## How to check access to GitHub?

```bash
ssh -T git@github.com
```
