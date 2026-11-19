#!/usr/bin/env python3
"""Generate submission-ready IEEE report and presentation artifacts for CleanConnect.

Outputs:
  docs/ieee-report/CleanConnect_IEEE_Report.pdf
  docs/ieee-report/CleanConnect_IEEE_Report.md
  docs/ieee-report/figures/*.png
  docs/presentation/CleanConnect_Presentation.pptx
  docs/presentation/CleanConnect_Presentation.pdf
  docs/presentation/CleanConnect_Presentation.md
  docs/presentation/assets/*.png

Dependencies: reportlab, python-pptx, matplotlib, Pillow.
Install with: pip install -r scripts/requirements-docs.txt
"""

from __future__ import annotations

import html
import tempfile
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch
from PIL import Image as PILImage
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt as PPTPt
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image as RLImage,
    KeepTogether,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = ROOT / "docs" / "ieee-report"
REPORT_FIG_DIR = REPORT_DIR / "figures"
SLIDE_DIR = ROOT / "docs" / "presentation"
SLIDE_ASSET_DIR = SLIDE_DIR / "assets"

# CleanConnect palette
BURGUNDY = "#590907"
BURGUNDY_LIGHT = "#7A1512"
BURGUNDY_DARK = "#3F0605"
CREAM = "#E8D2B5"
CREAM_LIGHT = "#F2E3CE"
CREAM_DARK = "#D8BE9B"
SAGE = "#A5A79B"
SAGE_LIGHT = "#C3C5BB"
SAGE_DARK = "#6F7263"
PAPER = "#FBF7F1"
INK = "#2A0504"

REPO_URL = "https://github.com/mayankjain1815-commits/CleanConnect"
REPORT_TITLE = "CleanConnect: QR and GPS Based Pickup Verification for Waste Collection"
AUTHOR = "Mayank Jain"
AFFILIATION = "Independent student project"


# ---------------------------------------------------------------------------
# Diagram generation
# ---------------------------------------------------------------------------


def _box(ax, x, y, w, h, text, fc, tc, fontsize=9, lw=0.8, radius=0.02):
    patch = FancyBboxPatch(
        (x, y), w, h,
        boxstyle=f"round,pad=0.004,rounding_size={radius}",
        linewidth=lw,
        edgecolor=fc,
        facecolor=fc,
        transform=ax.transAxes,
    )
    ax.add_patch(patch)
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center",
            fontsize=fontsize, color=tc, weight="bold", linespacing=1.25)
    return patch


def _outline_box(ax, x, y, w, h, text, ec, tc, fontsize=9, fc="white"):
    patch = FancyBboxPatch(
        (x, y), w, h,
        boxstyle="round,pad=0.004,rounding_size=0.02",
        linewidth=0.9, edgecolor=ec, facecolor=fc,
        transform=ax.transAxes,
    )
    ax.add_patch(patch)
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center",
            fontsize=fontsize, color=tc, linespacing=1.25)
    return patch


def _arrow(ax, x1, y1, x2, y2, color=SAGE_DARK, lw=1.2):
    arrow = FancyArrowPatch(
        (x1, y1), (x2, y2),
        arrowstyle="-|>", mutation_scale=9, linewidth=lw,
        color=color, transform=ax.transAxes,
    )
    ax.add_patch(arrow)


def make_architecture_figure(path: Path, wide: bool = False) -> None:
    if wide:
        fig, ax = plt.subplots(figsize=(12.0, 5.4), dpi=180)
        fig.patch.set_facecolor(PAPER)
        ax.set_facecolor(PAPER)
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis("off")

        _box(ax, 0.02, 0.62, 0.17, 0.20, "CITIZEN\nDashboard\nQR + rewards",
             BURGUNDY, CREAM, 13)
        _box(ax, 0.215, 0.62, 0.17, 0.20, "DRIVER\nRoute\nQR scanner",
             BURGUNDY_LIGHT, CREAM, 13)
        _box(ax, 0.41, 0.62, 0.17, 0.20, "ADMIN\nAnalytics\nPayroll",
             SAGE_DARK, PAPER, 13)
        _arrow(ax, 0.305, 0.61, 0.50, 0.47, BURGUNDY)
        _box(ax, 0.30, 0.33, 0.40, 0.13, "React + Vite single-page app\nRole-based routes | Tailwind UI",
             SAGE_LIGHT, INK, 14)
        _arrow(ax, 0.50, 0.32, 0.50, 0.24, BURGUNDY)
        _box(ax, 0.30, 0.11, 0.40, 0.12, "PocketBase REST API\nAuth rules | Migrations | Hooks",
             BURGUNDY, CREAM, 14)
        _box(ax, 0.75, 0.62, 0.23, 0.20, "SQLite collections\nusers, bins, tokens,\nscans, scores, rewards",
             CREAM, INK, 12)
        _arrow(ax, 0.70, 0.17, 0.75, 0.52, SAGE_DARK)
        _box(ax, 0.75, 0.28, 0.23, 0.20, "Dashboards\nCharts | Tables | Civic Score\nScan analytics",
             CREAM_DARK, INK, 12)
        _arrow(ax, 0.70, 0.17, 0.75, 0.38, SAGE_DARK)
        ax.text(0.50, 0.03, "Verified pickup: bin QR + GPS geofence -> scan record -> Civic Points -> analytics",
                ha="center", va="center", fontsize=12, color=SAGE_DARK, weight="bold")
    else:
        fig, ax = plt.subplots(figsize=(3.5, 5.2), dpi=220)
        fig.patch.set_facecolor("white")
        ax.set_facecolor("white")
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis("off")

        _box(ax, 0.03, 0.88, 0.29, 0.07, "Citizen", BURGUNDY, CREAM, 9)
        _box(ax, 0.355, 0.88, 0.29, 0.07, "Driver", BURGUNDY_LIGHT, CREAM, 9)
        _box(ax, 0.68, 0.88, 0.29, 0.07, "Admin", SAGE_DARK, PAPER, 9)
        _arrow(ax, 0.175, 0.87, 0.38, 0.77, SAGE_DARK, 1.0)
        _arrow(ax, 0.50, 0.87, 0.50, 0.77, SAGE_DARK, 1.0)
        _arrow(ax, 0.825, 0.87, 0.62, 0.77, SAGE_DARK, 1.0)

        _box(ax, 0.08, 0.66, 0.84, 0.10,
             "React + Vite SPA\nRole-based routes and themed UI", SAGE_LIGHT, INK, 9)
        _arrow(ax, 0.50, 0.65, 0.50, 0.59, BURGUNDY)
        _box(ax, 0.08, 0.49, 0.84, 0.10,
             "PocketBase REST API\nAuth, access rules, hooks", BURGUNDY, CREAM, 9)
        _arrow(ax, 0.50, 0.48, 0.50, 0.42, BURGUNDY)

        _outline_box(ax, 0.08, 0.365, 0.84, 0.055,
                     "users | citizens | drivers", SAGE_DARK, INK, 8)
        _outline_box(ax, 0.08, 0.30, 0.84, 0.055,
                     "zones | routes | bins", SAGE_DARK, INK, 8)
        _outline_box(ax, 0.08, 0.235, 0.84, 0.055,
                     "bin_qr_tokens | driver_qr_scans", SAGE_DARK, INK, 8)
        _outline_box(ax, 0.08, 0.17, 0.84, 0.055,
                     "scores | ledger | rewards | payroll", SAGE_DARK, INK, 8)
        ax.text(0.50, 0.08, "Analytics, incentives and audit trail",
                ha="center", va="center", fontsize=8.5, color=SAGE_DARK, weight="bold")

    fig.subplots_adjust(left=0, right=1, top=1, bottom=0)
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(path, dpi=fig.dpi, facecolor=fig.get_facecolor(), bbox_inches="tight", pad_inches=0.03)
    plt.close(fig)


