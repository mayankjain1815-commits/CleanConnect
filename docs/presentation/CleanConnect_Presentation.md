# CleanConnect Presentation

**Author:** Mayank Jain

## Slide 1: CleanConnect


**Speaker notes:** Open with the problem: waste collection is frequent but rarely verified at household level. CleanConnect closes that loop with a QR scan and a GPS geofence.

## Slide 2: Household collection lacks proof

- Missed pickups are hard to prove after the truck has moved on.
- Route-level reporting hides what happened at a specific bin.
- Citizens receive little feedback for correct waste behavior.
- Drivers and administrators lack a shared, timestamped audit trail.
- Hardware-heavy smart-bin systems are costly to scale.

**Speaker notes:** Emphasize that the goal is not just a dashboard, but a verifiable event that can drive accountability and incentives.

## Slide 3: One verified pickup closes the loop

**What makes it different**

- No dedicated bin sensors required.
- Accuracy-aware 50 m geofence with capped GPS tolerance.
- Manual token fallback when the camera is unavailable.
- Reproducible demo data and CI validation.

**Main points**

- Citizen generates a QR token bound to a saved bin location.
- Driver scans at the curb; app checks GPS distance.
- Successful scan awards Civic Points and writes a ledger entry.
- Administrator sees scans, bins, routes, scores, and payroll.

**Speaker notes:** Frame the solution as a workflow, not a collection of screens. Each role gets value from the same scan event.

## Slide 4: A thin client over a typed backend

- React 18 + Vite 7 frontend with role-protected routes.
- PocketBase 0.38 provides auth, REST, SQLite, rules, hooks.
- Migrations define 15+ collections and seed defaults.
- Static frontend can be hosted separately from PocketBase.

**Speaker notes:** The architecture is intentionally simple: a static SPA, a lightweight backend, and a single source of truth in SQLite.

## Slide 5: QR + geofence verification


**Speaker notes:** Walk through the seven steps. Highlight that mismatch and invalid-token states are recorded, not silently ignored.

## Slide 6: Collections behind the workflow

| Collection group | What it stores | Why it matters |
| --- | --- | --- |
| users, citizens, drivers | Identity, role, zone, balances | Role-based access and profiles |
| zones, routes, bins | Service geography and fill level | Route assignment and monitoring |
| bin_qr_tokens, scans | Token, geofence, scan outcome | Verifiable pickup evidence |
| scores, ledger, rewards | Civic Points and redemptions | Incentive loop |
| payroll_adjustments | Strikes and deductions | Driver accountability |

**Speaker notes:** Point out that scan records are the hub: they connect citizen rewards, driver performance, and admin analytics.

## Slide 7: Clear feedback and a visible incentive

- Pickup countdown, token balance, Civic Score arc.
- QR download, print, and regeneration with geofence capture.

**Speaker notes:** Show the citizen dashboard first, then the QR panel. The QR is not decorative; it is the credential for verification.

## Slide 8: Driver and administrator workspaces

- Drivers see assigned route, bins, scans, and wage.
- Administrators see city-wide stats, scan analytics, scores, and payroll.

**Speaker notes:** The same scan event updates both views. This is the operational value for municipalities and startups.

## Slide 9: Civic Points make good behavior visible

- 300-900 bounded score with three tiers: Eco-Novice, Civic Champion, Elite Guardian.
- +15 for a verified pickup, +30 for accurate segregation, +5 streak bonus.
- -50 for a false complaint; every change is written to a ledger.
- Green tokens are redeemable in a rewards store.
- Leaderboard and score arc provide social feedback.

**Speaker notes:** This is the research/behavioral angle: verifiable events make a points system fairer than self-reporting.

## Slide 10: Repository and demo checks

| Check | Method | Result |
| --- | --- | --- |
| Lint | npm run lint | Passed |
| Production build | npm run build | Passed, 2092 modules |
| CI | GitHub Actions on main | 2/2 runs passed |
| Screenshots | 8 pages at 1440 x 900 | Validated |
| Theme | Computed browser styles | Palette confirmed |
| Seed | npm run seed:demo | Idempotent |

**Speaker notes:** Mention that CI runs on every push and that eight screenshots were generated from the live seeded app.

## Slide 11: Reproducible demo dataset

| Artifact | Seeded value |
| --- | --- |
| Demo users | 3 role accounts + local extras |
| Zones / routes | 3 / 1 active route |
| Bins | 6 (stable, critical, overflowing) |
| Active QR token | 1 with saved geofence |
| QR scans | 4 (3 success, 1 mismatch) |
| Civic score | 640, Civic Champion |
| Ledger entries | 3 |
| Rewards / payroll | 6 / 1 |

**Speaker notes:** The seed script is idempotent. It intentionally includes a failed scan so analytics show realistic states.

## Slide 12: Why this fits hackathons, research, and startups

**Potential pilots**

- Residential societies and gated communities.
- Municipal ward-level collection contracts.
- Campus and industrial estate waste programs.
- Partner-led rewards and sustainability programs.

**Main points**

- Hackathon: complete demo, working QR scan flow, polished UI, live GitHub repo.
- Research: reproducible workflow, measurable verification rule, discussable limitations.
- Startup: clear roles, operational analytics, and a path to municipal SaaS pilots.

**Speaker notes:** Adapt the framing to the audience: judges want a demo, researchers want method, investors want a path to deployment.

## Slide 13: Honest constraints and next steps

- Browser GPS can be spoofed or shared; QR tokens can be photographed.
- Camera scan requires permission; manual fallback mitigates failure.
- Proof-of-waste image verification is simulated, not ML-backed.
- Offline collection is not yet supported.
- Location and proof images require consent and retention policies.
- Next: offline queue, server attestation, ML proof, dynamic routing, pilot study.

**Speaker notes:** Be candid. Judges and reviewers value a clear understanding of what is proven and what is future work.

## Slide 14: CleanConnect


**Speaker notes:** Close with the repository link and invite questions. Offer to walk through the QR scan flow live.
