# Homepage startup refinement, 7 November 2026

The homepage keeps its existing geometry, materials, lighting, bloom, resolution,
camera paths and interactions. This change targets blocking startup work.

- Initialize WebGL in separate scheduled tasks instead of one uninterrupted task.
- Prepare environment and scene shaders with Three.js `compileAsync`, which uses
  parallel shader compilation when the graphics driver supports it.
- Keep synchronous shader diagnostics in development builds only.
- Batch each city block once; ground creation previously rebatched the city.
- Skip text-surface measurements and eye/peek updates while Beacon is tucked away.
  Resume the surface cache when the mascot appears, preserving drag and landing.
- Dispose partially initialized rendering resources if graphics setup fails.

Alternating local Chrome runs used complete matching before/after builds, three
samples per viewport (1440 x 900 and 390 x 844). In the two settled desktop pairs,
the longest post-paint startup task fell from 152/157 ms to 53/81 ms. Mobile
before samples had 102/123/141 ms startup tasks; after samples had no post-paint
tasks above the browser's 50 ms long-task threshold. All samples had no uncaught
page errors. The first desktop shader-cache sample had an 8.1-second asynchronous
graphics-ready outlier despite responsive HTML; this is not a total-load-time
improvement claim. Local headless measurements do not guarantee physical-device
frame rate or network latency.

Browser workflow checks cover feature demo routing, navigation, single-click/tap
chat, drag without opening chat, FAQ, dark mode, reduced motion and no-WebGL
fallback. No authentication, dashboard data integration or news logic changes.