def make_qr_flow_figure(path: Path, wide: bool = False) -> None:
    steps = [
        "1. Citizen generates SHA-256 bin token and saves geofence",
        "2. QR code is downloaded or printed on the household bin",
        "3. Driver scans the code or enters the token manually",
        "4. App reads high-accuracy GPS and computes Haversine distance",
        "5. Allowed radius = 50 m + min(GPS accuracy, 30 m)",
        "6. Scan is stored: success | mismatch | invalid token",
        "7. Success awards +15 Civic Points and a ledger entry",
    ]

    if wide:
        fig, ax = plt.subplots(figsize=(12.0, 5.2), dpi=180)
        fig.patch.set_facecolor(PAPER)
        ax.set_facecolor(PAPER)
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis("off")
        positions = [(0.02, 0.70), (0.26, 0.70), (0.50, 0.70), (0.74, 0.70),
                     (0.14, 0.34), (0.40, 0.34), (0.66, 0.34)]
        for i, ((x, y), step) in enumerate(zip(positions, steps)):
            fc = BURGUNDY if i < 4 else (SAGE_DARK if i < 6 else BURGUNDY_LIGHT)
            _box(ax, x, y, 0.22, 0.17, step, fc, CREAM, 11)
        for x in (0.24, 0.48, 0.72):
            _arrow(ax, x, 0.785, x + 0.02, 0.785, SAGE_DARK)
        _arrow(ax, 0.85, 0.69, 0.77, 0.52, SAGE_DARK)
        _arrow(ax, 0.25, 0.51, 0.36, 0.34, SAGE_DARK)
        _arrow(ax, 0.62, 0.425, 0.66, 0.425, SAGE_DARK)
        ax.text(0.50, 0.10, "One verified pickup closes the loop between citizen, driver and administrator.",
                ha="center", fontsize=13, color=SAGE_DARK, weight="bold")
    else:
        fig, ax = plt.subplots(figsize=(3.5, 4.7), dpi=220)
        fig.patch.set_facecolor("white")
        ax.set_facecolor("white")
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis("off")
        y0 = 0.94
        step_h = 0.10
        gap = 0.022
        for i, step in enumerate(steps):
            y = y0 - i * (step_h + gap)
            fc = BURGUNDY if i < 4 else (SAGE_DARK if i < 6 else BURGUNDY_LIGHT)
            _box(ax, 0.04, y, 0.92, step_h, step, fc, CREAM, 7.8, radius=0.015)
            if i < len(steps) - 1:
                _arrow(ax, 0.50, y - 0.002, 0.50, y - gap + 0.002, SAGE_DARK, 0.9)

    fig.subplots_adjust(left=0, right=1, top=1, bottom=0)
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(path, dpi=fig.dpi, facecolor=fig.get_facecolor(), bbox_inches="tight", pad_inches=0.03)
    plt.close(fig)


# ---------------------------------------------------------------------------
# Report content
# ---------------------------------------------------------------------------

ABSTRACT = (
    "In most neighbourhoods, waste collection is still tracked very roughly. A truck can pass a "
    "street and a household may still say its bin was not emptied, while the driver has no easy "
    "way to prove what happened. CleanConnect is a small web app we built around one verifiable "
    "pickup. Each household gets a QR token tied to the saved location of its bin. The driver "
    "scans it at the curb, the app reads GPS, checks the distance, and saves the result as a scan "
    "record. A successful pickup adds Civic Points to the citizen's score and shows up in the "
    "driver and admin views. The frontend uses React and Vite, and PocketBase handles login, the "
    "database and the REST API. We checked the lint and production build, ran the demo seed "
    "script, and captured eight screenshots from the running app. This is still a prototype. The "
    "distance check runs in the browser, the proof-image check is simulated, and two of the "
    "configured point reasons are not triggered by the interface yet. Those limits are stated "
    "here instead of being hidden."
)

INDEX_TERMS = "QR code, GPS, geofencing, waste collection, civic points, PocketBase, React"

