# CleanConnect: QR and GPS Based Pickup Verification for Waste Collection

**Author:** Mayank Jain  
**Affiliation:** Independent student project

## Abstract

In most neighbourhoods, waste collection is still tracked very roughly. A truck can pass a street and a household may still say its bin was not emptied, while the driver has no easy way to prove what happened. CleanConnect is a small web app we built around one verifiable pickup. Each household gets a QR token tied to the saved location of its bin. The driver scans it at the curb, the app reads GPS, checks the distance, and saves the result as a scan record. A successful pickup adds Civic Points to the citizen's score and shows up in the driver and admin views. The frontend uses React and Vite, and PocketBase handles login, the database and the REST API. We checked the lint and production build, ran the demo seed script, and captured eight screenshots from the running app. This is still a prototype. The distance check runs in the browser, the proof-image check is simulated, and two of the configured point reasons are not triggered by the interface yet. Those limits are stated here instead of being hidden.

**Index Terms:** QR code, GPS, geofencing, waste collection, civic points, PocketBase, React

## I. INTRODUCTION

The idea for CleanConnect came from a small but common problem. A garbage truck may pass a street, yet one household can still say its bin was never emptied. The driver also has no simple way to show that the bin was collected. Most systems only track the route as a whole, so the exact handoff at one house is usually lost.

Instead of putting a sensor in every bin, we tried a cheaper approach. Each household gets a QR sticker tied to the saved location of the bin. The driver scans it while collecting, the app takes a GPS reading, and the distance to the bin is calculated. The result is saved as a scan with a status, distance and timestamp. A good scan adds Civic Points to the citizen's score and also appears in the driver and admin views.

The app has three workspaces. Citizens can generate a QR code, see their score and rewards, and upload a proof photo. Drivers see a route and scan bins. Administrators see bins, scans, scores and wage-related numbers. One point should be clear from the start: the distance check is done in the browser. PocketBase stores what the client sends, but it does not re-check the distance. That is acceptable for a prototype, not for a real municipal rollout.

The following sections explain the related work, the design, what we actually implemented, and what we tested. We have also listed the parts that are still simulated or unfinished, because claiming otherwise would be misleading.

## II. BACKGROUND AND RELATED WORK

Most smart-waste ideas in the literature add hardware to bins. Surveys describe fill-level sensors, GPS trackers on trucks and central dashboards [1], [2]. Those systems can work well, but every bin needs a device, a battery and maintenance. We wanted to see how far we could get with things people already carry: a printed QR code and a phone with location enabled.

Work on civic gamification shows that points and feedback can encourage better participation [3], [4]. CleanConnect uses that idea through Civic Points, three score tiers and a small rewards store. The points are meant to follow a scan event rather than a self-report, although the scan itself is still client-side at this stage.

The distance check uses the Haversine formula, which is a standard way to measure distance between two latitude and longitude points [5]. The browser Geolocation API gives both a position and an accuracy estimate [9]. We use a 50 m radius and add the reported accuracy up to 30 m more, so small GPS errors do not reject a real pickup.

We built the client with React and Vite [6], [7], styled it with Tailwind CSS [8], and used qrcode.react and jsQR for QR generation and scanning [10], [11]. PocketBase [12] was chosen because it gives authentication, a database, REST routes, migrations and hooks in one small server.

## III. SYSTEM ARCHITECTURE

CleanConnect is a normal client-server app with three roles sharing one React frontend. Protected routes send each user to the right workspace. The citizen area holds the bin QR tool and score cards. The driver area holds the route and scanner. The admin area holds the wider operational view.

Figure 1 shows the whole setup. The frontend talks to PocketBase over REST. PocketBase handles login, collection rules, migrations and hooks. The database stores users, bins, QR tokens, scans, scores, rewards, verifications and payroll-related records.

![CleanConnect system architecture](figures/architecture.png)

| Collection | Purpose | Key fields |
| --- | --- | --- |
| users | Identity and role | email, role, zone_id, truck_number |
| citizens / drivers | Profiles and balances | green_tokens, neighborhood, truck, strikes |
| zones / routes | Service geography | zone_name, assigned_date, collection_status |
| bins | Collection points | zone_id, fill_level, status, last_cleared |
| bin_qr_tokens | Rotatable bin credentials | qr_token, geofence_lat/lng, is_active |
| driver_qr_scans | Client-checked pickup record | scan_status, distance_meters, is_location_valid |
| civic_scores / ledger | Score plus admin-only ledger | current_score, tier_rank, points_changed, reason |
| rewards / redemptions | Token economy | token_cost, tokens_spent, redemption_date |
| payroll_adjustments | Stored wage snapshot | strike_count, deduction_amount, final_wage |

