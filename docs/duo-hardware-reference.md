# Duo hardware reference — 2026-10-19

The first studio film put the cover display on the camera-bearing half. This
revision corrects the original Blender model using Apple's published product
photography and dimensional diagrams. The approved film timing, studio lighting,
native app textures and reading close-up remain the direction.

## Coordinate convention

All model left/right labels mean **looking at the unfolded inner display**, with
the device upright and its hinge vertical:

| Surface | Left leaf | Right leaf |
| --- | --- | --- |
| Inner face | Left half of the continuous display | Right half of the continuous display |
| Outer face | Cover display and top-right outer camera | Ceramic back and dual rear cameras |
| Film movement | Folds over the right leaf | Remains fixed relative to the assembly |

Seen from the rear, these positions reverse: cameras on the viewer's left,
cover display on the viewer's right. The outer screen's UVs must read normally
from outside; never mirror app text to change the folding direction.

## References inspected

- [Apple product overview](https://www.apple.com/iphone-duo/): front, rear,
  partially folded, open, standing and hinge photographs.
- [Rear camera close-up](https://www.apple.com/v/iphone-duo/d/images/overview/camera/hero_right__gk9rwhz4kdqq_large.jpg):
  horizontal two-lens plateau, flash, microphone, top volume keys and side controls.
- [Cover display close-up](https://www.apple.com/v/iphone-duo/d/images/overview/camera/hero_left__cpq2rhkwqzqu_large.jpg):
  opposite leaf, vertical camera island at the outer display's top right.
- [Hinge and exterior](https://www.apple.com/v/iphone-duo/d/images/overview/product-viewer/durability__d8uh14wcv2oi_large.jpg):
  continuous hinge cover, reflective rails, camera/display separation.
- [Buttons and connectors diagram](https://www.apple.com/v/iphone-duo/d/images/specs/external_connectors__fjf6vf5ap02m_large.jpg):
  top and bottom grilles, USB-C, side controls.
- [Technical specifications](https://www.apple.com/iphone-duo/specs/): unfolded
  164.6 × 117.8 × 5.2 mm; folded 84.1 × 117.8 × 11.3 mm. Inner resolution
  2670 × 1878 in landscape; outer resolution 1398 × 2034 in portrait.

## Implemented model corrections

- Cover screen parented to the left leaf, cameras to the right.
- Left leaf rotates 180° closed to 0° open, about the glass-adjacent hinge.
- Body proportions follow the published dimensions, with a 0.9 mm total
  clearance between the two 5.2 mm halves when folded.
- Outer camera island, dual rear lens housing, flash, microphone, volume keys,
  side controls, grilles and USB-C recess are modeled separately from app pixels.
- No visible camera cutout is added to the inner screen; Apple's inner camera
  is under the display.
- The hinge skin joins the transformed rear edges at every frame. A sweep
  sampled 180 fold angles and 1001 points per cross-section, including the
  outward shell thickness: no crossings of either active inner display plane.
  A separate reviewer checked the half mapping and intermediate-fold stills.

This remains an original visual model, not engineering CAD or Apple-supplied
geometry. Small mechanical details are interpreted from photographs. The
reference images are linked here, not redistributed as site artwork.

## Inspect before encoding

`film/blender/studio.py` supports `--view inner`, `rear`, `hinge`, `top` and
`bottom` for repeatable still inspections. Use `--frame 1` for the closed pose,
`--frame 45` for unfolding and `--frame 121` for the open pose. The default
`--view film` keeps the website's approved composition.

Local inspection stills are under `.local/review/geometry-*.png`.