REPORT_SECTIONS = [
    {
        "title": "I. INTRODUCTION",
        "paragraphs": [
            "The idea for CleanConnect came from a small but common problem. A garbage truck may pass a street, yet one household can still say its bin was never emptied. The driver also has no simple way to show that the bin was collected. Most systems only track the route as a whole, so the exact handoff at one house is usually lost.",
            "Instead of putting a sensor in every bin, we tried a cheaper approach. Each household gets a QR sticker tied to the saved location of the bin. The driver scans it while collecting, the app takes a GPS reading, and the distance to the bin is calculated. The result is saved as a scan with a status, distance and timestamp. A good scan adds Civic Points to the citizen's score and also appears in the driver and admin views.",
            "The app has three workspaces. Citizens can generate a QR code, see their score and rewards, and upload a proof photo. Drivers see a route and scan bins. Administrators see bins, scans, scores and wage-related numbers. One point should be clear from the start: the distance check is done in the browser. PocketBase stores what the client sends, but it does not re-check the distance. That is acceptable for a prototype, not for a real municipal rollout.",
            "The following sections explain the related work, the design, what we actually implemented, and what we tested. We have also listed the parts that are still simulated or unfinished, because claiming otherwise would be misleading.",
        ],
    },
    {
        "title": "II. BACKGROUND AND RELATED WORK",
        "paragraphs": [
            "Most smart-waste ideas in the literature add hardware to bins. Surveys describe fill-level sensors, GPS trackers on trucks and central dashboards [1], [2]. Those systems can work well, but every bin needs a device, a battery and maintenance. We wanted to see how far we could get with things people already carry: a printed QR code and a phone with location enabled.",
            "Work on civic gamification shows that points and feedback can encourage better participation [3], [4]. CleanConnect uses that idea through Civic Points, three score tiers and a small rewards store. The points are meant to follow a scan event rather than a self-report, although the scan itself is still client-side at this stage.",
            "The distance check uses the Haversine formula, which is a standard way to measure distance between two latitude and longitude points [5]. The browser Geolocation API gives both a position and an accuracy estimate [9]. We use a 50 m radius and add the reported accuracy up to 30 m more, so small GPS errors do not reject a real pickup.",
            "We built the client with React and Vite [6], [7], styled it with Tailwind CSS [8], and used qrcode.react and jsQR for QR generation and scanning [10], [11]. PocketBase [12] was chosen because it gives authentication, a database, REST routes, migrations and hooks in one small server.",
        ],
    },
    {
        "title": "III. SYSTEM ARCHITECTURE",
        "paragraphs": [
            "CleanConnect is a normal client-server app with three roles sharing one React frontend. Protected routes send each user to the right workspace. The citizen area holds the bin QR tool and score cards. The driver area holds the route and scanner. The admin area holds the wider operational view.",
            "Figure 1 shows the whole setup. The frontend talks to PocketBase over REST. PocketBase handles login, collection rules, migrations and hooks. The database stores users, bins, QR tokens, scans, scores, rewards, verifications and payroll-related records.",
        ],
        "figure": ("architecture", "Fig. 1. CleanConnect system architecture."),
        "subsections": [
            {
                "title": "A. Frontend",
                "paragraphs": [
                    "The client uses React 18, React Router 7, Tailwind CSS 3, Radix-based components, Recharts, Framer Motion and Sonner. The theme is written as CSS variables and Tailwind tokens: burgundy #590907 for main surfaces, cream #E8D2B5 for text and buttons, and sage #A5A79B for softer text and borders. If no development URL is set, the client falls back to the /hcgi/platform PocketBase path used by Hostinger-style deployments.",
                ],
            },
            {
                "title": "B. Backend and data model",
                "paragraphs": [
                    "PocketBase 0.38.0 provides the built-in users collection and 14 custom collections created through migrations. A few migrations also seed default rewards and demo records. The hooks folder contains migration helpers, dashboard routing and mailer behaviour. Table I lists the collections that matter most to the pickup flow.",
                ],
            },
            {
                "title": "C. Role-based workflows",
                "paragraphs": [
                    "The role routes are /citizen-dashboard, /driver-dashboard and /admin-panel. The /instructions route redirects to a guide for the signed-in role. Settings and profile pages are shared, but the dustbin QR tab only appears for citizens. Scan analytics and wage views are kept in the admin and driver workspaces.",
                ],
            },
        ],
    },
    {
        "title": "IV. IMPLEMENTATION AND METHODOLOGY",
        "paragraphs": [
            "The main idea was to avoid extra bin hardware and keep the flow easy to demo. Figure 2 shows the path from token creation to the scan record.",
        ],
        "figure": ("qr-flow", "Fig. 2. QR and geofence verification workflow."),
        "subsections": [
            {
                "title": "A. QR token lifecycle",
                "paragraphs": [
                    "In Profile -> My Dustbin QR, the citizen asks for a token. The browser joins the citizen id, house address, current time and a UUID, then hashes that string with SHA-256 through the Web Crypto API. The result is a 64-character hex token. The bin's saved latitude and longitude are stored beside the token, not inside the hash. Creating a new token deactivates the earlier active ones, and the code can be downloaded or printed.",
                ],
            },
            {
                "title": "B. Geofence verification",
                "paragraphs": [
                    "The driver can scan the QR with the camera using jsQR or type the token by hand. The browser asks for a high-accuracy GPS reading and calculates the Haversine distance to the bin. The allowed radius is 50 m plus the device accuracy, capped at 30 m extra. The scan is saved as success, location_mismatch or invalid_token with the driver, citizen, coordinates, distance and validity flag. Camera errors and token lookup errors are caught. A missing GPS reading currently falls through to a generic error toast, which is one of the rough edges we know about.",
                ],
            },
            {
                "title": "C. Civic Score and rewards",
                "paragraphs": [
                    "The score is bounded between 300 and 900. The point map defines +15 for a verified pickup, +30 for an accurate segregation proof, +5 for a streak bonus and -50 for a false complaint. In the running app, only the first two are actually triggered: +15 after a successful scan and +30 after a proof upload. The streak and complaint values exist in the map and as a filter label, but no interface action awards or deducts them yet. Scores map to Eco-Novice below 551, Civic Champion from 551 and Elite Guardian from 751.",
                    "The code tries to write a ledger row after every score change. The ledger collection only allows admins to create rows, so normal citizen and driver calls fail silently and the warning is logged in the console. The three ledger rows in the demo were written with superuser access during seeding. Citizens can still redeem green tokens in the rewards store, and redemptions plus token debits do work.",
                ],
            },
            {
                "title": "D. Analytics and payroll",
                "paragraphs": [
                    "The admin panel shows bin fill levels, scan analytics with status filters and sorting, and a neighbourhood score leaderboard. The leaderboard's small trend arrow is placeholder data, not a real calculation. Payroll numbers are worked out in the browser from the driver's strike count and base wage. The payroll_adjustments collection stores strike counts, percentages, amounts and final wage, but there is no admin screen to add or edit those rows. Drivers see strikes, deduction and final wage in the performance tracker; today's scans are listed in a separate card.",
                ],
            },
            {
                "title": "E. Validation setup",
                "paragraphs": [
                    "The seed script gives us a repeatable demo: three role accounts, citizen and driver profiles, three zones, six bins, one active QR token, a route, four scans, a score with three ledger rows, rewards and one payroll row. Four rewards come from the seed script and two from an earlier migration, giving six in total. Most records are upserted, while scans, ledger rows and the payroll row are deleted and recreated on each run. That keeps the screenshots and demo states consistent.",
                ],
            },
        ],
    },
    {
        "title": "V. EVALUATION AND RESULTS",
        "paragraphs": [
            "We tested the app on a local stack with Vite on port 3000 and PocketBase on port 8090. The checks were simple on purpose: lint, build, CI, a seeded dataset and screenshots from the running UI. Table II lists them.",
        ],
        "subsections": [
            {
                "title": "A. Functional and build validation",
                "paragraphs": [
                    "npm run lint passed with no errors. npm run build also passed and produced a CSS bundle of about 93 kB and a JavaScript bundle of about 798 kB before gzip. The GitHub Actions workflow runs lint and build on pushes and pull requests to main. Run history is not part of the repository, so this report does not claim a fixed pass count. We captured eight screenshots at 1440 x 900 for the home, login, citizen dashboard, citizen instructions, dustbin QR, driver dashboard, admin panel and admin instructions screens. The rendered burgundy, cream and sage colours matched the theme values used in the code.",
                ],
            },
            {
                "title": "B. Demo dataset",
                "paragraphs": [
                    "Table III shows the seeded data used for the screenshots. We included both successful and mismatched scans so the analytics page has something realistic to display.",
                ],
            },
            {
                "title": "C. Interface evidence",
                "paragraphs": [
                    "Figure 3 shows the citizen dashboard with the pickup countdown, token balance, score arc and rewards. Figure 4 shows the admin panel with operational numbers and scan analytics. Both are screenshots of the seeded local app, not static designs.",
                ],
            },
        ],
    },
    {
        "title": "VI. LIMITATIONS AND ETHICAL CONSIDERATIONS",
        "paragraphs": [
            "The biggest limitation is that the geofence runs in the browser. A user could spoof GPS or photograph someone else's QR code. The accuracy buffer helps with normal phone error, but it is not proof that the driver was actually at the bin. A real deployment would need server-side checks, token rotation, anomaly detection and occasional supervisor review.",
            "The proof-image flow is also simulated. The camera component only takes a file and shows a preview. The demo sets a confidence value of 95 in code and no machine-learning model is bundled. The proof upload does add 30 Civic Points, but the image itself is not judged by AI. Location and proof images are personal data, so a real pilot would need consent, short retention periods and clear access rules.",
            "There are a few smaller gaps too. Ledger writes are blocked for non-admin callers by the current collection rule. The admin leaderboard uses a placeholder trend value. Payroll has no edit screen. The app expects a connection during collection, so an offline queue would be needed for weak network areas. The encryption key for PocketBase must stay outside version control because losing it makes encrypted data unrecoverable.",
        ],
    },
    {
        "title": "VII. CONCLUSION AND FUTURE WORK",
        "paragraphs": [
            "CleanConnect works as a prototype. A QR token, a saved bin location and a phone GPS reading are enough to create a scan record that citizens, drivers and admins can all see. The app also shows how points and rewards can be tied to that record without adding a sensor to every bin.",
            "There is still clear work left. The distance check should move to the server, the proof flow needs a real classifier, and the app needs an offline queue for field use. We would also add real payroll editing, remove the placeholder leaderboard trend, and run a small pilot with residents and sanitation workers before calling the system production-ready.",
        ],
    },
]

REFERENCES = [
    "N. Srikantha, Waste management in IoT-enabled smart cities: A survey, International Journal of Engineering and Computer Science, 2017, doi: 10.18535/ijecs/v6i5.53.",
    "A. A. Selvaraj, Smart waste management using IoT, International Journal for Research in Applied Science and Engineering Technology, vol. 7, no. 3, pp. 86-90, 2019, doi: 10.22214/ijraset.2019.3015.",
    "S. Rehm, M. Foth, and P. Mitchell, DoGood: examining gamification, civic engagement, and collective intelligence, AI and Society, vol. 33, no. 1, pp. 27-37, 2018, doi: 10.1007/s00146-017-0711-x.",
    "M. Romano, P. Diaz, and I. Aedo, Emergency management and smart cities: Civic engagement through gamification, in Lecture Notes in Business Information Processing, Springer, 2016, pp. 3-14, doi: 10.1007/978-3-319-47093-1_1.",
    "R. W. Sinnott, Virtues of the Haversine, Sky and Telescope, vol. 68, no. 2, p. 158, 1984.",
    "React, React documentation. [Online]. Available: https://react.dev/. Accessed: Nov. 17, 2026.",
    "Vite, Vite documentation. [Online]. Available: https://vite.dev/. Accessed: Nov. 17, 2026.",
    "Tailwind CSS, Tailwind CSS documentation. [Online]. Available: https://tailwindcss.com/docs. Accessed: Nov. 17, 2026.",
    "MDN Web Docs, Geolocation API. [Online]. Available: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API. Accessed: Nov. 17, 2026.",
    "zpao, qrcode.react. [Online]. Available: https://github.com/zpao/qrcode.react. Accessed: Nov. 17, 2026.",
    "cozmo, jsQR. [Online]. Available: https://github.com/cozmo/jsQR. Accessed: Nov. 17, 2026.",
    "PocketBase, PocketBase documentation. [Online]. Available: https://pocketbase.io/docs/. Accessed: Nov. 17, 2026.",
]

