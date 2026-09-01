# AGENTS.md — Conduct an RCSA for any process

This repository is a reusable **Risk & Control Self-Assessment (RCSA)** instrument. This file is the operating guide for an **AI agent** (or an analyst working with one) to produce a rigorous RCSA for **any process**, following the method in [`README.md`](README.md) and populating a copy of the blank instrument [`template/rcsa-instrument-template.xlsx`](template/rcsa-instrument-template.xlsx).

> An RCSA is a **first-line self-assessment**: the team that owns the process assesses its own risks and controls, rates residual risk against a stated appetite, and owns the resulting actions. Preserve that framing — the agent **drafts and challenges; the process owner owns the ratings and the appetite.**

## When to use

- A researcher wants an RCSA for a specific process — e.g. *model evaluation*, *data-labelling pipeline*, *third-party model hosting*, *fine-tuning*, *incident response*.
- As a **periodic** assessment, or an **event-driven refresh** after an incident.

## Inputs to gather first

Ask for (or infer, clearly labelling assumptions):

1. **Process** name + a one–two sentence description; its **owner** (a role).
2. **Boundary** — what is in and out of scope.
3. **Evidence/context** — architecture, prior incidents, control documentation, metrics, audit findings. For an event-driven refresh: the triggering incident and its facts/sources.
4. **Risk appetite**, if the org has one; otherwise propose ceilings (§Rules) and flag them for owner sign-off.

Do **not** fabricate evidence. Where you assume, say so and lower your confidence.

## The method (summary; full definitions in README Part I)

- **Inherent risk = Likelihood (L, 1–5) × Impact (I, 1–5)** → band: Low 1–4, Moderate 5–9, High 10–15, Critical 16–25.
- **Control effectiveness** — rate **design** and **operating** *separately* (Effective / Partially Effective / Ineffective / Not Designed / Not Operating), then derive **overall**.
- **Residual risk = residual L × residual I**, assessed on controls **as they actually operate** — not as designed or aspired.
- **Appetite & tolerance** — a *ceiling* (max acceptable residual) per risk category. Residual above the ceiling is a **breach** and requires a tracked action.
- **Action priority** for breaches: **P1** (residual ≥ 20), **P2** (12–19), **P3** (5–11); within appetite → **Monitor**.
- **Governance** — three lines of defence (owner / risk & security challenge / independent assurance) and a review cadence.

## Procedure (do in order)

1. **Scope & decompose.** State the boundary; break the process into ~5–10 sub-processes / activities.
2. **Taxonomy.** Map risks to a small Level-1 taxonomy suited to the domain (for AI, e.g.: Model Risk/Misalignment · Technology & Cyber · Credential Security · Third-Party & Supply Chain · Process & Execution · Detection & Monitoring · Governance & Oversight · Data & Assurance Integrity). Reuse/adapt a fixed set — don't invent a category per risk.
3. **Identify risks.** For each activity, state risks as **cause → event → consequence**. Capture the *material few* (usually 8–15), not an exhaustive list.
4. **Rate inherent.** Assign L and I with a brief rationale; compute score and band.
5. **Map controls.** For each risk, list the **key controls** that should mitigate it; assess **design** and **operating** effectiveness against evidence; derive overall.
6. **Rate residual.** Re-rate L and I given controls **as operated**. If controls are weak, residual ≈ inherent — say so plainly rather than discounting. For an event-driven refresh after remediation, you may rate inherent at the time of the incident and residual on the controls **as remediated** — state the two snapshots explicitly (worked example B does this).
7. **Appetite.** Set the ceiling per category (propose if none exists) and compute appetite status.
8. **Prioritise.** Derive action priority from residual vs appetite.
9. **Actions.** For **every breach**, define an action: description, owner (role), target window, status, and **target residual** once done.
10. **Indicators.** Define 5–10 **KRIs/KCIs**: name, measure, threshold/appetite, owner, related risks.
11. **Governance.** Complete the cover: entity, process, assessment ID/type, date, **next review**, and the three-lines sign-off (owner · 2nd-line challenge · 3rd-line assurance · approver).
12. **Produce outputs.** Populate the workbook (below) and/or emit the register as a table. Summarise: overall residual, number of breaches, count of P1/P2 actions.

## Rules & formulas (implement exactly)

