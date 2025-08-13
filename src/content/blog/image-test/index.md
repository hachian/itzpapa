---
title: 'Image Processing Test'
description: 'Testing how Astro processes markdown images'
pubDate: '2025-01-13'
---

# Testing Image Processing in Astro

## Regular Markdown Image

This is a regular markdown image:

![Alt text for test image](./test-image.png)

## Image with title

![Another test image](./another-image.jpg "Image title")


## External images

![External image](https://blog.hachian.com/imgs/check-site-design/image.webp)

## Wikilink images

![[test-image.png]]

![[another-image.jpg|Alt text for wikilink]]

## Wikilink images with different paths

![[../link-test/blog-placeholder-3.jpg]]

![[blog-placeholder-3.jpg|Placeholder image]]