TABLE_I = [
    ("users", "Identity and role", "email, role, zone_id, truck_number"),
    ("citizens / drivers", "Profiles and balances", "green_tokens, neighborhood, truck, strikes"),
    ("zones / routes", "Service geography", "zone_name, assigned_date, collection_status"),
    ("bins", "Collection points", "zone_id, fill_level, status, last_cleared"),
    ("bin_qr_tokens", "Rotatable bin credentials", "qr_token, geofence_lat/lng, is_active"),
    ("driver_qr_scans", "Client-checked pickup record", "scan_status, distance_meters, is_location_valid"),
    ("civic_scores / ledger", "Score plus admin-only ledger", "current_score, tier_rank, points_changed, reason"),
    ("rewards / redemptions", "Token economy", "token_cost, tokens_spent, redemption_date"),
    ("payroll_adjustments", "Stored wage snapshot", "strike_count, deduction_amount, final_wage"),
]

TABLE_II = [
    ("Lint", "npm run lint", "Passed"),
    ("Production build", "npm run build", "Passed; ~93 kB CSS, ~798 kB JS"),
    ("CI", "GitHub Actions, push and PR", "Workflow defined; history external"),
    ("Screenshots", "8 screens at 1440 x 900", "Captured from seeded app"),
    ("Seed", "npm run seed:demo", "Repeatable; some rows recreated"),
    ("Proof upload", "Camera file-picker demo", "Simulated; no AI model"),
]

TABLE_III = [
    ("Demo users", "3 role accounts"),
    ("Zones / routes", "3 / 1 active route"),
    ("Bins", "6"),
    ("Active QR token", "1 with saved geofence"),
    ("QR scans", "4 (3 success, 1 mismatch)"),
    ("Civic score", "640, Civic Champion"),
    ("Ledger entries", "3, seeded with superuser access"),
    ("Rewards", "6 (4 seed + 2 migration)"),
    ("Payroll", "1 stored row; wage shown from strikes"),
]


# ---------------------------------------------------------------------------
# Report generation
# ---------------------------------------------------------------------------


def build_report(figures: dict[str, Path]) -> None:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_FIG_DIR.mkdir(parents=True, exist_ok=True)

    styles = {
        "title": ParagraphStyle("title", fontName="Times-Bold", fontSize=17, leading=21,
                                alignment=TA_CENTER, spaceAfter=8),
        "author": ParagraphStyle("author", fontName="Times-Roman", fontSize=11, leading=14,
                                 alignment=TA_CENTER, spaceAfter=2),
        "affiliation": ParagraphStyle("affiliation", fontName="Times-Italic", fontSize=9, leading=12,
                                      alignment=TA_CENTER, spaceAfter=8),
        "abstract_head": ParagraphStyle("abstract_head", fontName="Times-Bold", fontSize=9, leading=11,
                                        alignment=TA_CENTER, spaceAfter=4),
        "abstract": ParagraphStyle("abstract", fontName="Times-Roman", fontSize=9, leading=11.3,
                                   alignment=TA_JUSTIFY, firstLineIndent=0, spaceAfter=4),
        "index": ParagraphStyle("index", fontName="Times-Roman", fontSize=8.5, leading=10.5,
                                alignment=TA_LEFT, spaceAfter=2),
        "section": ParagraphStyle("section", fontName="Times-Bold", fontSize=10, leading=12.5,
                                  alignment=TA_LEFT, spaceBefore=9, spaceAfter=4),
        "subsection": ParagraphStyle("subsection", fontName="Times-Bold", fontSize=9, leading=11.5,
                                     alignment=TA_LEFT, spaceBefore=6, spaceAfter=3),
        "body": ParagraphStyle("body", fontName="Times-Roman", fontSize=9, leading=11.3,
                               alignment=TA_JUSTIFY, firstLineIndent=9, spaceAfter=5),
        "caption": ParagraphStyle("caption", fontName="Times-Italic", fontSize=8, leading=10,
                                  alignment=TA_CENTER, spaceBefore=3, spaceAfter=7),
        "table": ParagraphStyle("table", fontName="Times-Roman", fontSize=7.8, leading=9.5,
                                alignment=TA_LEFT),
        "table_head": ParagraphStyle("table_head", fontName="Times-Bold", fontSize=7.8, leading=9.5,
                                     alignment=TA_LEFT, textColor=colors.white),
        "ref": ParagraphStyle("ref", fontName="Times-Roman", fontSize=8, leading=10,
                              alignment=TA_JUSTIFY, leftIndent=13, firstLineIndent=-13, spaceAfter=3),
    }

    page_w, page_h = letter

    def draw_page(canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor(SAGE))
        canvas.setLineWidth(0.4)
        canvas.line(40, 54, page_w - 40, 54)
        canvas.setFont("Times-Roman", 8)
        canvas.setFillColor(colors.black)
        canvas.drawCentredString(page_w / 2, 38, str(doc.page))
        canvas.setFont("Times-Italic", 7.5)
        canvas.drawString(40, 38, "CleanConnect - IEEE-style project report")
        canvas.drawRightString(page_w - 40, 38, "Nov. 17, 2026")
        canvas.restoreState()

    doc = BaseDocTemplate(
        str(REPORT_DIR / "CleanConnect_IEEE_Report.pdf"),
        pagesize=letter,
        leftMargin=40, rightMargin=40, topMargin=54, bottomMargin=72,
        title=REPORT_TITLE,
        author=AUTHOR,
        subject="IEEE-style project report for CleanConnect",
    )

    top_h = 230
    top_y = page_h - 54 - top_h
    col_w = 252.5
    gutter = 27
    right_x = 40 + col_w + gutter

    first_top = Frame(40, top_y, page_w - 80, top_h, id="top",
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=6)
    first_left = Frame(40, 72, col_w, top_y - 80, id="left_first",
                       leftPadding=0, rightPadding=0, topPadding=5, bottomPadding=0)
    first_right = Frame(right_x, 72, col_w, top_y - 80, id="right_first",
                        leftPadding=0, rightPadding=0, topPadding=5, bottomPadding=0)
    body_left = Frame(40, 72, col_w, page_h - 54 - 72, id="left_body",
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    body_right = Frame(right_x, 72, col_w, page_h - 54 - 72, id="right_body",
                       leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)

    doc.addPageTemplates([
        PageTemplate(id="first", frames=[first_top, first_left, first_right], onPage=draw_page),
        PageTemplate(id="body", frames=[body_left, body_right], onPage=draw_page),
    ])

    story = [NextPageTemplate("body")]
    story.append(Paragraph(REPORT_TITLE, styles["title"]))
    story.append(Paragraph(AUTHOR, styles["author"]))
    story.append(Paragraph(AFFILIATION, styles["affiliation"]))
    story.append(Paragraph("Abstract", styles["abstract_head"]))
    story.append(Paragraph(ABSTRACT, styles["abstract"]))
    story.append(Paragraph("<b>Index Terms-</b> " + INDEX_TERMS, styles["index"]))

    def add_table(headers, rows, widths):
        data = [[Paragraph(html.escape(h), styles["table_head"]) for h in headers]]
        for row in rows:
            data.append([Paragraph(html.escape(str(cell)), styles["table"]) for cell in row])
        t = Table(data, colWidths=widths, hAlign="LEFT", repeatRows=1)
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(BURGUNDY)),
            ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor(SAGE_DARK)),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F6F2EB")]),
        ]))
        return t

    def add_figure(key, caption):
        path = figures[key]
        with PILImage.open(path) as im:
            w, h = im.size
        img = RLImage(str(path), width=col_w, height=col_w * h / w)
        return KeepTogether([img, Paragraph(caption, styles["caption"])])

    for sec in REPORT_SECTIONS:
        story.append(Paragraph(sec["title"], styles["section"]))
        for para in sec["paragraphs"]:
            story.append(Paragraph(para, styles["body"]))

        if sec["title"].startswith("III."):
            story.append(add_figure("architecture_report", "Fig. 1. CleanConnect system architecture."))
            story.append(Spacer(1, 2))
            story.append(Paragraph("TABLE I", styles["caption"]))
            story.append(add_table(["Collection", "Purpose", "Key fields"], TABLE_I, [78, 74, 100.5]))

        if sec["title"].startswith("IV."):
            story.append(add_figure("qr_flow_report", "Fig. 2. QR and geofence verification workflow."))

        if sec["title"].startswith("V."):
            story.append(Paragraph("TABLE II", styles["caption"]))
            story.append(add_table(["Check", "Method", "Result"], TABLE_II, [85, 88, 79.5]))
            story.append(Spacer(1, 5))
            story.append(Paragraph("TABLE III", styles["caption"]))
            story.append(add_table(["Artifact", "Seeded value"], TABLE_III, [110, 142.5]))

        for sub in sec.get("subsections", []):
            story.append(Paragraph(sub["title"], styles["subsection"]))
            for para in sub["paragraphs"]:
                story.append(Paragraph(para, styles["body"]))

        if sec["title"].startswith("V."):
            story.append(add_figure("citizen_dashboard", "Fig. 3. Citizen dashboard from the seeded instance."))
            story.append(add_figure("admin_panel", "Fig. 4. Administrator analytics from the seeded instance."))

    story.append(Paragraph("REFERENCES", styles["section"]))
    for i, ref in enumerate(REFERENCES, 1):
        story.append(Paragraph(f"[{i}] {ref}", styles["ref"]))

    doc.build(story)

    # Markdown source for easy reuse outside the PDF.
    md = [f"# {REPORT_TITLE}",
          "", f"**Author:** {AUTHOR}  ", f"**Affiliation:** {AFFILIATION}", "",
          "## Abstract", "", ABSTRACT, "", f"**Index Terms:** {INDEX_TERMS}", ""]
    for sec in REPORT_SECTIONS:
        md.append(f"## {sec['title']}")
        md.append("")
        for para in sec["paragraphs"]:
            md.append(para)
            md.append("")
        if sec["title"].startswith("III."):
            md += ["![CleanConnect system architecture](figures/architecture.png)", "",
                   "| Collection | Purpose | Key fields |", "| --- | --- | --- |"]
            md += [f"| {a} | {b} | {c} |" for a, b, c in TABLE_I]
            md.append("")
        if sec["title"].startswith("IV."):
            md += ["![QR verification workflow](figures/qr-flow.png)", ""]
        if sec["title"].startswith("V."):
            md += ["| Check | Method | Result |", "| --- | --- | --- |"]
            md += [f"| {a} | {b} | {c} |" for a, b, c in TABLE_II]
            md += ["", "| Artifact | Seeded value |", "| --- | --- |"]
            md += [f"| {a} | {b} |" for a, b in TABLE_III]
            md += ["", "![Citizen dashboard](../screenshots/03-citizen-dashboard.png)", "",
                   "![Admin panel](../screenshots/07-admin-panel.png)", ""]
        for sub in sec.get("subsections", []):
            md.append(f"### {sub['title']}")
            md.append("")
            for para in sub["paragraphs"]:
                md.append(para)
                md.append("")
    md.append("## References")
    md.append("")
    for i, ref in enumerate(REFERENCES, 1):
        md.append(f"[{i}] {ref}")
        md.append("")
    (REPORT_DIR / "CleanConnect_IEEE_Report.md").write_text("\n".join(md), encoding="utf-8")


