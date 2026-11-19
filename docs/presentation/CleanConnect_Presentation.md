# CleanConnect Presentation

**Author:** Mayank Jain

## Slide 1: CleanConnect


**Speaker notes:** Start with the situation: a truck can pass a street and one house may still say its bin was not collected. We built a simple scan flow around that moment.

## Slide 2: The problem is small but real

- A missed bin is hard to prove after the truck leaves.
- Route-level reports do not show what happened at one house.
- Citizens get little feedback when they do the right thing.
- Drivers and admins do not share one clear record of the pickup.
- Smart-bin hardware helps, but putting sensors on every bin is expensive.

**Speaker notes:** Do not oversell this. Say we were trying to solve a narrow, everyday problem, not redesign the whole waste industry.

## Slide 3: One scan at the bin

**What we actually did**

- No extra hardware on the bin.
- 50 m radius plus up to 30 m GPS accuracy buffer.
- Camera scan with a manual fallback.
- Seeded demo data so the flow is easy to show.

**Main points**

- Household gets a QR token tied to its saved bin location.
- Driver scans it or types the token by hand.
- App checks GPS distance and saves a scan result.
- A good scan adds 15 Civic Points to the household.

**Speaker notes:** Explain this as a flow, not as a list of screens. The same scan record is what the citizen, driver and admin views all use.

## Slide 4: How the app is put together

- React 18 and Vite 7 frontend with role-protected routes.
- PocketBase 0.38.0 handles auth, REST, rules and hooks.
- 14 custom collections plus the built-in users collection.
- The browser computes the distance and posts the result.

**Speaker notes:** Point out that this is a simple setup: a static frontend and one small backend. Also be honest that the distance check is client-side for now.

## Slide 5: The scan check


**Speaker notes:** Walk through the seven steps on the diagram. Mention that success, mismatch and invalid token are all saved. The backend currently trusts the distance value sent by the browser.

## Slide 6: What is stored

| Collection group | What it stores | Why it matters |
| --- | --- | --- |
| users, citizens, drivers | Identity, role, zone, balances | Login and workspaces |
| zones, routes, bins | Service area and fill levels | Route and bin views |
| bin_qr_tokens, scans | Token, geofence, scan status | Pickup record |
| scores, rewards | Civic Points and redemptions | Incentives that work |
| ledger, payroll | Admin-only rows and wage data | Currently limited in UI |

**Speaker notes:** Keep this short. The scan table is the centre of the design; the reward and admin screens just read from it.

## Slide 7: What the citizen sees

- Countdown, token balance and score arc in one place.
- QR can be downloaded, printed or rotated with a new geofence.

**Speaker notes:** Show the dashboard first, then the QR panel. The QR is the credential, not just a picture.

## Slide 8: Driver and admin views

- Drivers see the route, scans, strikes and wage.
- Admins see bins, scans, scores and stored payroll rows.

**Speaker notes:** The driver performance tracker shows strikes and wage; the scan list is a separate card. The admin payroll table is read-only in this version.

## Slide 9: Civic Points, with clear limits

- Score runs from 300 to 900 with three tiers.
- Only +15 for a scan and +30 for a proof upload are triggered.
- +5 streak and -50 false complaint are defined but not used by the UI.
- Green tokens can be redeemed in the rewards store.
- The admin leaderboard has a placeholder trend arrow.

**Speaker notes:** This is a good place to show honesty. Say what works and what is only configured, instead of pretending the whole reward model is live.

## Slide 10: What we checked

| Check | Method | Result |
| --- | --- | --- |
| Lint | npm run lint | Passed |
| Production build | npm run build | Passed; ~93 kB CSS, ~798 kB JS |
| CI | GitHub Actions, push and PR | Workflow defined; history external |
| Screenshots | 8 screens at 1440 x 900 | Captured from seeded app |
| Seed | npm run seed:demo | Repeatable; some rows recreated |
| Proof upload | Camera file-picker demo | Simulated; no AI model |

**Speaker notes:** CI runs on pushes and pull requests. I am not claiming a fixed run count because that history lives on GitHub, not in the repo.

## Slide 11: Seeded data for the walkthrough

| Artifact | Seeded value |
| --- | --- |
| Demo users | 3 role accounts |
| Zones / routes | 3 / 1 active route |
| Bins | 6 |
| Active QR token | 1 with saved geofence |
| QR scans | 4 (3 success, 1 mismatch) |
| Civic score | 640, Civic Champion |
| Ledger entries | 3, seeded with superuser access |
| Rewards | 6 (4 seed + 2 migration) |
| Payroll | 1 stored row; wage shown from strikes |

**Speaker notes:** The seed script is repeatable. It includes one failed scan on purpose so the analytics screen is not all green.

## Slide 12: Where this could fit

**Possible first pilots**

- Residential societies and gated communities.
- A single municipal ward or campus.
- Waste programs with a partner rewards brand.
- Small contracts where pickup proof matters.

**Main points**

- Hackathon: short live demo using the seeded accounts.
- Research: clear method and limits that can be discussed.
- Startup: role model and dashboards that can be piloted.

**Speaker notes:** Match the pitch to the room. Judges care about the demo, researchers care about the method, and startup people care about a realistic first pilot.

## Slide 13: What is not done yet

- Browser GPS can be spoofed; QR codes can be shared.
- Proof image check is simulated, not machine learning.
- Ledger writes fail for normal users under current rules.
- Payroll has no create or edit screen.
- No offline queue, so weak networks are a problem.
- Next: server checks, real image model, offline mode, pilot study.

**Speaker notes:** Be direct about the gaps. It makes the rest of the presentation more believable.

## Slide 14: CleanConnect


**Speaker notes:** End with the GitHub link and invite questions. If someone asks about accuracy, point to the limitations slide instead of bluffing.
