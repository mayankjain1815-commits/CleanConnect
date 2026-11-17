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
AUTHOR = "Mayank Jain"
AFFILIATION = "Independent Project, CleanConnect Research and Development"


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
    "Urban waste collection systems often lack verifiable, household-level accountability. "
    "Missed pickups are difficult to prove, driver routes are opaque, and citizens have little "
    "feedback when they participate correctly. This paper presents CleanConnect, a role-based web "
    "platform that verifies each collection by scanning a household bin QR code inside a GPS "
    "geofence. The system computes Haversine distance between the driver and the bin, tolerates "
    "phone GPS error with a capped accuracy buffer, records the verification outcome, and awards "
    "Civic Points to the household. A PocketBase backend stores role-specific data, enforces "
    "collection access rules, and supports dashboards for citizens, drivers, and administrators. "
    "The frontend is implemented with React, Vite, Tailwind CSS, and Recharts using a burgundy, "
    "cream, and sage visual system. We describe the architecture, verification workflow, incentive "
    "model, and a reproducible demo dataset. Validation includes automated lint and production "
    "build checks, a passing continuous-integration pipeline, eight interface screenshots, and "
    "an idempotent seed script. The results show that a low-cost QR and smartphone GPS workflow "
    "can provide actionable auditability without dedicated bin sensors. Limitations such as GPS "
    "spoofing, offline operation, and proof-image authenticity are discussed, followed by future "
    "work toward pilot deployment."
)

INDEX_TERMS = "civic technology, geofencing, QR codes, smart cities, waste management, PocketBase, React"