# ---------------------------------------------------------------------------
# Presentation content and generation
# ---------------------------------------------------------------------------

DECK = [
    {
        "type": "title",
        "title": "CleanConnect",
        "subtitle": "QR and GPS based pickup verification for household waste",
        "tag": "MADE BY MAYANK JAIN  |  IEEE-STYLE REPORT COMPANION",
        "author": AUTHOR,
        "meta": ["React + PocketBase", "Three role-based workspaces", "Demo data and screenshots included"],
        "notes": "Start with the situation: a truck can pass a street and one house may still say its bin was not collected. We built a simple scan flow around that moment.",
    },
    {
        "type": "bullets",
        "kicker": "01 / PROBLEM",
        "title": "The problem is small but real",
        "bullets": [
            "A missed bin is hard to prove after the truck leaves.",
            "Route-level reports do not show what happened at one house.",
            "Citizens get little feedback when they do the right thing.",
            "Drivers and admins do not share one clear record of the pickup.",
            "Smart-bin hardware helps, but putting sensors on every bin is expensive.",
        ],
        "callout": "We wanted one cheap, checkable record for each household pickup.",
        "notes": "Do not oversell this. Say we were trying to solve a narrow, everyday problem, not redesign the whole waste industry.",
    },
    {
        "type": "split",
        "kicker": "02 / SOLUTION",
        "title": "One scan at the bin",
        "left": [
            "Household gets a QR token tied to its saved bin location.",
            "Driver scans it or types the token by hand.",
            "App checks GPS distance and saves a scan result.",
            "A good scan adds 15 Civic Points to the household.",
        ],
        "right_title": "What we actually did",
        "right": [
            "No extra hardware on the bin.",
            "50 m radius plus up to 30 m GPS accuracy buffer.",
            "Camera scan with a manual fallback.",
            "Seeded demo data so the flow is easy to show.",
        ],
        "notes": "Explain this as a flow, not as a list of screens. The same scan record is what the citizen, driver and admin views all use.",
    },
    {
        "type": "image",
        "kicker": "03 / ARCHITECTURE",
        "title": "How the app is put together",
        "image": "architecture_slide",
        "bullets": [
            "React 18 and Vite 7 frontend with role-protected routes.",
            "PocketBase 0.38.0 handles auth, REST, rules and hooks.",
            "14 custom collections plus the built-in users collection.",
            "The browser computes the distance and posts the result.",
        ],
        "notes": "Point out that this is a simple setup: a static frontend and one small backend. Also be honest that the distance check is client-side for now.",
    },
    {
        "type": "flow",
        "kicker": "04 / VERIFICATION",
        "title": "The scan check",
        "image": "qr_flow_slide",
        "formula": "allowed radius = 50 m + min(device accuracy, 30 m)",
        "notes": "Walk through the seven steps on the diagram. Mention that success, mismatch and invalid token are all saved. The backend currently trusts the distance value sent by the browser.",
    },
    {
        "type": "table",
        "kicker": "05 / DATA MODEL",
        "title": "What is stored",
        "headers": ["Collection group", "What it stores", "Why it matters"],
        "rows": [
            ["users, citizens, drivers", "Identity, role, zone, balances", "Login and workspaces"],
            ["zones, routes, bins", "Service area and fill levels", "Route and bin views"],
            ["bin_qr_tokens, scans", "Token, geofence, scan status", "Pickup record"],
            ["scores, rewards", "Civic Points and redemptions", "Incentives that work"],
            ["ledger, payroll", "Admin-only rows and wage data", "Currently limited in UI"],
        ],
        "notes": "Keep this short. The scan table is the centre of the design; the reward and admin screens just read from it.",
    },
    {
        "type": "screenshots",
        "kicker": "06 / CITIZEN SIDE",
        "title": "What the citizen sees",
        "images": ["citizen_dashboard", "dustbin_qr"],
        "captions": ["Citizen dashboard", "Dustbin QR panel"],
        "bullets": [
            "Countdown, token balance and score arc in one place.",
            "QR can be downloaded, printed or rotated with a new geofence.",
        ],
        "notes": "Show the dashboard first, then the QR panel. The QR is the credential, not just a picture.",
    },
    {
        "type": "screenshots",
        "kicker": "07 / OPERATIONS",
        "title": "Driver and admin views",
        "images": ["driver_dashboard", "admin_panel"],
        "captions": ["Driver dashboard", "Admin panel"],
        "bullets": [
            "Drivers see the route, scans, strikes and wage.",
            "Admins see bins, scans, scores and stored payroll rows.",
        ],
        "notes": "The driver performance tracker shows strikes and wage; the scan list is a separate card. The admin payroll table is read-only in this version.",
    },
    {
        "type": "bullets",
        "kicker": "08 / POINTS",
        "title": "Civic Points, with clear limits",
        "bullets": [
            "Score runs from 300 to 900 with three tiers.",
            "Only +15 for a scan and +30 for a proof upload are triggered.",
            "+5 streak and -50 false complaint are defined but not used by the UI.",
            "Green tokens can be redeemed in the rewards store.",
            "The admin leaderboard has a placeholder trend arrow.",
        ],
        "callout": "Two point rules exist in code but have no real trigger yet.",
        "notes": "This is a good place to show honesty. Say what works and what is only configured, instead of pretending the whole reward model is live.",
    },
    {
        "type": "table",
        "kicker": "09 / VALIDATION",
        "title": "What we checked",
        "headers": ["Check", "Method", "Result"],
        "rows": [[a, b, c] for a, b, c in TABLE_II],
        "notes": "CI runs on pushes and pull requests. I am not claiming a fixed run count because that history lives on GitHub, not in the repo.",
    },
    {
        "type": "table",
        "kicker": "10 / DEMO SETUP",
        "title": "Seeded data for the walkthrough",
        "headers": ["Artifact", "Seeded value"],
        "rows": [[a, b] for a, b in TABLE_III],
        "notes": "The seed script is repeatable. It includes one failed scan on purpose so the analytics screen is not all green.",
    },
    {
        "type": "split",
        "kicker": "11 / USE CASES",
        "title": "Where this could fit",
        "left": [
            "Hackathon: short live demo using the seeded accounts.",
            "Research: clear method and limits that can be discussed.",
            "Startup: role model and dashboards that can be piloted.",
        ],
        "right_title": "Possible first pilots",
        "right": [
            "Residential societies and gated communities.",
            "A single municipal ward or campus.",
            "Waste programs with a partner rewards brand.",
            "Small contracts where pickup proof matters.",
        ],
        "notes": "Match the pitch to the room. Judges care about the demo, researchers care about the method, and startup people care about a realistic first pilot.",
    },
    {
        "type": "bullets",
        "kicker": "12 / LIMITS",
        "title": "What is not done yet",
        "bullets": [
            "Browser GPS can be spoofed; QR codes can be shared.",
            "Proof image check is simulated, not machine learning.",
            "Ledger writes fail for normal users under current rules.",
            "Payroll has no create or edit screen.",
            "No offline queue, so weak networks are a problem.",
            "Next: server checks, real image model, offline mode, pilot study.",
        ],
        "callout": "It is a working prototype, not a production system.",
        "notes": "Be direct about the gaps. It makes the rest of the presentation more believable.",
    },
    {
        "type": "closing",
        "title": "CleanConnect",
        "subtitle": "A working prototype with an honest scope",
        "lines": [
            "Report, deck, screenshots and seed script are in the repo.",
            "Runs locally with Vite and PocketBase.",
            "Happy to walk through a live QR scan if there is time.",
        ],
        "url": REPO_URL,
        "notes": "End with the GitHub link and invite questions. If someone asks about accuracy, point to the limitations slide instead of bluffing.",
    },
]


