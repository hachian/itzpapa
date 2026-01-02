---
title: Markdown Syntax Guide
description: A comprehensive guide to standard Markdown syntax supported in itzpapa blog
category: Tutorial
tags:
  - markdown
  - tutorial
  - demo
published: 2025-12-20T00:00:00.000Z
---

# Markdown Syntax Guide

This page demonstrates the standard Markdown syntax supported in itzpapa blog. Each section shows both the syntax and the rendered output side by side.

## Headings

### Syntax

```markdown
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
```

### Output

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

---

## Paragraphs and Line Breaks

### Syntax

```markdown
This is the first paragraph.
A line break within the same paragraph continues on the next line.

An empty line creates a new paragraph.
Paragraphs have more spacing between them.
```

### Output

This is the first paragraph.
A line break within the same paragraph continues on the next line.

An empty line creates a new paragraph.
Paragraphs have more spacing between them.

---

## Text Emphasis

### Syntax

```markdown
**Bold text**
*Italic text*
***Bold and italic***
~~Strikethrough~~
```

### Output

**Bold text**
*Italic text*
***Bold and italic***
~~Strikethrough~~

> [!note]
> In this blog, bold and italic have custom styles that override the browser defaults. Bold text appears with enhanced weight, and italic text has distinctive styling for better readability.

---

## Lists

### Unordered Lists

#### Syntax

```markdown
- Item 1
- Item 2
  - Sub-item 2.1
  - Sub-item 2.2
- Item 3
```

#### Output

- Item 1
- Item 2
  - Sub-item 2.1
  - Sub-item 2.2
- Item 3

### Ordered Lists

#### Syntax

```markdown
1. First item
2. Second item
   1. Sub-item 2.1
   2. Sub-item 2.2
3. Third item
```

#### Output

1. First item
2. Second item
   1. Sub-item 2.1
   2. Sub-item 2.2
3. Third item

### Task Lists

#### Syntax

```markdown
- [x] Completed task
- [ ] Incomplete task
- [ ] Another task
```

#### Output

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

---

## Links

### Syntax

```markdown
[External link](https://example.com)
[Link with title](https://example.com "Example Site")
<https://example.com>
[Internal link](/blog/)
```

### Output

[External link](https://example.com)
[Link with title](https://example.com "Example Site")
<https://example.com>
[Internal link](/blog/)

---

## Blockquotes

### Syntax

```markdown
> This is a blockquote.
> It can span multiple lines.
>
> You can also separate paragraphs.

> Nested quote
>> Double nested
>>> Triple nested
```

### Output

> This is a blockquote.
> It can span multiple lines.
>
> You can also separate paragraphs.

> Nested quote
>> Double nested
>>> Triple nested

---

## Horizontal Rules

### Syntax

```markdown
---
***
___
```

### Output

---

***

___

## Code

### Inline Code

#### Syntax

```markdown
Use backticks to create `console.log("Hello")` inline code.
```

#### Output

Use backticks to create `console.log("Hello")` inline code.

### Code Block (No Language)

#### Syntax

````markdown
```
function hello() {
  return "Hello, World!";
}
```
````

#### Output

```
function hello() {
  return "Hello, World!";
}
```

### Code Block (Syntax Highlighting)

#### Syntax

````markdown
```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}
```
````

#### Output

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}
```

#### TypeScript

```typescript
interface User {
  name: string;
  age: number;
}

const user: User = {
  name: "John Doe",
  age: 30
};
```

#### Python

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("World"))
```

---

## Tables

### Basic Table

#### Syntax

```markdown
| Header 1  | Header 2  | Header 3  |
|-----------|-----------|-----------|
| Cell 1-1  | Cell 1-2  | Cell 1-3  |
| Cell 2-1  | Cell 2-2  | Cell 2-3  |
```

#### Output

| Header 1  | Header 2  | Header 3  |
|-----------|-----------|-----------|
| Cell 1-1  | Cell 1-2  | Cell 1-3  |
| Cell 2-1  | Cell 2-2  | Cell 2-3  |

### Column Alignment

#### Syntax

```markdown
| Left      | Center    | Right     |
|:----------|:---------:|----------:|
| Left      | Center    | Right     |
| Text      | Text      | Text      |
```

#### Output

| Left      | Center    | Right     |
|:----------|:---------:|----------:|
| Left      | Center    | Right     |
| Text      | Text      | Text      |

---

## Images

### Basic Image Embedding

#### Syntax

```markdown
![Sample image](./sample-image.jpg)
```

#### Output

![Sample image](./sample-image.jpg)

### Image with Alt Text

Alt text is displayed when the image cannot be loaded and is read by screen readers for accessibility.

```markdown
![itzpapa sample image - Blog demo](./sample-image.jpg)
```

![itzpapa sample image - Blog demo](./sample-image.jpg)

---

## Summary

This page covered the standard Markdown syntax available in itzpapa blog. By combining these elements, you can create well-structured and readable content.

For Obsidian-specific syntax (WikiLinks, highlights, Callouts), see the [Obsidian Syntax Guide](../obsidian-syntax-demo/index).
