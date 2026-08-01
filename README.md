# NoTouchWeb landing prototype

A dependency-free, production-oriented landing page prototype for the **“Your hands have better things to do”** direction.

## Run locally

```bash
npm run dev
```

Open `http://localhost:4173`.

## What is functional

- Responsive desktop, tablet, and dedicated mobile art direction.
- HTML/CSS hero overlay on clean photographic crops.
- The monitor screen is a real HTML component, not baked into the image.
- Animated brew guide inside the monitor.
- Camera demo using local frame-difference motion detection.
- Mouse/touch drag and keyboard fallbacks.
- Reduced-motion support and semantic navigation.
- No external dependencies, analytics, uploads, or network calls.

## Asset strategy

- `assets/hero-desktop.webp`: desktop crop with room for coded copy.
- `assets/hero-tablet.webp`: intermediate crop.
- `assets/hero-mobile.webp`: dedicated mobile crop that excludes the embedded concept copy.

The physical monitor remains in the photograph; its screen is replaced by a positioned HTML mini-browser so the content can be changed and animated without regenerating the art.

## Next production steps

1. Replace the prototype camera motion detector with the existing MediaPipe gesture engine.
2. Wire the Install CTA to the Chrome Web Store listing.
3. Add product analytics only after the interaction model is finalized.
4. Move the static implementation into the final Next.js app if that remains the target stack.
