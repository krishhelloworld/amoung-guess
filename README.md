# todo tasks-:

## 1) deploy the website to render

> Goal: Render *absurd* numbers of dynamic lights in real time  
> Status: 🚧 Experimental / WIP

---

## Overview

> This project explores a **single-pass tiled-based deferred lighting system**
designed to handle *extreme* light counts (10⁸–10⁹ range) using aggressive
culling and GPU-friendly data layouts.
---

### Key Ideas
- [ ] Implement culling
- [ ] Tile depth bounds


---

## Constraints & Targets

| Target | Value |
|------|------|
| Lights | 1,000,000,000 |
| Passes | 1 |
| API | Vulkan / DX12 / TBD |
| Hardware | Modern discrete GPU |

---

## High-Level Pipeline

1. Depth pre-pass
2. Tile generation
3. Light frustum culling
4. Per-tile light lists
5. Deferred lighting evaluation (single pass)

---

## Tiling Strategy

- Screen divided into fixed-size tiles (e.g. 16×16)
- Each tile maintains:
  - Depth bounds
  - Light index list
- Tiles processed independently on GPU

**Tile size tradeoffs**
- Smaller tiles → better culling, more overhead
- Larger tiles → worse culling, fewer dispatches

---

## Light Culling

### Frustum Culling
- Lights rejected if sphere does not intersect view frustum

### Tile Intersection
- Light sphere vs tile frustum test
- Append light index to tile list

> ⚠️ Needs atomic-safe append or prefix sum

---

## Data Layout

### Light Data
```cpp
struct Light {
    float3 position;
    float  radius;
    float3 color;
    float  intensity;
};
```


---

## 4. Markdown tricks that help *a lot*

### Callouts / emphasis
```md
> ⚠️ Important
> 🚧 Work in progress
> 💡 Idea

|L - C| < R



