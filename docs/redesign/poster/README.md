# Redesign proposal: "Poster"

Branch: `redesign/poster`

## Concept

Loud, confident and typographic. The International Typographic Style meets kinetic type: a
strict 12-column grid (drawn faintly behind every page), flush-left rag, numbered sections
`(01)…(06)` and mono labels, huge uppercase display type, and nothing decorative that
isn't type or a flat geometric motif. Every section is set like a Swiss poster.

- **Palette:** off-white paper `#f2f0ea`, near-black ink `#121211`, and one saturated signal
  colour `#ff4a1c`. Dark mode swaps paper and ink; the signal stays. There are no gradients
  and no other hues.
- **Type:** one variable grotesk, _Anybody_, using weight 100–900 and width 50–150. Width is
  the expressive axis: the wordmark is justified by width alone, and scroll velocity squeezes
  the poster headlines. _JetBrains Mono_ sets the small labels, indices and code.
- **Mood:** it reads like a printed poster series that someone scrubs through.

## The memorable thing: liquid type

The hero is **NILS LUTZ**, set as large as the viewport allows. SplitText assembles the
letters on load (each rises out of a mask while its width axis grows from 50 to its fitted
value). The fitted DOM glyphs are then drawn into a mask texture that sits on a full-bleed
Three.js shader plane. A low-res ping-pong buffer stores a damped spring field
(displacement plus velocity), and the cursor or finger splats velocity into it along the
path it travelled. The field self-advects so the ink smears like a viscous fluid. The
leading and trailing edges print in the signal colour with an RGB/misregistration split,
and a spring pulls the letters back into shape with a small overshoot. One scripted stroke
through the letters at the end of the load shows that the sheet is liquid. Scroll velocity
also drags the sheet a little.

The DOM `<h1>` stays in place (transparent but selectable, and read by assistive tech and
search engines), so the WebGL layer is purely visual.

## Scenes (home)

1. **Hero:** liquid type, a one-time orchestrated load, and CTAs.
2. **Statement:** the bio sentence. Scroll scrubs each word's weight axis from hairline
   to black. Word boxes are locked to their heaviest width, so the text never reflows. The
   five principles follow as black tags.
3. **Poster sequence:** a pinned horizontal scroll made of an index poster, three service
   posters (each with a geometric motif), four featured case-study posters (tabular metrics,
   tags, CTA) and an "All case studies" poster. Panel colours rotate ink, signal and paper.
   Scroll velocity scrubs the `wdth`/`wght` axes of the headlines (they narrow and lighten
   while moving fast). Boundaries between panels are a **WebGL shader wipe**: a
   noise-displaced liquid edge with a misregistered signal hairline that swells with
   velocity.
4. **Tech-stack marquee:** two opposing bands (solid and outline). Their speed and
   direction follow Lenis velocity.
5. **Writing index:** the latest notes as numbered index rows.
6. **Closing poster:** a signal-colour contact block with a small interactive Rive
   machine, printed as a duotone (greyscale artwork multiplied onto the signal colour).
   Press "Insert data" and it processes a card.

Inner pages (about, work, work/[slug], notes, notes/[slug], tools, contact, legal pages)
use the same language: a numbered label, a huge width-fitted display title, grid index
rows, an ink band for key outcomes, and readable MDX prose with shiki (incl. `cds` and
`abapcds`).

## Tech notes

- **GSAP 3.15** handles ScrollTrigger (pin + scrub) and SplitText. **Lenis** is driven
  from `gsap.ticker` (`lenis.on('scroll', ScrollTrigger.update)`, `lagSmoothing(0)`), and
  both WebGL engines render from the same ticker.
- **Three.js** runs the two engines: `components/specialized/liquid-type-engine.ts` and
  `poster-wipe-engine.ts`. Both are client-only, dynamically imported, and disposed on
  unmount (`forceContextLoss`). Colours come from CSS tokens and follow theme changes.
  Uniforms are linear and are encoded to sRGB in the shader, so WebGL panels match the CSS
  colours exactly.
- **Performance:** DPR is capped at 1.5 on phones and 2 on desktop. The sim resolution is
  lower on touch devices. Rendering pauses when a scene is offscreen or the tab is hidden,
  and the hero sheet sleeps once the field has come to rest. Without WebGL2 the DOM
  wordmark and CSS panel colours simply remain.
- **Touch:** the hero reacts to `touchstart`/`touchmove` (passive, so the page still
  scrolls). Pointer gain and scroll coupling are gentler on touch devices.
- **Reduced motion:** no Lenis, no pin or scrub, no liquid layer, no marquee motion. The
  poster sequence stacks vertically and all content is static and readable.
- **Motion** (`motion/react`) handles micro-interactions: the navbar, theme icon swap
  (spring, bounce 0) and filter layout. The skill's rules are applied throughout: scale
  0.96 on press, interruptible transitions, tabular numbers, `text-wrap: balance/pretty`,
  shadows instead of borders, and hit areas of at least 40px.
- **Rive:** `@rive-app/react-canvas-lite` plays the MIT-licensed "Little Machine" example
  asset from rive-app/rive-flutter (17 KB). The lite WASM runtime (~860 KB, ~350 KB gzip) is
  self-hosted in `public/rive/`, because the runtime CDN is not reachable everywhere. It is
  fetched only when the figure nears the viewport. The license notice is in
  `public/rive/LICENSE.txt`.
- **Dependencies added:** `gsap`, `lenis`, `three` (+ `@types/three`), `motion`,
  `@rive-app/react-canvas-lite`. **Removed:** `framer-motion`, `@tsparticles/react`,
  `@tsparticles/slim`.

## Screenshots

- `01-hero-liquid-type-desktop.png`: the cursor dragged through the wordmark (1440×900)
- `02-poster-sequence-wipe-desktop.png`: the ink-to-signal shader wipe between posters
- `03-case-study-poster-desktop.png`: a case-study poster with tabular metrics
- `04-hero-swipe-mobile.png`: a finger swipe through the wordmark (390×844)

## Known limits

- The liquid sim is a damped spring field with self-advection, not a full Navier–Stokes
  solver. That keeps it cheap on phones.
- Headless screenshots use SwiftShader. Real GPUs render the same frames, only faster.
- The horizontal pin is long (9 panels). On very short landscape phones the posters are
  dense but still readable.
- The Rive WASM runtime is the largest single asset on the page, which is why it loads
  lazily.
