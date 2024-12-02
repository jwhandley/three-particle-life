# Particle life simulation written in Three.js and Typescript

Inspired by [Tom Mohr's video](https://youtu.be/p4YirERTVF0?si=cGEOoQ1r9UA0s7uW), I made an implementation using Three.js and Typescript.

## The simulation

I largely retained the same logic as in the video, though I used a quadtree for implementing the spatial partitioning instead of a grid since I was able to achive better results with this at the cost of some complexity.