def _rgb(hex_color: str) -> RGBColor:
    return RGBColor.from_string(hex_color.lstrip("#"))


def _add_text(slide, x, y, w, h, text, size=18, color=INK, bold=False,
              align=PP_ALIGN.LEFT, font="Arial", valign=MSO_ANCHOR.TOP,
              italic=False):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.clear()
    tf.word_wrap = True
    tf.vertical_anchor = valign
    tf.margin_left = 0
    tf.margin_right = 0
    tf.margin_top = 0
    tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.name = font
    run.font.size = PPTPt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = _rgb(color)
    return box


def _add_bullets(slide, x, y, w, h, bullets, size=16, color=INK, spacing=10):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.clear()
    tf.word_wrap = True
    tf.margin_left = 0
    tf.margin_right = 0
    tf.margin_top = 0
    tf.margin_bottom = 0
    for i, item in enumerate(bullets):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = "- " + item
        p.level = 0
        p.space_after = PPTPt(spacing)
        p.font.name = "Arial"
        p.font.size = PPTPt(size)
        p.font.color.rgb = _rgb(color)
    return box


def _add_card(slide, x, y, w, h, title, items, fill=CREAM_LIGHT, title_color=BURGUNDY):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    shape.fill.solid()
    shape.fill.fore_color.rgb = _rgb(fill)
    shape.line.color.rgb = _rgb(SAGE)
    tf = shape.text_frame
    tf.clear()
    tf.word_wrap = True
    tf.margin_left = Inches(0.22)
    tf.margin_right = Inches(0.18)
    tf.margin_top = Inches(0.16)
    tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = title
    p.font.name = "Arial"
    p.font.size = PPTPt(15)
    p.font.bold = True
    p.font.color.rgb = _rgb(title_color)
    p.space_after = PPTPt(8)
    for item in items:
        bp = tf.add_paragraph()
        bp.text = "- " + item
        bp.font.name = "Arial"
        bp.font.size = PPTPt(12.5)
        bp.font.color.rgb = _rgb(INK)
        bp.space_after = PPTPt(6)
    return shape


def _fit_image(slide, path, x, y, w, h, border=True):
    with PILImage.open(path) as im:
        iw, ih = im.size
    scale = min(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    px, py = x + (w - dw) / 2, y + (h - dh) / 2
    if border:
        frame = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(px - 0.03), Inches(py - 0.03),
                                       Inches(dw + 0.06), Inches(dh + 0.06))
        frame.fill.solid()
        frame.fill.fore_color.rgb = _rgb(SAGE)
        frame.line.fill.background()
    slide.shapes.add_picture(str(path), Inches(px), Inches(py), width=Inches(dw), height=Inches(dh))
    return px, py, dw, dh


def _pptx_base(prs, slide, kicker, title, number):
    bg = slide.background.fill
    bg.solid()
    bg.fore_color.rgb = _rgb(PAPER)
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(0.16), Inches(7.5))
    bar.fill.solid()
    bar.fill.fore_color.rgb = _rgb(BURGUNDY)
    bar.line.fill.background()
    _add_text(slide, 0.6, 0.34, 6.0, 0.28, kicker, 11, SAGE_DARK, True)
    _add_text(slide, 0.6, 0.68, 12.0, 0.6, title, 27, BURGUNDY, True)
    rule = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.6), Inches(1.35), Inches(12.1), Inches(0.025))
    rule.fill.solid()
    rule.fill.fore_color.rgb = _rgb(SAGE)
    rule.line.fill.background()
    _add_text(slide, 0.6, 7.08, 8.0, 0.25, "CleanConnect  |  IEEE report companion deck", 9, SAGE_DARK)
    _add_text(slide, 11.8, 7.08, 0.9, 0.25, f"{number:02d}", 9, SAGE_DARK, True, PP_ALIGN.RIGHT)
    slide.notes_slide.notes_text_frame.text = ""


