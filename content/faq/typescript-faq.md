---
title: TypeScript FAQ
tags:
    - typescript
    - faq
---

## What does `typeof` operator do?

The `typeof` operator returns the data type of a variable or an expression. It is a unary operator that is placed before its operand.

```typescript
const book = {
  title: 'JavaScript',
  author: 'John Doe',
};
console.log(typeof book); // object
```

## What does `keyof` operator do?

The `keyof` operator returns the keys of a type. It is used to get the keys of an object type.

```typescript
type Book = {
  title: string;
  author: string;
};

type BookKeys = keyof Book; // 'title' | 'author'
```