```text
band(score)   = "Critical" if score>=16 else "High" if score>=10 else "Moderate" if score>=5 else "Low"

overall_effectiveness(design, operating):
    if design=="Not Designed" or operating=="Not Operating":  "Not established"
    elif design=="Effective" and operating=="Effective":      "Effective"
    elif operating=="Ineffective":                            "Ineffective"
    else:                                                     "Partially effective"

appetite_status(residual, ceiling) = "BREACH"       if residual >  ceiling
                                     "At tolerance"  if residual == ceiling
                                     "Within"        otherwise

priority(residual, breach) = "Monitor"        if not breach
                             "P1 – Immediate" if residual >= 20
                             "P2 – High"      if residual >= 12
                             "P3 – Medium"    otherwise
```

**Default appetite (adapt to the org):** **Low (≤ 4)** for safety-/misalignment- and containment-critical risks; **Moderate (≤ 9)** for the rest.

## Data schema (fields per row)

**Risk register** — `id · sub_process · category · risk(cause→event→consequence) · inh_L · inh_I · inh_score · inh_band · key_controls · design · operating · overall · res_L · res_I · res_score · res_band · appetite_ceiling · appetite_status · priority · owner · action_ref`

**Control library** — `id · objective · related_risks · type(Preventive/Detective/Corrective) · key(Y/N) · frequency · owner · design · operating · overall · deficiency_and_remediation`

**Action plan** — `id · addresses(risk/gap) · finding · action · owner · priority · target · status · target_residual`

**KRI / KCI** — `id · indicator · type(KRI/KCI) · measure · target · owner · related_risks`

## Using the repo artifacts

- **`template/rcsa-instrument-template.xlsx`** — the blank working instrument. To start: copy it, populate the Cover and the data rows in the Register / Control Library / Action Plan / KRI tabs (the headers, dropdowns and formulas are already in place). The Profile Summary heat map and appetite-breach counts recompute automatically. Build/edit with `openpyxl` and **keep formulas — never hard-code computed results.**
- **`README.md`** — the full methodology plus an index to two completed worked examples to pattern-match against.
- **`examples/openai-hugging-face-2026/`** and **`examples/anthropic-eval-training-2026/`** — each worked example ships a populated `instrument.xlsx`, a narrative `report.pdf`/`.docx`, an interactive `matrix.html`, and a `README.md` write-up. Example B demonstrates the two-snapshot (inherent-at-incident, residual-post-remediation) approach.
- **`tools/`** — the generators (`build_xlsx.py`, `build_report.js`, `build_matrix.js`) and per-example data modules. To add a third example, author a data module and run the generators; the workbook, report and matrix follow.
- **`index.html`** — the landing page and interactive matrices; a presentation reference, not an input.

## Quality bar (self-check before finishing)

- Residual reflects controls **as operated**, backed by evidence or a labelled assumption — not aspiration.
- **Every breach** has an owned action with a target residual.
- Appetite ceilings are stated and justified, and routed to the owner for sign-off.
- Categories come from a fixed taxonomy; the register is the material few, not everything imaginable.
- 2nd-line challenge and 3rd-line assurance roles are named; cadence and next-review date are set.
- Numbers tie out: `band(score)` correct, priority follows the rule, and the profile counts match the register.

## Guardrails

- This is a **self-assessment aid** — not an audited opinion and not legal advice. State that.
- Preserve **first-line ownership**: the agent drafts and challenges; the process owner owns the ratings and appetite.
- Be honest about weak controls and real residual exposure; do **not** inflate effectiveness to look reassuring.
- Keep **as-operated** residual separate from **target / post-remediation** residual.
- Cite sources for external facts; label assumptions and confidence.

## Prompt template (hand this to an agent)

> Conduct an RCSA for **`<process>`** owned by **`<role>`**; scope **`<in / out>`**. This is a **`<periodic | event-driven refresh after: incident + facts/sources>`**. Use the method in `README.md` and the schema and rules in `AGENTS.md`.
>
> Produce: (1) a **risk register** — the material risks as cause→event→consequence, with inherent → controls (design/operating) → residual, appetite status, priority and owner; (2) a **control library**; (3) an **action plan** for every breach; (4) **KRIs/KCIs**; and (5) a **governance cover** with three-lines sign-off.
>
> Rate residual on controls **as they actually operate**, label every assumption, propose appetite ceilings for my sign-off, and flag where you lack evidence. Then populate a copy of `template/rcsa-instrument-template.xlsx`.

---

*Part of the [Agentic-AI Containment RCSA](README.md). © 2026 socragpt · Licensed [CC BY 4.0](LICENSE). Illustrative — not affiliated with, authorised by, or endorsed by any organisation named in the worked examples.*
