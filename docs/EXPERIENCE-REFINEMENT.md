Experience refinement, 2026-11-06

Preserved the cinematic neighbourhood, camera compositions, illustrated pillar cards,
Syne/DM Sans typography, theme/cursor preferences, existing routes and dashboard logic.

Refined the narrative copy and Belonging bridge; made pillar previews task-specific;
consolidated repeated recognition content using native details disclosures; added
verification/privacy explanations grounded in the current review flow and policy.
Organisation concepts are labelled as enquiries/proposals rather than launched tools.

Navigation now has unique numbering, account/demo actions separate from preferences,
a visible sign-in shortcut, a trust shortcut and current-section states. The mascot
opens with a single click/tap and distinguishes dragging; its hidden initial state
is excluded from keyboard focus. Reduced-motion static scene redraws are avoided,
while explicitly requested story playback remains available. WebGL text fallback
tabs remain interactive. Policy/credits contrast was corrected without changing
account, verification, messaging, live news or API behavior.

Validation:
- npm run build
- python tests/browser_workflows.py
- python tests/experience_refinement.py
- Nine viewport visual captures, ten demo destinations at three widths, Edge
  keyboard checks, touch gesture checks, WebGL fallback and light/dark axe checks.

Full audit, 19-section change log, before/after screenshots and measured limitations
are in the session output: outputs/refinement-20261106/Refinement-Report.md and
Visual-Comparison.html. The refinement has not been deployed.
