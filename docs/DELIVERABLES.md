# CleanConnect submission deliverables

This index lists the submission-ready artifacts generated for CleanConnect and the exact commands used to verify and regenerate them. All artifacts use the project palette: deep burgundy `#590907`, warm cream `#E8D2B5`, and sage grey `#A5A79B`.

Repository: <https://github.com/mayankjain1815-commits/CleanConnect>

## Direct downloads

GitHub's web preview does not reliably render Office documents. Use these raw-file links to download the originals and open them locally:

- [IEEE report PDF](https://github.com/mayankjain1815-commits/CleanConnect/raw/refs/heads/main/docs/ieee-report/CleanConnect_IEEE_Report.pdf)
- [Presentation PPTX](https://github.com/mayankjain1815-commits/CleanConnect/raw/refs/heads/main/docs/presentation/CleanConnect_Presentation.pptx)
- [Presentation PDF](https://github.com/mayankjain1815-commits/CleanConnect/raw/refs/heads/main/docs/presentation/CleanConnect_Presentation.pdf)

Current SHA-256 checksums:

| File | SHA-256 |
| --- | --- |
| `CleanConnect_IEEE_Report.pdf` | `0d2e2db23ae178faf552feaa23d94e52ffafdde14d237446da184777c78ede2d` |
| `CleanConnect_Presentation.pdf` | `5255a6809b3ad52ac9d946bfc816b9ac217e8eaad4f7d2d750b39da0a690f1e3` |
| `CleanConnect_Presentation.pptx` | `732bea3518a1debcbad19a31934375d2c6ca2346f7237dc488e3aee8b8c17bcd` |

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

1. Title
2. The problem
3. One scan at the bin
4. Architecture
5. The scan check
6. What is stored
7. Citizen side
8. Driver and admin views
9. Civic Points
10. Validation
11. Demo setup
12. Use cases
13. What is not done yet
14. Closing and repository link

Every slide includes speaker notes in the PPTX and in the Markdown companion.

## Verification record

| Check | Result |
| --- | --- |
| `npm run lint` | Passed |
| `npm run build` | Passed, 2092 modules transformed |
| GitHub Actions CI | Lint and build on pushes and pull requests to `main`; history lives on GitHub |
| IEEE report PDF | 4 pages; all sections and references present |
| Presentation PPTX | 14 slides; 16:9; 14 speaker-note pages; no text-box overflow or out-of-bounds shapes |
| Presentation PDF | 14 pages; all pages 960 x 540 pt; no out-of-page text |
| Screenshots | 8 images, all 1440 x 900 |
| Demo seed | Repeatable; scans, ledger and payroll rows are recreated |
| Theme tokens | Burgundy, cream, and sage confirmed in Tailwind config and browser styles |
| Binary integrity | PDF headers/EOF and PPTX ZIP/XML validated; GitHub raw hashes match local files |
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

The seed script is repeatable and includes both successful and mismatched scans so that dashboards show realistic states during a live demo. Most rows are upserted, while scans, ledger rows and the payroll row are recreated each run.
