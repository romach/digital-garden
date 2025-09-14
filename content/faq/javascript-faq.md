---
title: JavaScript FAQ
date: 2025-09-15
tags:
    - javascript
    - faq
---

## How to use template literals?

```js
const firstName = 'John';
const lastName = 'Doe';
const fullName = `${firstName} ${lastName}`; // John Doe

// The same code using string concatenation
const fullName = firstName + ' ' + lastName; // John Doe
```

### When to use?

When you need to concatenate strings

## How to inject JavaScript into HTML?

```html
<html>
  <body>
    <script type="module">
      console.log("Hello World!")
    </script>
  </body>
</html>
```

- paste the JavaScript code inside the `<script>` tag.
- use `type="module"` to indicate that the script should be treated as a JavaScript module.

## DOM API

```js
// create an element
document.createElement('div');
// set element's text
element.textContent = 'Hello, world!';
// append element to the body
document.body.append(element);
// get element by id?
document.getElementById('myElement');
// specify the element’s class?
element.className = 'my-class';
```
