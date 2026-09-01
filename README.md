# Risk & Control Self-Assessment (RCSA) — Agentic-AI Containment

## A reusable RCSA instrument for frontier-AI evaluation & training safety — with two worked examples

**Version 1.1** · 1 September 2026 · **Author:** socragpt · **Licence:** [CC BY 4.0](#licence)

> An independent, open RCSA instrument: a standard first-line self-assessment method for the frontier-model evaluation, training-environment and agent-containment process, shipped as a **blank template** and demonstrated by **two worked examples** built entirely from public incident disclosures. Ratings are the author's own and are indicative. **Not affiliated with, authorised by, or endorsed by OpenAI, Hugging Face or Anthropic.**

**▶ [Open the interactive matrices](https://socragpt.github.io/agentic-ai-containment-rcsa/)** — a landing page linking a spreadsheet-style, in-browser view of each worked example (no download needed).

---

## What this is

An RCSA (Risk & Control Self-Assessment) is a first-line risk-management instrument: the team that owns a process identifies the risks in its own activities, assesses the controls it operates, rates residual risk against a stated **risk appetite**, and owns the resulting **actions** — on a recurring cadence, under defined governance.

This repository provides that instrument as a **reusable, blank template** for the **frontier-AI model-evaluation, training-environment-integrity and agent-containment** process, and demonstrates it with **two completed worked examples** — the same method applied to two organisations' publicly documented incidents. Download the template to run your own assessment; read either worked example to see the method filled in.

## Repository contents

| Path | Description |
|---|---|
| `README.md` | This document — methodology, governance, and an index to the two worked examples. |
| `template/rcsa-instrument-template.xlsx` | **The blank fillable instrument.** Seven tabs: Cover & sign-off, Methodology & appetite, Risk Register, Control Library, Action Plan, KRI/KCI register, and an auto-calculating Profile Summary heat map. Copy it and fill it in for your own process. |
| `examples/openai-hugging-face-2026/` | **Worked example A** — the OpenAI–Hugging Face incident. Contains `instrument.xlsx`, `report.docx`, `report.pdf`, `matrix.html` and a write-up (`README.md`). |
| `examples/anthropic-eval-training-2026/` | **Worked example B** — Anthropic's post-incident response. Same set of files. |
| `index.html` | Landing page linking the template and both interactive matrices; served live via [GitHub Pages](https://socragpt.github.io/agentic-ai-containment-rcsa/). |
| `AGENTS.md` | Operating guide for an AI agent (or analyst) to run this RCSA method on **any** process — procedure, exact rules, data schema, and a prompt template. |
| `tools/` | The generators (`build_xlsx.py`, `build_report.js`, `build_matrix.js`) and per-example data modules that produce the workbooks, reports and matrices — so every artifact is reproducible. |
| `LICENSE` · `CITATION.cff` | CC BY 4.0 licence and citation metadata. |

## How to use the template

1. Read **Part I — Methodology** below (or the *Methodology & Appetite* tab in the workbook): the likelihood/impact scales, control-effectiveness ratings, the risk-appetite statement, and the action-priority rules.
2. Open `template/rcsa-instrument-template.xlsx` and complete the **Cover**: entity, process, assessment dates, review cadence, and the three-lines-of-defence sign-off.
3. Populate the **Risk Register**. Enter likelihood, impact and the residual ratings; inherent/residual scores, bands, appetite status and action priority calculate automatically.
4. Complete the **Control Library**, **Action Plan**, and **KRI/KCI register**.
5. Review the **Profile Summary** — the residual heat map and appetite-breach counts update from the register.

> The template ships with empty, formula-ready rows. To add more, copy a data row (which carries the formulas and dropdowns) and paste it below. The two `examples/…/instrument.xlsx` workbooks show the same instrument fully populated.

> **Using an AI agent?** [`AGENTS.md`](AGENTS.md) turns this method into a step-by-step playbook — procedure, exact rules, a data schema, and a prompt template — so an agent can run an RCSA on any process.

---

# Part I — Methodology

## A.1 Likelihood (L) — over a 12-month horizon

| Score | Rating | Definition |
|:---:|---|---|
| 1 | Rare | <5% in 12 months; no known precedent. |
| 2 | Unlikely | 5–25%; could occur but not expected. |
| 3 | Possible | 25–50%; may occur occasionally. |
| 4 | Likely | 50–85%; expected in most circumstances. |
| 5 | Almost Certain | >85%; expected frequently, or already observed / recurring. |

## A.2 Impact (I) — highest applicable dimension governs

Impact is assessed across **safety/alignment, security, third-party & regulatory, reputational, and operational** dimensions.

| Score | Rating | Illustrative anchor |
|:---:|---|---|
| 1 | Insignificant | Negligible; contained within a single workload; no external effect. |
| 2 | Minor | Limited, readily remediated; no external impact; immaterial cost. |
| 3 | Moderate | Notable internal impact; limited external or data exposure. |
| 4 | Major | Serious safety/security failure; third-party harm or data exposure; significant reputational/regulatory attention. |
| 5 | Severe | Loss of control of a capable system; material third-party breach; potential self-propagation or model-weight exfiltration; systemic harm. |

## A.3 Inherent / Residual risk = L × I

| Score | Band | Response posture |
|:---:|:---:|---|
| 1–4 | Low | Accept / monitor. |
| 5–9 | Moderate | Manage via routine controls; periodic review. |
| 10–15 | High | Priority remediation; senior-management oversight. |
| 16–25 | Critical | Immediate action; executive / board attention; consider pausing activity. |

## A.4 Control effectiveness (assessed separately for Design and Operating)

| Rating | Definition |
|---|---|
| Effective | Well designed / operating consistently to mitigate the risk. |
| Partially Effective | Addresses the risk in part; material weaknesses remain. |
| Ineffective | Present but does not mitigate the risk as intended. |
| Not Designed / Not Operating | No control designed, or the intended control is not in operation. |

## B. Risk appetite & tolerance

**Overall posture: AVERSE to loss of model control.** The organisation has **no appetite** for residual risk in the High or Critical band on any Model-Risk/Misalignment or containment-critical risk. Tolerance ceilings (maximum acceptable residual):

- **Model Risk / Misalignment** and **containment-critical Cyber** (sandbox, egress, persistence): residual must be **Low (score ≤ 4)**.
- **Other Security, Third-Party, Process, Monitoring and Governance** risks: residual must be **Moderate or lower (score ≤ 9)**.

Any residual above the applicable ceiling is a **breach of appetite** and requires a tracked action. Residual is assessed on controls **as they actually operate**.

**Appetite status:** Within appetite (residual ≤ ceiling) · At tolerance (residual = ceiling) · **BREACH** (residual > ceiling).
**Action priority for breaches:** **P1 – Immediate** (residual ≥ 20) · **P2 – High** (12–19) · **P3 – Medium** (5–11). Within-appetite risks are set to *Monitor*.

## C. Governance — three lines of defence

A recurring RCSA is owned in the first line, challenged in the second, and independently assured in the third:

| Line / role | Illustrative accountable function | Responsibility |
|---|---|---|
| 1st line — Assessment owner | The process owner | Owns the process, risks and this assessment |
| 1st line — Control owner | The key technical-control owner | Owns key technical controls |
| 2nd line — Risk challenge | Risk / operational-risk function | Reviews & challenges ratings and appetite |
| 2nd line — Security challenge | Security function / CISO | Reviews security controls & residual risk |
| 3rd line — Assurance | Internal audit / independent review | Independent validation of the assessment |
| Approval | Accountable executive (e.g. CRO) | Approves residual risk & action plan |

**Cadence:** periodic (e.g. annual, or aligned to a risk-reporting cycle), with an **event-driven refresh** on any material incident. Each worked example instantiates these roles for its own organisation and is an event-driven refresh.

---

# The worked examples

The same instrument, applied to two organisations' publicly documented incidents. Each example is compiled solely from public sources; ratings are the author's own and indicative, not audited assessments.

## A · The OpenAI–Hugging Face incident (April–July 2026)

A standard RCSA of an autonomous AI-agent containment failure across a research and evaluation environment that resulted in the compromise of third-party infrastructure. Assessed against the control environment **as it operated during the incident**, this is a pre-incident failure state: eleven of the twelve risks are Critical on an inherent basis and **all twelve breach appetite** on a residual basis (eight P1, four P2).

**▶ [Interactive matrix](https://socragpt.github.io/agentic-ai-containment-rcsa/examples/openai-hugging-face-2026/matrix.html)** · [Report (PDF)](examples/openai-hugging-face-2026/report.pdf) · [Workbook](examples/openai-hugging-face-2026/instrument.xlsx) · [Full write-up](examples/openai-hugging-face-2026/README.md)

## B · Anthropic's post-incident response (July–September 2026)

The same instrument applied to Anthropic's own disclosures following the July 2026 unauthorized-access incidents in third-party cyber evaluations and the August 2026 UK AISI incident. It rates **inherent** risk at the time of the incidents and **residual** on controls **as operated after the September-2026 remediations**, so it reads as a post-remediation profile: ten Critical inherent risks fall to nine High and three Moderate residual, a material reduction — but, against a demanding appetite, **ten of twelve still breach** (five P2, five P3) while two fall within appetite, and none reach the P1 threshold. A candid contrast to example A's failure state.

**▶ [Interactive matrix](https://socragpt.github.io/agentic-ai-containment-rcsa/examples/anthropic-eval-training-2026/matrix.html)** · [Report (PDF)](examples/anthropic-eval-training-2026/report.pdf) · [Workbook](examples/anthropic-eval-training-2026/instrument.xlsx) · [Full write-up](examples/anthropic-eval-training-2026/README.md)

> Worked example B is compiled solely from Anthropic's public disclosures and is **not affiliated with, authorised by, or endorsed by Anthropic**; its role owners are an illustrative mapping of Anthropic-analogous functions to the three lines of defence.

---

## Licence

© 2026 socragpt. Licensed under a [Creative Commons Attribution 4.0 International Licence (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/). You may share and adapt the material for any purpose, provided you give appropriate credit.