def build_pptx(assets: dict[str, Path]) -> None:
    SLIDE_DIR.mkdir(parents=True, exist_ok=True)
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank = prs.slide_layouts[6]

    for idx, item in enumerate(DECK, 1):
        slide = prs.slides.add_slide(blank)
        kind = item["type"]

        if kind == "title":
            bg = slide.background.fill
            bg.solid()
            bg.fore_color.rgb = _rgb(BURGUNDY)
            band = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(5.05), Inches(13.333), Inches(0.04))
            band.fill.solid()
            band.fill.fore_color.rgb = _rgb(SAGE)
            band.line.fill.background()
            _add_text(slide, 0.85, 1.0, 11.6, 0.35, item["tag"], 12, SAGE_LIGHT, True)
            _add_text(slide, 0.85, 1.65, 11.6, 1.0, item["title"], 46, CREAM, True)
            _add_text(slide, 0.85, 2.75, 11.0, 1.1, item["subtitle"], 23, CREAM_LIGHT)
            _add_text(slide, 0.85, 4.15, 6.0, 0.4, item["author"], 17, CREAM, True)
            for j, meta in enumerate(item["meta"]):
                _add_text(slide, 0.85 + j * 4.0, 5.45, 3.8, 0.4, meta, 13, SAGE_LIGHT)
            _add_text(slide, 0.85, 6.75, 11.6, 0.35, REPO_URL, 12, CREAM_DARK)
        elif kind == "closing":
            bg = slide.background.fill
            bg.solid()
            bg.fore_color.rgb = _rgb(BURGUNDY)
            band = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(1.0), Inches(13.333), Inches(0.04))
            band.fill.solid()
            band.fill.fore_color.rgb = _rgb(SAGE)
            band.line.fill.background()
            _add_text(slide, 0.85, 1.2, 11.6, 0.9, item["title"], 42, CREAM, True)
            _add_text(slide, 0.85, 2.15, 11.6, 0.5, item["subtitle"], 21, CREAM_LIGHT)
            for j, line in enumerate(item["lines"]):
                _add_text(slide, 0.9, 3.15 + j * 0.55, 11.4, 0.4, line, 16, SAGE_LIGHT)
            link_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE,
                                              Inches(0.85), Inches(5.35), Inches(11.6), Inches(0.75))
            link_box.fill.solid()
            link_box.fill.fore_color.rgb = _rgb(CREAM)
            link_box.line.fill.background()
            _add_text(slide, 1.0, 5.53, 11.3, 0.4, item["url"], 15, BURGUNDY, True, PP_ALIGN.CENTER)
        else:
            _pptx_base(prs, slide, item["kicker"], item["title"], idx)

            if kind == "bullets":
                _add_bullets(slide, 0.7, 1.65, 8.2, 4.7, item["bullets"], 16)
                if item.get("callout"):
                    _add_card(slide, 9.15, 1.7, 3.45, 3.4, "Key takeaway",
                              [item["callout"]], fill=CREAM_LIGHT)
            elif kind == "split":
                _add_bullets(slide, 0.7, 1.65, 6.0, 4.9, item["left"], 15)
                _add_card(slide, 7.05, 1.65, 5.55, 4.9, item["right_title"], item["right"],
                          fill=CREAM_LIGHT)
            elif kind == "image":
                _fit_image(slide, assets[item["image"]], 6.5, 1.6, 6.1, 5.0)
                _add_bullets(slide, 0.7, 1.7, 5.5, 4.8, item["bullets"], 15)
            elif kind == "flow":
                _fit_image(slide, assets[item["image"]], 0.7, 1.55, 11.9, 4.9)
                formula = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE,
                                                 Inches(2.2), Inches(6.35), Inches(9.0), Inches(0.5))
                formula.fill.solid()
                formula.fill.fore_color.rgb = _rgb(CREAM)
                formula.line.fill.background()
                _add_text(slide, 2.3, 6.45, 8.8, 0.3, item["formula"], 14, BURGUNDY, True, PP_ALIGN.CENTER)
            elif kind == "table":
                rows = len(item["rows"]) + 1
                cols = len(item["headers"])
                table_shape = slide.shapes.add_table(rows, cols, Inches(0.7), Inches(1.7),
                                                     Inches(11.9), Inches(4.9))
                table = table_shape.table
                for c, header in enumerate(item["headers"]):
                    cell = table.cell(0, c)
                    cell.text = header
                    cell.fill.solid()
                    cell.fill.fore_color.rgb = _rgb(BURGUNDY)
                    for p in cell.text_frame.paragraphs:
                        p.font.name = "Arial"
                        p.font.size = PPTPt(13)
                        p.font.bold = True
                        p.font.color.rgb = _rgb(CREAM)
                for r, row in enumerate(item["rows"], 1):
                    for c, value in enumerate(row):
                        cell = table.cell(r, c)
                        cell.text = str(value)
                        cell.fill.solid()
                        cell.fill.fore_color.rgb = _rgb(CREAM_LIGHT if r % 2 else PAPER)
                        for p in cell.text_frame.paragraphs:
                            p.font.name = "Arial"
                            p.font.size = PPTPt(12)
                            p.font.color.rgb = _rgb(INK)
                for c in range(cols):
                    table.columns[c].width = Inches(11.9 / cols)
            elif kind == "screenshots":
                _fit_image(slide, assets[item["images"][0]], 0.7, 1.6, 5.85, 4.5)
                _fit_image(slide, assets[item["images"][1]], 6.75, 1.6, 5.85, 4.5)
                _add_text(slide, 0.7, 6.18, 5.85, 0.3, item["captions"][0], 12, SAGE_DARK, True, PP_ALIGN.CENTER)
                _add_text(slide, 6.75, 6.18, 5.85, 0.3, item["captions"][1], 12, SAGE_DARK, True, PP_ALIGN.CENTER)
                _add_bullets(slide, 0.7, 6.5, 11.9, 0.55, item["bullets"], 11, spacing=0)

        slide.notes_slide.notes_text_frame.text = item["notes"]

    prs.core_properties.title = "CleanConnect Presentation"
    prs.core_properties.author = AUTHOR
    prs.core_properties.subject = "IEEE report companion presentation for CleanConnect"
    prs.core_properties.keywords = "CleanConnect, waste management, QR, geofence, civic points"
    prs.save(str(SLIDE_DIR / "CleanConnect_Presentation.pptx"))

    md = [f"# {prs.core_properties.title}", "", f"**Author:** {AUTHOR}", ""]
    for i, item in enumerate(DECK, 1):
        md.append(f"## Slide {i}: {item['title']}")
        md.append("")
        if item["type"] == "bullets":
            md += [f"- {b}" for b in item["bullets"]]
        elif item["type"] == "split":
            md += [f"**{item['right_title']}**", ""] + [f"- {b}" for b in item["right"]]
            md += ["", "**Main points**", ""] + [f"- {b}" for b in item["left"]]
        elif item.get("bullets"):
            md += [f"- {b}" for b in item["bullets"]]
        elif item["type"] == "table":
            md += ["| " + " | ".join(item["headers"]) + " |",
                   "| " + " | ".join(["---"] * len(item["headers"])) + " |"]
            md += ["| " + " | ".join(str(c) for c in row) + " |" for row in item["rows"]]
        md += ["", f"**Speaker notes:** {item['notes']}", ""]
    (SLIDE_DIR / "CleanConnect_Presentation.md").write_text("\n".join(md), encoding="utf-8")


# ---------------------------------------------------------------------------
# PDF version of the presentation
# ---------------------------------------------------------------------------


