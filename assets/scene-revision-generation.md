# Scene revision: acting, memories and independent room layers

Generated with the built-in image_gen tool. The selected PNGs were copied into this directory without pixel retouching. Transparency is supplied by image_gen. Sprite cells and room layers are composed by Canvas at runtime.

## Files

- [acting-interlude.png](acting-interlude.png): four complete poses — watering, lifting, carrying and placing the seedling.
- [acting-memory.png](acting-memory.png): four complete poses with a printed postcard — intact, torn, scattered and kept close to the heart.
- [room-bare.png](room-bare.png): original room with the two curtains removed and the window behind them reconstructed.
- [room-curtains.png](room-curtains.png): transparent curtain layer in the original full-room coordinates.
- [room-chairs.png](room-chairs.png): transparent fixed foreground chair layer in the original full-room coordinates.

The backplate and chairs never receive the fabric deformation. The chair layer is drawn after the curtains. Camera/parallax applies to the complete room, not to chair pixels separately.

## Interlude

Reference: `acting-natural.png` (identity, outfit, plant and painting style).

First output: `/home/dsslab/.codex/generated_images/01a1d745-3a9d-70f0-9699-0eb356b77291/exec-b6f4510b-5f7a-4ed9-9f5e-97ae0e39ad17.png`.
Selected cleaned output: `/home/dsslab/.codex/generated_images/01a1d745-3a9d-70f0-9699-0eb356b77291/exec-11f7c4f1-0612-4af5-a8cd-3321644aefec.png`.

Exact first prompt:

```text
Use case: illustration-story.
Asset type: square transparent 2 by 2 narrative acting sprite sheet, four complete illustrations for an anime music film.
Reference image is ONLY for ECHO's exact identity, outfit, pot and painterly illustration style. Same cute white bob with pale mint tips, green eyes, daisy clip, ivory hoodie with muted sage sleeves and little green knot emblem, sage pleated skirt, opaque cream tights, sage sneakers. Normal anime proportions, understated gentle expressions, anatomically coherent continuous limbs and garments.
Layout: square canvas with FOUR EQUAL square cells. No drawn borders. EACH complete character and ALL props must fit fully INSIDE the CENTRAL 80 PERCENT of its OWN cell: generous completely transparent top and bottom margins, absolutely no hair curls, shoes, pots or papers crossing a cell boundary. Soft hand-painted anime detail and natural light.
TOP LEFT: ECHO kneeling naturally on one knee in three-quarter right view, watering a small ochre terracotta pot with a four-leaf green seedling standing on the ground immediately to her right. She holds a small sage metal watering can naturally by its handle, spout tilted toward the pot, with a thin clear water stream. Other hand steady on her raised knee. Complete figure including shoes and complete pot.
TOP RIGHT: same position and camera, ECHO lifting that little terracotta seedling pot just off the ground with both hands under its sides, looking attentively down. Same size seedling and pot. No watering can.
BOTTOM LEFT: ECHO upright in three-quarter right view, naturally poised at the end of one small step forward, both hands safely holding the same seedling pot at her waist, elbows close to body. Balanced weight, relaxed shoulders, one heel lightly raised, no extreme lunges. A soft hopeful expression.
BOTTOM RIGHT: ECHO kneeling in three-quarter right view, gently placing the same little pot on the ground on her right with both hands, pot base touching ground, watching the seedling. Different from watering: both hands on pot, no can, more upright body.
Constraints: no background, real transparent alpha, no floor patch, no cast shadow beyond the subjects, no text, no bird, no geometric icons. Keep character identity and clothing exactly, draw props already in correct physical contact with the hands. Exactly four separate complete well-proportioned figures.
```

Exact cleanup prompt, using the first output as edit target:

```text
Edit target: the provided 2 by 2 ECHO acting sheet.
Remove ONLY the pale white/gray haze, halos and washes behind and around the characters, and all ground shadows. The empty canvas between all figures, pots, can and limbs must have genuinely transparent alpha zero. Retain the complete characters, garments, hair, hands, watering can, water and pots exactly. No fog, no white matte, no painted or soft background.
Also fit each complete illustration within its own equal square cell with at least 28px of transparent clearance to every cell edge. The lower-left hair and upper-cell shadows must not cross cell boundaries. Scale and center the COMPLETE illustration as a whole if needed; no anatomy changes, no cropped heads, no cutouts from bodies. Four intact figures; preserve their drawing style, poses, expressions, pot details and colors. Transparent background.
```

## Memories

Reference: `acting-natural.png`.
Selected output: `/home/dsslab/.codex/generated_images/01a1d745-3a9d-70f0-9699-0eb356b77291/exec-9c2a8c0b-2e29-45ac-9d66-d27b9feeb5aa.png`.

Exact prompt:

```text
Use case: illustration-story.
Asset type: square transparent 2 by 2 ECHO acting sheet for a melancholy illustrated music film.
Reference image establishes ECHO's EXACT identity, clothes and painted anime style: short ivory bob with mint tips, green eyes, daisy clip, ivory hoodie with sage sleeves, sage pleated skirt, opaque cream tights, sage sneakers. Cute, normal anime proportions.
Four equal square cells, no borders. Each complete body and its props entirely inside its own cell with generous transparent margin at every boundary, no crossing. Same camera and body position across the TOP TWO cells for a natural cut between them.
TOP LEFT: complete ECHO standing three-quarter right, looking down at a small landscape POSTCARD held gently with both hands at chest height. The postcard has a thin cream paper border and a clearly painted little picture of a warmly lit ARCHED WINDOW with green leaves and a tiny potted sprout. The picture covers the paper, no writing. Fingers wrap naturally around the bottom corners.
TOP RIGHT: SAME complete ECHO body position, same picture held at same chest height, but the postcard is now torn down the middle with a narrow natural jagged tear; two halves are held physically by her two hands, just a few centimeters apart. Both fragments retain the painted arched-window image. She looks startled and quietly hurt, not screaming. Continuous sleeves, natural elbows, five fingers.
BOTTOM LEFT: complete ECHO kneeling on one knee, looking down at three scattered printed botanical postcards on the floor, resting one fingertip on a postcard with a leaf picture. Complete papers drawn with their cream borders and colored botanical sketches, correct floor perspective. Other hand on her raised knee.
BOTTOM RIGHT: same kneeling ECHO, holding one surviving postcard with the little warm arched window and sprout picture close to her heart; other hand resting on her lap. Quietly sad but cute. Full body.
Real transparent alpha zero behind figures and between limbs, NO fog or colored background or ground patch or outside cast shadow. Soft warm natural lighting, hand-painted detail, no geometric overlays, no floating squares, no captions, no birds. Whole intact anatomically coherent drawings.
```

## Room layers

All three edits reference the original `room.png` and preserve its full-room camera coordinates. The original file remains unchanged.

### room-bare.png

Source: `/home/dsslab/.codex/generated_images/01a1d745-3a9d-70f0-9699-0eb356b77291/exec-179960de-ed35-4c22-a067-54dc65ca38dd.png`.
Transparent: false.

```text
Edit target: the provided anime attic room. Make a clean animation BACKPLATE: remove ONLY BOTH hanging ivory curtains at the large window, including their soft fabric folds. Reconstruct the wall, window frame, window glass and conservatory view that were hidden behind the curtains. Preserve the original camera, exact image composition, perspective, warm afternoon brightness, ivy, furniture, every chair and its blanket, desk, floor and all props. Do not change chair positions, proportions, lighting or any object unrelated to the curtains. No new objects. Output the same wide 16:9 full room image. Do not zoom or crop. No character.
```

### room-curtains.png

Source: `/home/dsslab/.codex/generated_images/01a1d745-3a9d-70f0-9699-0eb356b77291/exec-d0526980-0d51-44a7-b2f0-27d04d50a2d7.png`.
Transparent: true.

```text
Edit target: the provided anime attic room. Extract ONLY BOTH hanging ivory window curtains into a genuinely transparent RGBA animation layer. Preserve their exact full-room 16:9 canvas positions, shape, scale, warm light, painted leaf shadows and folds. The left curtain runs from the top at x about 700–1000 to its hem at x 700–835 y 630; right curtain is at the far right. Reconstruct only the few curtain fabric pixels occluded by the wicker chair so the fabric is continuous behind it. EVERYTHING ELSE must be transparent alpha zero: remove chairs, chair blanket, desk, window mullions, floor, plants, outside view, walls and background. Preserve the full wide source camera canvas; do not center or enlarge the curtains, do not tightly crop. No white matte or fog. Only the two warm ivory fabric curtain cutouts, at their original positions on a full-room transparent canvas.
```

### room-chairs.png

Source: `/home/dsslab/.codex/generated_images/01a1d745-3a9d-70f0-9699-0eb356b77291/exec-96f12132-63f9-4516-bd4f-1be40019782d.png`.
Transparent: true.

```text
Edit target: the provided anime attic room. Extract ONLY the wicker armchair with its draped knitted beige blanket and the wooden desk chair with its seat cushion as one foreground animation layer on a fully transparent background. Preserve their EXACT original full-room 16:9 canvas positions, original scale, perspective, lighting and details. Keep all chair backs, wicker curves, chair legs and blanket fringes. All surrounding room, curtain, window, desk, floor, plant foliage and cast shadows outside the chair objects must be fully transparent alpha zero. No fog, no gray backdrop, no white matte. Full wide source canvas with the chairs still positioned in its lower-left region. Do not center, enlarge, move or tightly crop the chairs. Do not add anything.
```


