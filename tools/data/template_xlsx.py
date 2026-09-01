# -*- coding: utf-8 -*-
"""Workbook dataset — the BLANK reusable instrument (no worked example).
Consumed by tools/build_xlsx.py --blank. Renders headers, formulas, dropdowns
and the live Profile Summary with empty data rows for a fresh assessment."""

META = {
    "dir": "template",
    "xlsx_masthead_2": "Reusable instrument — a standard method for assessing any process",
    "xlsx_masthead_3": "Blank template — copy this workbook and complete the tabs for your own assessment",
    "xlsx_byline": "Version 1.1  ·  1 September 2026  ·  Author: socragpt  ·  Licence: CC BY 4.0",
    "cover_note": "An independent, open Risk & Control Self-Assessment (RCSA) instrument: a standard first-line self-assessment method for any process. Complete the tabs below; the scores, bands, appetite status, priorities and the profile heat map calculate automatically. Two completed worked examples ship alongside this template in the repository's examples/ folder.",
    "cover_legend": "Legend — cells shaded pale yellow are for completion by the assessor. In the register and library tabs, white data cells are editable; grey/navy headers and the calculated columns (scores, bands, appetite status, priority) are driven by formulas. © 2026 socragpt. Licensed under CC BY 4.0.",
    "xlsx_register_title": "Risk Register  —  [process assessed]",
    "xlsx_control_title": "Control Library  —  key controls and their design & operating effectiveness",
    "xlsx_action_title": "Action Plan  —  remediation of control gaps (priority derived from residual vs appetite)",
}

HOW_TO_USE = [
 "1.  Read the Methodology & Appetite tab: likelihood/impact scales, control-effectiveness ratings, the risk-appetite statement and the action-priority rules.",
 "2.  Complete this Cover: entity, process, dates, cadence, and the three-lines-of-defence sign-off.",
 "3.  Populate the Risk Register (tab 3). Enter Likelihood, Impact and the residual ratings; inherent/residual scores, bands, appetite status and priority calculate automatically.",
 "4.  Complete the Control Library (tab 4), Action Plan (tab 5) and KRI/KCI register (tab 6).",
 "5.  Review the Profile Summary (tab 7) — residual heat map and appetite-breach counts update from the register.",
 "Add rows as needed: copy a data row (which carries the formulas and dropdowns) and paste it below. See the examples/ folder for two completed assessments.",
]

COVER_META = [
 ("Entity / organisation", "[Your organisation]"),
 ("Process assessed", "[Process under assessment]"),
 ("Assessment ID", "RCSA-[XXX]-[YYYY]-[NN]"),
 ("Assessment type", "[Periodic  /  Event-driven refresh (post-incident)]"),
 ("Assessment period", "[FYxxxx]"),
 ("Review cadence", "[e.g. Annual, with event-driven refresh on any material incident]"),
 ("Date performed", "[date]"),
 ("Next scheduled review", "[date, or on next material change]"),
 ("Status", "[Draft / For second-line review / Approved]"),
]

SIGNOFF = [
 ("1st line — Assessment owner","[Process owner role]","Owns the process, risks and this assessment",""),
 ("1st line — Control owner","[Key control owner role]","Owns key controls",""),
 ("2nd line — Risk challenge","[Risk function]","Reviews & challenges ratings and appetite",""),
 ("2nd line — Security challenge","[Security function]","Reviews security controls & residual risk",""),
 ("3rd line — Assurance","[Internal Audit / independent review]","Independent validation of the assessment",""),
 ("Approval","[Approver role]","Approves residual risk & action plan",""),
]

# Empty data lists — build_xlsx.py --blank lays down formula rows regardless.
RISKS = []
CONTROLS = []
ACTIONS = []
KRIS = []

DATA = {
    "META": META, "HOW_TO_USE": HOW_TO_USE, "COVER_META": COVER_META,
    "SIGNOFF": SIGNOFF, "RISKS": RISKS, "CONTROLS": CONTROLS,
    "ACTIONS": ACTIONS, "KRIS": KRIS,
}