### A. Frontend

The client uses React 18, React Router 7, Tailwind CSS 3, Radix-based components, Recharts, Framer Motion and Sonner. The theme is written as CSS variables and Tailwind tokens: burgundy #590907 for main surfaces, cream #E8D2B5 for text and buttons, and sage #A5A79B for softer text and borders. If no development URL is set, the client falls back to the /hcgi/platform PocketBase path used by Hostinger-style deployments.

### B. Backend and data model

PocketBase 0.38.0 provides the built-in users collection and 14 custom collections created through migrations. A few migrations also seed default rewards and demo records. The hooks folder contains migration helpers, dashboard routing and mailer behaviour. Table I lists the collections that matter most to the pickup flow.

### C. Role-based workflows

The role routes are /citizen-dashboard, /driver-dashboard and /admin-panel. The /instructions route redirects to a guide for the signed-in role. Settings and profile pages are shared, but the dustbin QR tab only appears for citizens. Scan analytics and wage views are kept in the admin and driver workspaces.

## IV. IMPLEMENTATION AND METHODOLOGY

The main idea was to avoid extra bin hardware and keep the flow easy to demo. Figure 2 shows the path from token creation to the scan record.

![QR verification workflow](figures/qr-flow.png)

### A. QR token lifecycle

In Profile -> My Dustbin QR, the citizen asks for a token. The browser joins the citizen id, house address, current time and a UUID, then hashes that string with SHA-256 through the Web Crypto API. The result is a 64-character hex token. The bin's saved latitude and longitude are stored beside the token, not inside the hash. Creating a new token deactivates the earlier active ones, and the code can be downloaded or printed.

### B. Geofence verification

The driver can scan the QR with the camera using jsQR or type the token by hand. The browser asks for a high-accuracy GPS reading and calculates the Haversine distance to the bin. The allowed radius is 50 m plus the device accuracy, capped at 30 m extra. The scan is saved as success, location_mismatch or invalid_token with the driver, citizen, coordinates, distance and validity flag. Camera errors and token lookup errors are caught. A missing GPS reading currently falls through to a generic error toast, which is one of the rough edges we know about.

### C. Civic Score and rewards

The score is bounded between 300 and 900. The point map defines +15 for a verified pickup, +30 for an accurate segregation proof, +5 for a streak bonus and -50 for a false complaint. In the running app, only the first two are actually triggered: +15 after a successful scan and +30 after a proof upload. The streak and complaint values exist in the map and as a filter label, but no interface action awards or deducts them yet. Scores map to Eco-Novice below 551, Civic Champion from 551 and Elite Guardian from 751.

The code tries to write a ledger row after every score change. The ledger collection only allows admins to create rows, so normal citizen and driver calls fail silently and the warning is logged in the console. The three ledger rows in the demo were written with superuser access during seeding. Citizens can still redeem green tokens in the rewards store, and redemptions plus token debits do work.

### D. Analytics and payroll

The admin panel shows bin fill levels, scan analytics with status filters and sorting, and a neighbourhood score leaderboard. The leaderboard's small trend arrow is placeholder data, not a real calculation. Payroll numbers are worked out in the browser from the driver's strike count and base wage. The payroll_adjustments collection stores strike counts, percentages, amounts and final wage, but there is no admin screen to add or edit those rows. Drivers see strikes, deduction and final wage in the performance tracker; today's scans are listed in a separate card.

### E. Validation setup

The seed script gives us a repeatable demo: three role accounts, citizen and driver profiles, three zones, six bins, one active QR token, a route, four scans, a score with three ledger rows, rewards and one payroll row. Four rewards come from the seed script and two from an earlier migration, giving six in total. Most records are upserted, while scans, ledger rows and the payroll row are deleted and recreated on each run. That keeps the screenshots and demo states consistent.

## V. EVALUATION AND RESULTS

We tested the app on a local stack with Vite on port 3000 and PocketBase on port 8090. The checks were simple on purpose: lint, build, CI, a seeded dataset and screenshots from the running UI. Table II lists them.

| Check | Method | Result |
| --- | --- | --- |
| Lint | npm run lint | Passed |
| Production build | npm run build | Passed; ~93 kB CSS, ~798 kB JS |
| CI | GitHub Actions, push and PR | Workflow defined; history external |
| Screenshots | 8 screens at 1440 x 900 | Captured from seeded app |
| Seed | npm run seed:demo | Repeatable; some rows recreated |
| Proof upload | Camera file-picker demo | Simulated; no AI model |

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