def build_slide_pdf(assets: dict[str, Path]) -> None:
    from reportlab.pdfgen import canvas as rl_canvas

    W, H = 960, 540  # 16:9, matching the PPTX slide size
    path = SLIDE_DIR / "CleanConnect_Presentation.pdf"
    c = rl_canvas.Canvas(str(path), pagesize=(W, H))
    c.setTitle("CleanConnect Presentation")
    c.setAuthor(AUTHOR)

    def fill(hex_color):
        c.setFillColor(colors.HexColor(hex_color))

    def text(x, y, s, size=16, color=INK, bold=False, align="left", max_width=None):
        font = "Helvetica-Bold" if bold else "Helvetica"
        c.setFont(font, size)
        fill(color)
        if max_width:
            lines = simpleSplit(s, font, size, max_width)
            for i, line in enumerate(lines):
                if align == "center":
                    c.drawCentredString(x, y - i * size * 1.3, line)
                else:
                    c.drawString(x, y - i * size * 1.3, line)
        else:
            if align == "center":
                c.drawCentredString(x, y, s)
            elif align == "right":
                c.drawRightString(x, y, s)
            else:
                c.drawString(x, y, s)

    def rect(x, y, w, h, color_hex, stroke=None):
        fill(color_hex)
        if stroke:
            c.setStrokeColor(colors.HexColor(stroke))
            c.rect(x, y, w, h, stroke=1, fill=1)
        else:
            c.rect(x, y, w, h, stroke=0, fill=1)

    def base(item, idx):
        rect(0, 0, W, H, PAPER)
        rect(0, 0, 10, H, BURGUNDY)
        text(38, H - 34, item["kicker"], 9, SAGE_DARK, True)
        text(38, H - 62, item["title"], 22, BURGUNDY, True, max_width=W - 76)
        rect(38, H - 80, W - 76, 1.2, SAGE)
        text(38, 16, "CleanConnect | IEEE report companion deck", 8, SAGE_DARK)
        text(W - 38, 16, f"{idx:02d}", 8, SAGE_DARK, True, "right")

    def bullets(x, y, items, size=12, width=430, leading=20):
        font = "Helvetica"
        c.setFont(font, size)
        fill(INK)
        yy = y
        for item in items:
            lines = simpleSplit("- " + item, font, size, width)
            for line in lines:
                c.drawString(x, yy, line)
                yy -= leading * 0.72
            yy -= leading * 0.28
        return yy

    def draw_image(path_img, x, y, w, h):
        with PILImage.open(path_img) as im:
            iw, ih = im.size
        scale = min(w / iw, h / ih)
        dw, dh = iw * scale, ih * scale
        c.drawImage(str(path_img), x + (w - dw) / 2, y + (h - dh) / 2, width=dw, height=dh)

    for idx, item in enumerate(DECK, 1):
        c.saveState()
        kind = item["type"]
        if kind == "title":
            rect(0, 0, W, H, BURGUNDY)
            rect(0, 120, W, 3, SAGE)
            text(46, H - 100, item["tag"], 10, SAGE_LIGHT, True)
            text(46, H - 160, item["title"], 40, CREAM, True)
            text(46, H - 215, item["subtitle"], 19, CREAM_LIGHT)
            text(46, 120, item["author"], 15, CREAM, True)
            for j, meta in enumerate(item["meta"]):
                text(46 + j * 290, 85, meta, 11, SAGE_LIGHT)
            text(46, 40, REPO_URL, 10, CREAM_DARK)
        elif kind == "closing":
            rect(0, 0, W, H, BURGUNDY)
            text(46, H - 100, item["title"], 38, CREAM, True)
            text(46, H - 155, item["subtitle"], 19, CREAM_LIGHT)
            for j, line in enumerate(item["lines"]):
                text(50, H - 205 - j * 32, line, 13, SAGE_LIGHT)
            rect(46, 80, W - 92, 45, CREAM)
            text(W / 2, 96, item["url"], 13, BURGUNDY, True, "center")
        else:
            base(item, idx)
            if kind == "bullets":
                bullets(42, 430, item["bullets"], 11.5, 460, 21)
                if item.get("callout"):
                    rect(560, 90, 320, 300, CREAM_LIGHT, SAGE)
                    text(580, 360, "Key takeaway", 14, BURGUNDY, True)
                    bullets(580, 330, [item["callout"]], 11.5, 280, 21)
            elif kind == "split":
                bullets(42, 430, item["left"], 11, 430, 20)
                rect(515, 90, 395, 330, CREAM_LIGHT, SAGE)
                text(535, 390, item["right_title"], 13, BURGUNDY, True)
                bullets(535, 360, item["right"], 11, 355, 20)
            elif kind == "image":
                draw_image(assets[item["image"]], 470, 95, 440, 320)
                bullets(42, 430, item["bullets"], 11, 400, 21)
            elif kind == "flow":
                draw_image(assets[item["image"]], 42, 95, W - 84, 280)
                rect(150, 45, W - 300, 34, CREAM)
                text(W / 2, 56, item["formula"], 12, BURGUNDY, True, "center")
            elif kind == "table":
                headers = item["headers"]
                rows = item["rows"]
                col_w = (W - 84) / len(headers)
                y = 430
                for j, h in enumerate(headers):
                    rect(42 + j * col_w, y - 4, col_w - 3, 28, BURGUNDY)
                    text(48 + j * col_w, y + 5, h, 10, CREAM, True, max_width=col_w - 12)
                y -= 34
                for i, row in enumerate(rows):
                    for j, val in enumerate(row):
                        rect(42 + j * col_w, y - 4, col_w - 3, 38,
                             CREAM_LIGHT if i % 2 == 0 else PAPER, SAGE)
                        text(48 + j * col_w, y + 16, str(val), 9, INK, max_width=col_w - 12)
                    y -= 38
            elif kind == "screenshots":
                draw_image(assets[item["images"][0]], 42, 100, 410, 245)
                draw_image(assets[item["images"][1]], 508, 100, 410, 245)
                text(247, 78, item["captions"][0], 10, SAGE_DARK, True, "center")
                text(713, 78, item["captions"][1], 10, SAGE_DARK, True, "center")
                bullets(42, 55, item["bullets"], 9, W - 84, 12)
        c.restoreState()
        c.showPage()
    c.save()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    SLIDE_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_FIG_DIR.mkdir(parents=True, exist_ok=True)
    SLIDE_ASSET_DIR.mkdir(parents=True, exist_ok=True)

    figures = {
        "architecture_report": REPORT_FIG_DIR / "architecture.png",
        "qr_flow_report": REPORT_FIG_DIR / "qr-flow.png",
        "citizen_dashboard": ROOT / "docs/screenshots/03-citizen-dashboard.png",
        "admin_panel": ROOT / "docs/screenshots/07-admin-panel.png",
    }
    assets = {
        "architecture_slide": SLIDE_ASSET_DIR / "architecture.png",
        "qr_flow_slide": SLIDE_ASSET_DIR / "qr-flow.png",
        "citizen_dashboard": ROOT / "docs/screenshots/03-citizen-dashboard.png",
        "dustbin_qr": ROOT / "docs/screenshots/05-dustbin-qr.png",
        "driver_dashboard": ROOT / "docs/screenshots/06-driver-dashboard.png",
        "admin_panel": ROOT / "docs/screenshots/07-admin-panel.png",
    }

    make_architecture_figure(figures["architecture_report"], wide=False)
    make_qr_flow_figure(figures["qr_flow_report"], wide=False)
    make_architecture_figure(assets["architecture_slide"], wide=True)
    make_qr_flow_figure(assets["qr_flow_slide"], wide=True)

    build_report(figures)
    build_pptx(assets)
    build_slide_pdf(assets)

    print("Generated:")
    print("  docs/ieee-report/CleanConnect_IEEE_Report.pdf")
    print("  docs/ieee-report/CleanConnect_IEEE_Report.md")
    print("  docs/presentation/CleanConnect_Presentation.pptx")
    print("  docs/presentation/CleanConnect_Presentation.pdf")
    print("  docs/presentation/CleanConnect_Presentation.md")


if __name__ == "__main__":
    main()
