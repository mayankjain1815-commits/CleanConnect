# CleanConnect submission deliverables

This index lists the submission-ready artifacts generated for CleanConnect and the exact commands used to verify and regenerate them. All artifacts use the project palette: deep burgundy `#590907`, warm cream `#E8D2B5`, and sage grey `#A5A79B`.

Repository: <https://github.com/mayankjain1815-commits/CleanConnect>

## Artifacts

| Artifact | Path | Format | Best for |
| --- | --- | --- | --- |
| IEEE-style report | [`docs/ieee-report/CleanConnect_IEEE_Report.pdf`](ieee-report/CleanConnect_IEEE_Report.pdf) | 4-page two-column PDF | Research papers, issue submissions, technical appendices |
| Report source | [`docs/ieee-report/CleanConnect_IEEE_Report.md`](ieee-report/CleanConnect_IEEE_Report.md) | Markdown | Editing text before regenerating the PDF |
| Report diagrams | [`docs/ieee-report/figures/`](ieee-report/figures/) | PNG | Reuse in papers, posters, or slides |
| Presentation deck | [`docs/presentation/CleanConnect_Presentation.pptx`](presentation/CleanConnect_Presentation.pptx) | 14-slide editable PPTX, 16:9, speaker notes | Hackathon demos, industry pitches, startup presentations |
| Presentation PDF | [`docs/presentation/CleanConnect_Presentation.pdf`](presentation/CleanConnect_Presentation.pdf) | 14-page 16:9 PDF (960 x 540 pt) | Quick sharing, printing, submission portals |
| Presentation notes | [`docs/presentation/CleanConnect_Presentation.md`](presentation/CleanConnect_Presentation.md) | Markdown | Slide titles, content, and speaker notes |
| Slide diagrams | [`docs/presentation/assets/`](presentation/assets/) | PNG | Reuse in other decks |
| Interface screenshots | [`docs/screenshots/`](screenshots/) | 8 PNGs, 1440 x 900 | README, demo evidence, appendix figures |
| Generator | [`scripts/generate-submission-docs.py`](../scripts/generate-submission-docs.py) | Python 3 script | Reproducible PDF/PPTX generation |
| Pinned dependencies | [`scripts/requirements-docs.txt`](../scripts/requirements-docs.txt) | pip requirements | Reproducible local generation |

## What the report contains

- Title, author, affiliation, abstract, and index terms.
- Seven numbered sections: introduction, related work, architecture, methodology, evaluation, limitations/ethics, and conclusion.
- Tables for PocketBase collections, validation checks, and the seeded demo dataset.
- Figures for the system architecture, QR/geofence workflow, citizen dashboard, and administrator analytics.
- Twelve numbered references, including Crossref-verified DOI entries and official framework documentation.

## What the deck contains

1. Title and positioning
2. Problem statement
3. End-to-end solution
4. System architecture
5. QR and geofence verification
6. Data model
7. Citizen experience
8. Driver and administrator operations
9. Civic Points incentive design
10. Repository and demo validation
11. Reproducible evaluation setup
12. Submission value for hackathons, research, and startups
13. Limitations and next steps
14. Closing and repository link

Every slide includes speaker notes in the PPTX and in the Markdown companion.

## Verification record

| Check | Result |
| --- | --- |
| `npm run lint` | Passed |
| `npm run build` | Passed, 2092 modules transformed |
| GitHub Actions CI on `main` | 2/2 runs passed |
| IEEE report PDF | 4 pages; all sections and references present |
| Presentation PPTX | 14 slides; 16:9; 14 speaker-note pages |
| Presentation PDF | 14 pages; all pages 960 x 540 pt |
| Screenshots | 8 images, all 1440 x 900 |
| Theme tokens | Burgundy, cream, and sage confirmed in Tailwind config and browser styles |
| Secrets in tracked source | None found |

## Regenerate the documents

From the repository root:

```bash
python3 -m venv .venv-docs
source .venv-docs/bin/activate
python -m pip install -r scripts/requirements-docs.txt
python scripts/generate-submission-docs.py
```

The generator rewrites the PDF, PPTX, Markdown, diagram, and asset files listed above. It reads the existing screenshots under `docs/screenshots/`.

To inspect the generated PDFs with `pypdf`:

```bash
python - <<'PY'
from pypdf import PdfReader
for path in (
    "docs/ieee-report/CleanConnect_IEEE_Report.pdf",
    "docs/presentation/CleanConnect_Presentation.pdf",
):
    reader = PdfReader(path)
    print(path, len(reader.pages), reader.pages[0].mediabox)
PY
```

## Demo setup

The seeded demo accounts are `citizen@demo.local`, `driver@demo.local`, and `admin@demo.local`, all with password `Demo12345!`. Refresh the local dataset with:

```bash
PB_SUPERUSER_EMAIL=admin@cleanconnect.local \
PB_SUPERUSER_PASSWORD='your-superuser-password' \
npm run seed:demo
```

The seed script is idempotent and includes both successful and mismatched scans so that dashboards show realistic states during a live demo.