![Citizen dashboard](../screenshots/03-citizen-dashboard.png)

![Admin panel](../screenshots/07-admin-panel.png)

### A. Functional and build validation

npm run lint passed with no errors. npm run build also passed and produced a CSS bundle of about 93 kB and a JavaScript bundle of about 798 kB before gzip. The GitHub Actions workflow runs lint and build on pushes and pull requests to main. Run history is not part of the repository, so this report does not claim a fixed pass count. We captured eight screenshots at 1440 x 900 for the home, login, citizen dashboard, citizen instructions, dustbin QR, driver dashboard, admin panel and admin instructions screens. The rendered burgundy, cream and sage colours matched the theme values used in the code.

### B. Demo dataset

Table III shows the seeded data used for the screenshots. We included both successful and mismatched scans so the analytics page has something realistic to display.

### C. Interface evidence

Figure 3 shows the citizen dashboard with the pickup countdown, token balance, score arc and rewards. Figure 4 shows the admin panel with operational numbers and scan analytics. Both are screenshots of the seeded local app, not static designs.

## VI. LIMITATIONS AND ETHICAL CONSIDERATIONS

The biggest limitation is that the geofence runs in the browser. A user could spoof GPS or photograph someone else's QR code. The accuracy buffer helps with normal phone error, but it is not proof that the driver was actually at the bin. A real deployment would need server-side checks, token rotation, anomaly detection and occasional supervisor review.

The proof-image flow is also simulated. The camera component only takes a file and shows a preview. The demo sets a confidence value of 95 in code and no machine-learning model is bundled. The proof upload does add 30 Civic Points, but the image itself is not judged by AI. Location and proof images are personal data, so a real pilot would need consent, short retention periods and clear access rules.

There are a few smaller gaps too. Ledger writes are blocked for non-admin callers by the current collection rule. The admin leaderboard uses a placeholder trend value. Payroll has no edit screen. The app expects a connection during collection, so an offline queue would be needed for weak network areas. The encryption key for PocketBase must stay outside version control because losing it makes encrypted data unrecoverable.

## VII. CONCLUSION AND FUTURE WORK

CleanConnect works as a prototype. A QR token, a saved bin location and a phone GPS reading are enough to create a scan record that citizens, drivers and admins can all see. The app also shows how points and rewards can be tied to that record without adding a sensor to every bin.

There is still clear work left. The distance check should move to the server, the proof flow needs a real classifier, and the app needs an offline queue for field use. We would also add real payroll editing, remove the placeholder leaderboard trend, and run a small pilot with residents and sanitation workers before calling the system production-ready.

## References

[1] N. Srikantha, Waste management in IoT-enabled smart cities: A survey, International Journal of Engineering and Computer Science, 2017, doi: 10.18535/ijecs/v6i5.53.

[2] A. A. Selvaraj, Smart waste management using IoT, International Journal for Research in Applied Science and Engineering Technology, vol. 7, no. 3, pp. 86-90, 2019, doi: 10.22214/ijraset.2019.3015.

[3] S. Rehm, M. Foth, and P. Mitchell, DoGood: examining gamification, civic engagement, and collective intelligence, AI and Society, vol. 33, no. 1, pp. 27-37, 2018, doi: 10.1007/s00146-017-0711-x.

[4] M. Romano, P. Diaz, and I. Aedo, Emergency management and smart cities: Civic engagement through gamification, in Lecture Notes in Business Information Processing, Springer, 2016, pp. 3-14, doi: 10.1007/978-3-319-47093-1_1.

[5] R. W. Sinnott, Virtues of the Haversine, Sky and Telescope, vol. 68, no. 2, p. 158, 1984.

[6] React, React documentation. [Online]. Available: https://react.dev/. Accessed: Nov. 17, 2026.

[7] Vite, Vite documentation. [Online]. Available: https://vite.dev/. Accessed: Nov. 17, 2026.

[8] Tailwind CSS, Tailwind CSS documentation. [Online]. Available: https://tailwindcss.com/docs. Accessed: Nov. 17, 2026.

[9] MDN Web Docs, Geolocation API. [Online]. Available: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API. Accessed: Nov. 17, 2026.

[10] zpao, qrcode.react. [Online]. Available: https://github.com/zpao/qrcode.react. Accessed: Nov. 17, 2026.

[11] cozmo, jsQR. [Online]. Available: https://github.com/cozmo/jsQR. Accessed: Nov. 17, 2026.

[12] PocketBase, PocketBase documentation. [Online]. Available: https://pocketbase.io/docs/. Accessed: Nov. 17, 2026.