REPORT_SECTIONS = [
    {
        "title": "I. INTRODUCTION",
        "paragraphs": [
            "Municipal solid-waste collection is a high-frequency public service, yet its quality is usually measured at the route level rather than at the household level. A truck may pass a street without collecting a specific bin, a citizen may report a collection that did not occur, and supervisors may have no timestamped evidence linking a driver, a bin, and a location. These gaps weaken accountability and make incentive programs difficult to operate fairly.",
            "CleanConnect addresses this gap with a lightweight verification loop. Each household generates a unique QR token bound to a saved bin location. During collection, the driver scans that token at the curb. The application reads the driver's GPS position, computes the distance to the bin, and records the scan as successful, location-mismatched, or invalid. Successful scans update the citizen's Civic Score and feed driver payroll and administrator analytics.",
            "The paper makes five contributions: (1) a role-based web application for citizens, drivers, and administrators; (2) an accuracy-aware geofence verification workflow using QR codes and smartphone GPS; (3) a Civic Points incentive model backed by an immutable-style ledger; (4) operational dashboards for scan analytics, bin fill levels, routes, and payroll; and (5) a reproducible demo dataset and CI workflow that support research demonstration and hackathon submission.",
            "The remainder of this paper is organized as follows. Section II reviews related work. Section III describes the system architecture. Section IV presents the implementation methodology. Section V reports validation results. Section VI discusses limitations and ethical considerations, and Section VII concludes with future work.",
        ],
    },
    {
        "title": "II. BACKGROUND AND RELATED WORK",
        "paragraphs": [
            "Smart waste-management research has largely focused on sensor-enabled bins, route optimization, and city-scale monitoring. Surveys of IoT-enabled waste systems describe ultrasonic fill-level sensors, GPS-enabled trucks, and centralized dashboards [1], [2]. These approaches can improve collection efficiency, but they require dedicated hardware, maintenance, and connectivity for every bin. CleanConnect deliberately uses commodities that most participants already carry: a printed QR sticker and a smartphone with geolocation.",
            "Civic gamification literature shows that points, badges, and feedback loops can encourage pro-environmental and community behavior [3], [4]. CleanConnect applies this idea through Civic Points, tier progression, a public-facing score arc, and a rewards store. Unlike a purely motivational interface, the incentive is triggered by a verifiable event: the geofenced pickup scan.",
            "Distance verification uses the Haversine formula, a standard great-circle distance method for latitude and longitude pairs [5]. The browser Geolocation API supplies position and an accuracy estimate [9]. By adding a capped accuracy buffer to a 50 m base radius, the system reduces false rejections from imprecise phone GPS while keeping the geofence meaningful.",
            "The implementation uses React and Vite for the client [6], [7], Tailwind CSS for styling [8], qrcode.react and jsQR for QR generation and decoding [10], [11], and PocketBase for the backend [12]. This combination reduces deployment complexity: the client is a static build, while PocketBase provides authentication, a SQLite database, REST endpoints, migrations, and server-side hooks.",
        ],
    },
    {
        "title": "III. SYSTEM ARCHITECTURE",
        "paragraphs": [
            "CleanConnect is a three-role, client-server application. Citizens manage household profile data, generate a bin QR code, upload waste proof, and redeem rewards. Drivers view assigned routes and bins, then scan QR codes during collection. Administrators monitor city-wide operations, citizens, scan history, scores, and payroll. All roles share a single React client whose routes are protected by role checks.",
            "Figure 1 summarizes the architecture. The React and Vite frontend communicates with PocketBase over REST. PocketBase enforces collection access rules, runs schema migrations, and executes custom hooks. Its SQLite collections store identity, routes, bins, QR tokens, scans, Civic Scores, rewards, complaints, verifications, and payroll adjustments.",
        ],
        "figure": ("architecture", "Fig. 1. CleanConnect system architecture."),
        "subsections": [
            {
                "title": "A. Frontend",
                "paragraphs": [
                    "The frontend uses React 18, React Router 7, Tailwind CSS 3, Radix-based interface components, Recharts, Framer Motion, and Sonner notifications. The visual system is defined by CSS variables and Tailwind tokens: deep burgundy #590907 for primary surfaces, warm cream #E8D2B5 for text and primary actions, and sage #A5A79B for secondary text and borders. The client falls back to the /hcgi/platform PocketBase path when no development URL is configured, which supports Hostinger-style deployments.",
                ],
            },
            {
                "title": "B. Backend and data model",
                "paragraphs": [
                    "PocketBase 0.38 supplies authentication for the users collection plus typed base collections. Migrations under apps/pocketbase/pb_migrations define the schema and seed default rewards; hooks under apps/pocketbase/pb_hooks add migration utilities, external dashboard routing, and mailer behavior. Table I lists the core collections and their purpose.",
                ],
            },
            {
                "title": "C. Role-based workflows",
                "paragraphs": [
                    "Protected routes map each role to its workspace: /citizen-dashboard, /driver-dashboard, and /admin-panel. The /instructions route redirects to a role-specific guide. Profile and settings pages are shared, while the dustbin QR tab is exposed only to citizens. This separation keeps sensitive operations such as payroll adjustment and scan analytics in the administrator workspace.",
                ],
            },
        ],
    },
    {
        "title": "IV. IMPLEMENTATION AND METHODOLOGY",
        "paragraphs": [
            "The verification workflow was designed to be reproducible with no dedicated bin hardware. Figure 2 shows the complete loop from token generation to reward issuance.",
        ],
        "figure": ("qr-flow", "Fig. 2. QR and geofence verification workflow."),
        "subsections": [
            {
                "title": "A. QR token lifecycle",
                "paragraphs": [
                    "A citizen opens Profile -> My Dustbin QR and requests a token. The client combines the citizen identifier, house address, timestamp, and a UUID, then hashes the string with SHA-256 through the Web Crypto API. The resulting 64-character hex token is stored with the house address and the GPS coordinates captured at the bin. Regenerating a token deactivates all previous active tokens for that citizen, and the QR code can be downloaded or printed.",
                ],
            },
            {
                "title": "B. Geofence verification",
                "paragraphs": [
                    "The driver scans the QR code with the browser camera using jsQR, or enters the token manually. The client requests a high-accuracy GPS reading and computes the Haversine distance to the stored bin location. The effective radius is 50 m plus the device-reported accuracy, capped at an additional 30 m. A scan is stored as success, location_mismatch, or invalid_token, together with driver, citizen, coordinates, distance, and validity flag. Camera failure, missing location, or token lookup failure are handled explicitly so the driver receives actionable feedback.",
                ],
            },
            {
                "title": "C. Civic Score and rewards",
                "paragraphs": [
                    "The reward model uses a bounded score from 300 to 900. A verified pickup awards 15 points, accurate segregation awards 30 points, a streak bonus adds 5 points, and a false complaint subtracts 50 points. Scores map to Eco-Novice, Civic Champion, and Elite Guardian tiers. Each change writes a ledger entry with reason and timestamp. Citizens redeem green tokens in a rewards store; redemption records and token balances are stored in PocketBase.",
                ],
            },
            {
                "title": "D. Analytics and payroll",
                "paragraphs": [
                    "The administrator panel merges bins, drivers, citizens, scores, payroll adjustments, and ledger entries into operational views. Scan analytics support filtering by status and sorting by time. Bin cards show fill level and status, while payroll adjustments support strike counts, deduction percentages, deduction amounts, and final wage. The performance tracker gives drivers a daily view of scans, deductions, and wage.",
                ],
            },
            {
                "title": "E. Validation setup",
                "paragraphs": [
                    "A seed script creates or refreshes a coherent local dataset: three demo users, citizen and driver profiles, three zones, six bins, an active QR token, a route, scan history, a Civic Score with ledger entries, rewards, and a payroll adjustment. The script is idempotent, which makes screenshots, demos, and automated checks repeatable.",
                ],
            },
        ],
    },
    {
        "title": "V. EVALUATION AND RESULTS",
        "paragraphs": [
            "The system was evaluated on a local development stack with Vite on port 3000 and PocketBase on port 8090. Validation combined static checks, build checks, CI execution, browser rendering inspection, and a seeded functional dataset. Table II summarizes the checks.",
        ],
        "subsections": [
            {
                "title": "A. Functional and build validation",
                "paragraphs": [
                    "ESLint reported no errors with npm run lint. The production build completed successfully, producing a CSS bundle of approximately 93 kB and a JavaScript bundle of approximately 798 kB before gzip. GitHub Actions ran lint and build on every push to main; both CI runs passed. Eight screenshots were captured at 1440 x 900 pixels across home, login, citizen dashboard, citizen instructions, dustbin QR, driver dashboard, admin panel, and admin instructions pages. Computed browser styles confirmed the burgundy background rgb(90, 9, 7), cream text rgb(232, 210, 181), and sage secondary text rgb(164, 166, 155).",
                ],
            },
            {
                "title": "B. Demo dataset",
                "paragraphs": [
                    "Table III reports the seeded dataset used for evaluation and screenshots. The dataset intentionally includes both successful and failed scans so that analytics and feedback states are visible during a demonstration.",
                ],
            },
            {
                "title": "C. Interface evidence",
                "paragraphs": [
                    "Figure 3 shows the citizen dashboard with pickup countdown, green-token balance, Civic Score arc, and rewards. Figure 4 shows the administrator panel with operational statistics and scan analytics. Both are rendered directly from the seeded local instance, not from static mockups.",
                ],
            },
        ],
    },
    {
        "title": "VI. LIMITATIONS AND ETHICAL CONSIDERATIONS",
        "paragraphs": [
            "The current geofence is based on browser-reported GPS. A determined participant could spoof location or photograph and share a QR token. The capped accuracy buffer improves usability but does not establish cryptographic proof of physical presence. Future deployments should combine server-side location attestation, token rotation, anomaly detection, and occasional supervisor audits.",
            "Proof-of-waste verification in the citizen camera flow is currently simulated in the client; no trained model is bundled. Location data and proof images are personal information and should be retained only as long as necessary, with clear consent and access controls. The encryption key for PocketBase must be stored outside version control, and losing it makes encrypted data unrecoverable.",
            "The application assumes connectivity during collection. A production deployment for areas with unstable mobile networks would need an offline queue with signed events and later reconciliation. The current role rules are suitable for a prototype; a municipal pilot should add stronger audit logging, role administration, and penetration testing.",
        ],
    },
    {
        "title": "VII. CONCLUSION AND FUTURE WORK",
        "paragraphs": [
            "CleanConnect demonstrates that household-level waste-collection verification can be implemented with inexpensive, widely available technology. A QR token tied to a saved geofence, combined with an accuracy-aware Haversine check, creates an auditable link between citizen, driver, time, and place. The resulting scan event powers Civic Points, rewards, performance tracking, and administrative analytics in one role-based application.",
            "Future work includes an offline-first progressive web app, server-verified location challenges, image-based waste-segregation classification, dynamic route optimization, carbon-credit integration, and a controlled pilot study with a municipality. Usability testing with sanitation workers and residents will be essential to refine the scanner flow and incentive design before production rollout.",
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
    ("driver_qr_scans", "Pickup evidence", "scan_status, distance_meters, is_location_valid"),
    ("civic_scores / ledger", "Incentive state", "current_score, tier_rank, points_changed, reason"),
    ("rewards / redemptions", "Token economy", "token_cost, tokens_spent, redemption_date"),
    ("payroll_adjustments", "Driver wage", "strike_count, deduction_amount, final_wage"),
]

TABLE_II = [
    ("Lint", "npm run lint", "Passed"),
    ("Production build", "npm run build", "Passed, 2092 modules"),
    ("CI", "GitHub Actions on main", "2/2 runs passed"),
    ("Screenshots", "8 pages at 1440 x 900", "Validated"),
    ("Theme", "Computed browser styles", "Palette confirmed"),
    ("Seed", "npm run seed:demo", "Idempotent"),
]

TABLE_III = [
    ("Demo users", "3 role accounts + local extras"),
    ("Zones / routes", "3 / 1 active route"),
    ("Bins", "6 (stable, critical, overflowing)"),
    ("Active QR token", "1 with saved geofence"),
    ("QR scans", "4 (3 success, 1 mismatch)"),
    ("Civic score", "640, Civic Champion"),
    ("Ledger entries", "3"),
    ("Rewards / payroll", "6 / 1"),
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
        title="CleanConnect: QR- and Geofence-Verified Waste Collection with Civic Incentives",
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
    story.append(Paragraph("CleanConnect: QR- and Geofence-Verified Waste Collection with Civic Incentives", styles["title"]))
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
    md = [f"# {html.unescape('CleanConnect: QR- and Geofence-Verified Waste Collection with Civic Incentives')}",
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
        "subtitle": "QR- and Geofence-Verified Waste Collection with Civic Incentives",
        "tag": "IEEE REPORT COMPANION DECK  |  HACKATHON / RESEARCH / STARTUP",
        "author": AUTHOR,
        "meta": ["Role-based web platform", "SQLite + PocketBase backend", "Burgundy | Cream | Sage"],
        "notes": "Open with the problem: waste collection is frequent but rarely verified at household level. CleanConnect closes that loop with a QR scan and a GPS geofence.",
    },
    {
        "type": "bullets",
        "kicker": "01 / PROBLEM",
        "title": "Household collection lacks proof",
        "bullets": [
            "Missed pickups are hard to prove after the truck has moved on.",
            "Route-level reporting hides what happened at a specific bin.",
            "Citizens receive little feedback for correct waste behavior.",
            "Drivers and administrators lack a shared, timestamped audit trail.",
            "Hardware-heavy smart-bin systems are costly to scale.",
        ],
        "callout": "Research gap: a low-cost, verifiable, household-level collection event.",
        "notes": "Emphasize that the goal is not just a dashboard, but a verifiable event that can drive accountability and incentives.",
    },
    {
        "type": "split",
        "kicker": "02 / SOLUTION",
        "title": "One verified pickup closes the loop",
        "left": [
            "Citizen generates a QR token bound to a saved bin location.",
            "Driver scans at the curb; app checks GPS distance.",
            "Successful scan awards Civic Points and writes a ledger entry.",
            "Administrator sees scans, bins, routes, scores, and payroll.",
        ],
        "right_title": "What makes it different",
        "right": [
            "No dedicated bin sensors required.",
            "Accuracy-aware 50 m geofence with capped GPS tolerance.",
            "Manual token fallback when the camera is unavailable.",
            "Reproducible demo data and CI validation.",
        ],
        "notes": "Frame the solution as a workflow, not a collection of screens. Each role gets value from the same scan event.",
    },
    {
        "type": "image",
        "kicker": "03 / ARCHITECTURE",
        "title": "A thin client over a typed backend",
        "image": "architecture_slide",
        "bullets": [
            "React 18 + Vite 7 frontend with role-protected routes.",
            "PocketBase 0.38 provides auth, REST, SQLite, rules, hooks.",
            "Migrations define 15+ collections and seed defaults.",
            "Static frontend can be hosted separately from PocketBase.",
        ],
        "notes": "The architecture is intentionally simple: a static SPA, a lightweight backend, and a single source of truth in SQLite.",
    },
    {
        "type": "flow",
        "kicker": "04 / VERIFICATION",
        "title": "QR + geofence verification",
        "image": "qr_flow_slide",
        "formula": "allowed radius = 50 m + min(device accuracy, 30 m)",
        "notes": "Walk through the seven steps. Highlight that mismatch and invalid-token states are recorded, not silently ignored.",
    },
    {
        "type": "table",
        "kicker": "05 / DATA MODEL",
        "title": "Collections behind the workflow",
        "headers": ["Collection group", "What it stores", "Why it matters"],
        "rows": [
            ["users, citizens, drivers", "Identity, role, zone, balances", "Role-based access and profiles"],
            ["zones, routes, bins", "Service geography and fill level", "Route assignment and monitoring"],
            ["bin_qr_tokens, scans", "Token, geofence, scan outcome", "Verifiable pickup evidence"],
            ["scores, ledger, rewards", "Civic Points and redemptions", "Incentive loop"],
            ["payroll_adjustments", "Strikes and deductions", "Driver accountability"],
        ],
        "notes": "Point out that scan records are the hub: they connect citizen rewards, driver performance, and admin analytics.",
    },
    {
        "type": "screenshots",
        "kicker": "06 / CITIZEN EXPERIENCE",
        "title": "Clear feedback and a visible incentive",
        "images": ["citizen_dashboard", "dustbin_qr"],
        "captions": ["Citizen dashboard", "Dustbin QR and scan history"],
        "bullets": [
            "Pickup countdown, token balance, Civic Score arc.",
            "QR download, print, and regeneration with geofence capture.",
        ],
        "notes": "Show the citizen dashboard first, then the QR panel. The QR is not decorative; it is the credential for verification.",
    },
    {
        "type": "screenshots",
        "kicker": "07 / OPERATIONS",
        "title": "Driver and administrator workspaces",
        "images": ["driver_dashboard", "admin_panel"],
        "captions": ["Driver dashboard", "Admin analytics"],
        "bullets": [
            "Drivers see assigned route, bins, scans, and wage.",
            "Administrators see city-wide stats, scan analytics, scores, and payroll.",
        ],
        "notes": "The same scan event updates both views. This is the operational value for municipalities and startups.",
    },
    {
        "type": "bullets",
        "kicker": "08 / INCENTIVE DESIGN",
        "title": "Civic Points make good behavior visible",
        "bullets": [
            "300-900 bounded score with three tiers: Eco-Novice, Civic Champion, Elite Guardian.",
            "+15 for a verified pickup, +30 for accurate segregation, +5 streak bonus.",
            "-50 for a false complaint; every change is written to a ledger.",
            "Green tokens are redeemable in a rewards store.",
            "Leaderboard and score arc provide social feedback.",
        ],
        "callout": "Incentives are tied to evidence, not self-reported actions.",
        "notes": "This is the research/behavioral angle: verifiable events make a points system fairer than self-reporting.",
    },
    {
        "type": "table",
        "kicker": "09 / VALIDATION",
        "title": "Repository and demo checks",
        "headers": ["Check", "Method", "Result"],
        "rows": [[a, b, c] for a, b, c in TABLE_II],
        "notes": "Mention that CI runs on every push and that eight screenshots were generated from the live seeded app.",
    },
    {
        "type": "table",
        "kicker": "10 / EVALUATION SETUP",
        "title": "Reproducible demo dataset",
        "headers": ["Artifact", "Seeded value"],
        "rows": [[a, b] for a, b in TABLE_III],
        "notes": "The seed script is idempotent. It intentionally includes a failed scan so analytics show realistic states.",
    },
    {
        "type": "split",
        "kicker": "11 / SUBMISSION VALUE",
        "title": "Why this fits hackathons, research, and startups",
        "left": [
            "Hackathon: complete demo, working QR scan flow, polished UI, live GitHub repo.",
            "Research: reproducible workflow, measurable verification rule, discussable limitations.",
            "Startup: clear roles, operational analytics, and a path to municipal SaaS pilots.",
        ],
        "right_title": "Potential pilots",
        "right": [
            "Residential societies and gated communities.",
            "Municipal ward-level collection contracts.",
            "Campus and industrial estate waste programs.",
            "Partner-led rewards and sustainability programs.",
        ],
        "notes": "Adapt the framing to the audience: judges want a demo, researchers want method, investors want a path to deployment.",
    },
    {
        "type": "bullets",
        "kicker": "12 / LIMITATIONS",
        "title": "Honest constraints and next steps",
        "bullets": [
            "Browser GPS can be spoofed or shared; QR tokens can be photographed.",
            "Camera scan requires permission; manual fallback mitigates failure.",
            "Proof-of-waste image verification is simulated, not ML-backed.",
            "Offline collection is not yet supported.",
            "Location and proof images require consent and retention policies.",
            "Next: offline queue, server attestation, ML proof, dynamic routing, pilot study.",
        ],
        "callout": "Prototype-ready today; production needs hardening and field validation.",
        "notes": "Be candid. Judges and reviewers value a clear understanding of what is proven and what is future work.",
    },
    {
        "type": "closing",
        "title": "CleanConnect",
        "subtitle": "Verifiable collection. Visible incentives. Actionable analytics.",
        "lines": [
            "IEEE-style report and companion deck included in the repository.",
            "Demo accounts, seed script, CI, and screenshots included.",
            "Open for pilots, research collaboration, and startup validation.",
        ],
        "url": REPO_URL,
        "notes": "Close with the repository link and invite questions. Offer to walk through the QR scan flow live.",
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
