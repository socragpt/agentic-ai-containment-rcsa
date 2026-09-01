/* Build an RCSA narrative report (.docx) from a dataset module.
 *   node build_report.js <slug>
 * Loads ./data/<slug>_report.js and writes ../examples/<dir>/report.docx.
 * The methodology rating scales (Appendix A) are identical for every example;
 * all example-specific content comes from the dataset module. */
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, AlignmentType,
  PageOrientation, Footer, PageNumber, VerticalAlign, TableLayoutType
} = require("docx");
const fs = require("fs");
const path = require("path");

const slug = process.argv[2];
if (!slug) { console.error("usage: node build_report.js <slug>"); process.exit(1); }
const D = require(path.join(__dirname, "data", `${slug}_report.js`));

// ---------- palette ----------
const NAVY = "1F3864", NAVY2 = "2E4B7A", GREY_BORDER = "BFBFBF", HDR_TXT = "FFFFFF";
const SUBHDR_FILL = "D9E1F2", ALT_FILL = "F4F6FB";
const band = {
  Critical: { fill: "F4CCCC", txt: "9C0006" },
  High:     { fill: "FCE4D6", txt: "9C4415" },
  Moderate: { fill: "FFF2CC", txt: "7F6000" },
  Low:      { fill: "E2EFDA", txt: "375623" },
};
const eff = {
  "Effective": "375623", "Partially Effective": "9C6500",
  "Ineffective": "C00000", "Not Implemented": "833C00", "Not Designed": "833C00",
};

// ---------- helpers ----------
function tb(color, sz) { return { style: BorderStyle.SINGLE, size: sz || 4, color: color || GREY_BORDER }; }
const cellBorders = { top: tb(), bottom: tb(), left: tb(), right: tb() };
function runs(text, opts = {}) {
  return new TextRun({ text, bold: !!opts.bold, italics: !!opts.italics, color: opts.color, size: opts.size || 21, font: opts.font });
}
function para(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align,
    spacing: { after: opts.after != null ? opts.after : 100, before: opts.before || 0, line: opts.line || 252, lineRule: "auto" },
    children: Array.isArray(text) ? text : [runs(text, opts)],
  });
}
function sectionHeading(text) {
  return new Paragraph({ spacing: { before: 150, after: 60, line: 252, lineRule: "auto" },
    children: [ new TextRun({ text, bold: true, color: NAVY, size: 22 }) ] });
}
function cell(children, opts = {}) {
  const kids = Array.isArray(children) ? children : [children];
  const paras = kids.map(k => (typeof k === "string")
    ? new Paragraph({ alignment: opts.align, spacing: { after: 20, line: 232, lineRule: "auto" },
        children: [ new TextRun({ text: k, bold: opts.bold, color: opts.color, size: opts.size || 17 }) ] })
    : k);
  return new TableCell({
    width: { size: opts.width, type: WidthType.DXA },
    shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill, color: "auto" } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 40, bottom: 40, left: 70, right: 70 },
    borders: cellBorders, children: paras,
  });
}
function headerRow(labels, widths, opts = {}) {
  return new TableRow({ tableHeader: true, children: labels.map((l, i) => cell(l, {
    width: widths[i], fill: opts.fill || NAVY, color: opts.color || HDR_TXT, bold: true, size: opts.size || 17, align: AlignmentType.LEFT })) });
}
function bandCell(bText, width) {
  const b = band[bText.split(" ").slice(-1)[0]] || band.High;
  return cell(bText, { width, fill: b.fill, color: b.txt, bold: true, align: AlignmentType.CENTER });
}
function effCell(eText, width) {
  const key = Object.keys(eff).find(k => eText.startsWith(k)) || "Ineffective";
  return cell(eText, { width, color: eff[key], bold: true });
}
function makeTable(widths, rows) {
  return new Table({ columnWidths: widths, width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows });
}
function footer(text) {
  return new Footer({ children: [ new Paragraph({ alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: GREY_BORDER, space: 4 } }, spacing: { before: 60 },
    children: [
      new TextRun({ text: text + "   |   Page ", size: 15, color: "808080" }),
      new TextRun({ children: [PageNumber.CURRENT], size: 15, color: "808080" }),
      new TextRun({ text: " of ", size: 15, color: "808080" }),
      new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 15, color: "808080" }),
    ] }) ] });
}
function fitWidths(w0, LW) { const s = w0.reduce((a,b)=>a+b,0); const f = w0.map(w=>Math.round(w*LW/s)); f[f.length-1] += LW - f.reduce((a,b)=>a+b,0); return f; }
function priBand(p){ if(p.indexOf("P1")>=0)return band.Critical; if(p.indexOf("P2")>=0)return band.High; if(p.indexOf("P3")>=0)return band.Moderate; return band.Low; }
function statusBand(s){ if(/BREACH/i.test(s))return band.Critical; if(/tolerance/i.test(s))return band.Moderate; return band.Low; }

const M = D.META, N = D.narrative, X = D.appendix;

// =====================================================================
// SECTION 1 — NARRATIVE (portrait)
// =====================================================================
const narrative = [];
narrative.push(new Paragraph({ spacing: { after: 20, line: 240, lineRule: "auto" },
  children: [ new TextRun({ text: "RISK & CONTROL SELF-ASSESSMENT (RCSA)", bold: true, color: NAVY, size: 34 }) ] }));
narrative.push(new Paragraph({ spacing: { after: 20, line: 240 },
  children: [ new TextRun({ text: M.subtitle, bold: true, size: 23, color: NAVY2 }) ] }));
narrative.push(new Paragraph({ spacing: { after: 60, line: 240 },
  children: [ new TextRun({ text: M.periodLine, italics: true, size: 21, color: "595959" }) ] }));
narrative.push(new Paragraph({ spacing: { after: 20, line: 240 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY, space: 6 } },
  children: [ new TextRun({ text: M.byline, size: 16, color: "808080" }) ] }));
narrative.push(new Paragraph({ spacing: { before: 90, after: 100, line: 252 },
  children: [ new TextRun({ text: M.intro, italics: true, size: 19, color: "404040" }) ] }));

// Assessment record & governance (cover)
const covW = [1850, 3046, 1850, 3046];
function covRow(l1,v1,l2,v2){ return new TableRow({ children:[
  cell(l1,{width:covW[0],fill:SUBHDR_FILL,bold:true,size:16,color:NAVY}),
  cell(v1,{width:covW[1],size:16}),
  cell(l2,{width:covW[2],fill:SUBHDR_FILL,bold:true,size:16,color:NAVY}),
  cell(v2,{width:covW[3],size:16}),
]});}
narrative.push(new Paragraph({ spacing:{before:20,after:40}, children:[ new TextRun({ text:"Assessment record", bold:true, color:NAVY, size:20 }) ] }));
narrative.push(makeTable(covW, M.coverRows.map(r => covRow(r[0],r[1],r[2],r[3]))));
narrative.push(new Paragraph({ spacing:{before:120,after:40}, children:[ new TextRun({ text:"Governance & sign-off (three lines of defence)", bold:true, color:NAVY, size:20 }) ] }));
const soW = [3092, 3400, 3300];
const soRows = [ new TableRow({ children:[
  cell("Line / role",{width:soW[0],fill:NAVY,color:"FFFFFF",bold:true,size:15}),
  cell("Accountable role (enter name)",{width:soW[1],fill:NAVY,color:"FFFFFF",bold:true,size:15}),
  cell("Responsibility",{width:soW[2],fill:NAVY,color:"FFFFFF",bold:true,size:15}),
]})];
M.signoffRows.forEach((sr,i)=>{ const alt=i%2===1?ALT_FILL:undefined; soRows.push(new TableRow({ children:[
  cell(sr[0],{width:soW[0],bold:true,size:15,fill:alt}),
  cell(sr[1],{width:soW[1],size:15,fill:"FFFDE7"}),
  cell(sr[2],{width:soW[2],size:15,fill:alt}),
]}));});
narrative.push(makeTable(soW, soRows));
narrative.push(new Paragraph({ spacing:{before:80,after:120,line:252}, children:[
  new TextRun({ text:"Risk appetite: ", bold:true, size:18, color:NAVY }),
  new TextRun({ text:M.appetiteStatement, size:18 }),
]}));

narrative.push(sectionHeading("1.  Purpose and Scope"));
narrative.push(para(N.purposeScope, { align: AlignmentType.JUSTIFIED }));
narrative.push(sectionHeading("2.  " + N.overviewHeading));
narrative.push(para(N.incidentOverview, { align: AlignmentType.JUSTIFIED }));
narrative.push(sectionHeading("3.  Assessment Approach"));
narrative.push(para(N.assessmentApproach, { align: AlignmentType.JUSTIFIED }));
narrative.push(sectionHeading("4.  Key Risks and Control Environment"));
narrative.push(para(N.keyRisksIntro, { align: AlignmentType.JUSTIFIED }));
function themePara(lead, rest) { return para([ runs(lead, { italics: true, bold: true }), runs(rest) ], { align: AlignmentType.JUSTIFIED }); }
N.themes.forEach(t => narrative.push(themePara(t[0], t[1])));
narrative.push(sectionHeading("5.  Control Gaps and Root Causes"));
narrative.push(para(N.controlGaps, { align: AlignmentType.JUSTIFIED }));
narrative.push(sectionHeading("6.  Overall Residual Risk Assessment"));
narrative.push(para(N.residualRuns.map(r => runs(r.t, r.band ? { bold:true, color: band[r.band].txt } : {})), { align: AlignmentType.JUSTIFIED }));
narrative.push(sectionHeading("7.  " + N.remediationHeading));
narrative.push(para(N.remediation, { align: AlignmentType.JUSTIFIED }));

// =====================================================================
// SECTION 2 — APPENDICES (landscape)
// =====================================================================
const appendix = [];
const LW = 14400;
function appHeading(text) { return new Paragraph({ spacing: { before: 60, after: 80, line: 252 }, children: [ new TextRun({ text, bold: true, color: NAVY, size: 24 }) ] }); }
function subNote(text) { return new Paragraph({ spacing: { after: 80 }, children: [ new TextRun({ text, italics: true, size: 16, color: "595959" }) ] }); }

// ---- Appendix A: rating scales (generic) ----
appendix.push(new Paragraph({ spacing: { after: 40 }, children: [ new TextRun({ text: "APPENDIX A — Assessment Rating Scales", bold: true, color: NAVY, size: 26 }) ] }));
const aW = [900, 2600, 10900];
appendix.push(appHeading("A.1  Likelihood (L)"));
appendix.push(makeTable(aW, [
  headerRow(["Score", "Rating", "Definition"], aW),
  new TableRow({ children: [ cell("1", {width:aW[0],align:AlignmentType.CENTER,bold:true}), cell("Rare", {width:aW[1]}), cell("Not expected under current conditions; no known precedent.", {width:aW[2]}) ]}),
  new TableRow({ children: [ cell("2", {width:aW[0],align:AlignmentType.CENTER,bold:true,fill:ALT_FILL}), cell("Unlikely", {width:aW[1],fill:ALT_FILL}), cell("Could occur but is not expected within the assessment period.", {width:aW[2],fill:ALT_FILL}) ]}),
  new TableRow({ children: [ cell("3", {width:aW[0],align:AlignmentType.CENTER,bold:true}), cell("Possible", {width:aW[1]}), cell("May occur occasionally.", {width:aW[2]}) ]}),
  new TableRow({ children: [ cell("4", {width:aW[0],align:AlignmentType.CENTER,bold:true,fill:ALT_FILL}), cell("Likely", {width:aW[1],fill:ALT_FILL}), cell("Expected to occur in most circumstances.", {width:aW[2],fill:ALT_FILL}) ]}),
  new TableRow({ children: [ cell("5", {width:aW[0],align:AlignmentType.CENTER,bold:true}), cell("Almost Certain", {width:aW[1]}), cell("Expected to occur frequently, or already observed / recurring.", {width:aW[2]}) ]}),
]));
appendix.push(appHeading("A.2  Impact (I)"));
appendix.push(subNote("Impact considers safety/misalignment, security, third-party & legal, reputational, and operational dimensions; the highest applicable dimension governs."));
appendix.push(makeTable(aW, [
  headerRow(["Score", "Rating", "Definition"], aW),
  new TableRow({ children: [ cell("1", {width:aW[0],align:AlignmentType.CENTER,bold:true}), cell("Insignificant", {width:aW[1]}), cell("Negligible effect; contained within a single workload.", {width:aW[2]}) ]}),
  new TableRow({ children: [ cell("2", {width:aW[0],align:AlignmentType.CENTER,bold:true,fill:ALT_FILL}), cell("Minor", {width:aW[1],fill:ALT_FILL}), cell("Limited effect; readily remediated; no external impact.", {width:aW[2],fill:ALT_FILL}) ]}),
  new TableRow({ children: [ cell("3", {width:aW[0],align:AlignmentType.CENTER,bold:true}), cell("Moderate", {width:aW[1]}), cell("Notable internal impact; limited external or data exposure.", {width:aW[2]}) ]}),
  new TableRow({ children: [ cell("4", {width:aW[0],align:AlignmentType.CENTER,bold:true,fill:ALT_FILL}), cell("Major", {width:aW[1],fill:ALT_FILL}), cell("Serious safety/security failure; third-party harm, data exposure, significant reputational or regulatory attention.", {width:aW[2],fill:ALT_FILL}) ]}),
  new TableRow({ children: [ cell("5", {width:aW[0],align:AlignmentType.CENTER,bold:true}), cell("Severe", {width:aW[1]}), cell("Loss of control of a capable system; material third-party breach; potential self-propagation or model-weight exfiltration; systemic reputational/regulatory harm.", {width:aW[2]}) ]}),
]));
appendix.push(appHeading("A.3  Inherent Risk (L × I) and A.4  Control Effectiveness"));
const abW = [7200, 7200];
const inhTbl = makeTable([1800,1800,3600], [
  headerRow(["Score", "Band", "Response posture"], [1800,1800,3600]),
  new TableRow({ children:[ cell("1–4",{width:1800,align:AlignmentType.CENTER}), bandCell("Low",1800), cell("Accept / monitor",{width:3600}) ]}),
  new TableRow({ children:[ cell("5–9",{width:1800,align:AlignmentType.CENTER}), bandCell("Moderate",1800), cell("Manage via routine controls; periodic review",{width:3600}) ]}),
  new TableRow({ children:[ cell("10–15",{width:1800,align:AlignmentType.CENTER}), bandCell("High",1800), cell("Priority remediation; senior-management oversight",{width:3600}) ]}),
  new TableRow({ children:[ cell("16–25",{width:1800,align:AlignmentType.CENTER}), bandCell("Critical",1800), cell("Immediate action; CRO / board attention; consider pausing activity",{width:3600}) ]}),
]);
const effTbl = makeTable([2600,4600], [
  headerRow(["Rating", "Definition"], [2600,4600]),
  new TableRow({ children:[ effCell("Effective",2600), cell("Well designed / operating consistently to mitigate the risk.",{width:4600}) ]}),
  new TableRow({ children:[ effCell("Partially Effective",2600), cell("Addresses the risk in part; material weaknesses remain.",{width:4600}) ]}),
  new TableRow({ children:[ effCell("Ineffective",2600), cell("Present but does not mitigate the risk as intended.",{width:4600}) ]}),
  new TableRow({ children:[ effCell("Not Implemented",2600), cell("No control in place, or the intended control was not built / not operating.",{width:4600}) ]}),
]);
appendix.push(new Table({
  columnWidths: abW, width: { size: LW, type: WidthType.DXA }, layout: TableLayoutType.FIXED,
  borders: { top:{style:BorderStyle.NIL}, bottom:{style:BorderStyle.NIL}, left:{style:BorderStyle.NIL}, right:{style:BorderStyle.NIL}, insideHorizontal:{style:BorderStyle.NIL}, insideVertical:{style:BorderStyle.NIL} },
  rows: [ new TableRow({ children: [
    new TableCell({ width:{size:abW[0],type:WidthType.DXA}, borders:{top:{style:BorderStyle.NIL},bottom:{style:BorderStyle.NIL},left:{style:BorderStyle.NIL},right:{style:BorderStyle.NIL}}, margins:{right:200}, children:[ new Paragraph({spacing:{after:40},children:[new TextRun({text:"A.3  Inherent risk bands",bold:true,size:17,color:NAVY})]}), inhTbl ] }),
    new TableCell({ width:{size:abW[1],type:WidthType.DXA}, borders:{top:{style:BorderStyle.NIL},bottom:{style:BorderStyle.NIL},left:{style:BorderStyle.NIL},right:{style:BorderStyle.NIL}}, margins:{left:200}, children:[ new Paragraph({spacing:{after:40},children:[new TextRun({text:"A.4  Design & operating effectiveness",bold:true,size:17,color:NAVY})]}), effTbl ] }),
  ]}) ],
}));
appendix.push(appHeading("A.5  Risk Appetite & Tolerance"));
appendix.push(new Paragraph({ spacing:{after:60,line:252}, children:[
  new TextRun({ text:"Overall posture: AVERSE to loss of model control. ", bold:true, size:18 }),
  new TextRun({ text:"The organisation has no appetite for residual risk in the High or Critical band on any Model-Risk/Misalignment or containment-critical risk. Tolerance ceilings (maximum acceptable residual): Model Risk/Misalignment and containment-critical Cyber (sandbox, persistence) — Low (score ≤ 4); other Security, Third-Party, Process, Monitoring and Governance risks — Moderate or lower (score ≤ 9). Any residual above the applicable ceiling is a breach of appetite and requires a tracked action. Residual is assessed on controls as they actually operate.", size:18 }),
]}));
appendix.push(appHeading("A.6  Appetite Status & Action Priority"));
const apW = [4600, 9800];
appendix.push(makeTable(apW, [
  headerRow(["Appetite status","Definition"], apW),
  new TableRow({ children:[ cell("Within appetite",{width:apW[0],bold:true,fill:band.Low.fill,color:band.Low.txt}), cell("Residual score ≤ ceiling.",{width:apW[1]}) ]}),
  new TableRow({ children:[ cell("At tolerance",{width:apW[0],bold:true,fill:band.Moderate.fill,color:band.Moderate.txt}), cell("Residual score = ceiling.",{width:apW[1]}) ]}),
  new TableRow({ children:[ cell("BREACH",{width:apW[0],bold:true,fill:band.Critical.fill,color:band.Critical.txt}), cell("Residual score > ceiling — a tracked action is required, prioritised as below.",{width:apW[1]}) ]}),
]));
appendix.push(new Paragraph({ spacing:{before:60,after:40,line:252}, children:[
  new TextRun({ text:"Action priority for breaches:  ", bold:true, size:18 }),
  new TextRun({ text:"P1 – Immediate (residual score ≥ 20)  ·  P2 – High (12–19)  ·  P3 – Medium (5–11). Within-appetite risks are set to Monitor.", size:18 }),
]}));

// ---- Appendix B: Risk Inventory ----
appendix.push(new Paragraph({ spacing:{before:200, after:40}, children:[ new TextRun({ text:"APPENDIX B — Risk Inventory (Risk Register)", bold:true, color:NAVY, size:26 }) ]}));
appendix.push(subNote(X.riskSubnote));
const bWf = fitWidths([520, 2050, 4900, 380, 380, 1200, 1100, 1620, 1150, 1100], LW);
const bRows = [ headerRow(["ID","Risk (category)","Description / how it manifested","L","I","Inherent","Key controls","Control effectiveness","Residual","Trend"], bWf, {size:16}) ];
X.risks.forEach((r, idx) => { const alt = idx % 2 === 1 ? ALT_FILL : undefined;
  bRows.push(new TableRow({ children: [
    cell(r[0], {width:bWf[0],bold:true,align:AlignmentType.CENTER,fill:alt,size:16}),
    cell(r[1], {width:bWf[1],bold:true,fill:alt,size:16,color:NAVY}),
    cell(r[2], {width:bWf[2],fill:alt,size:16}),
    cell(r[3], {width:bWf[3],align:AlignmentType.CENTER,fill:alt,size:16}),
    cell(r[4], {width:bWf[4],align:AlignmentType.CENTER,fill:alt,size:16}),
    bandCell(r[5], bWf[5]),
    cell(r[6], {width:bWf[6],align:AlignmentType.CENTER,fill:alt,size:16}),
    effCell(r[7], bWf[7]),
    bandCell(r[8], bWf[8]),
    cell(r[9], {width:bWf[9],align:AlignmentType.CENTER,fill:alt,size:16,color:"375623"}),
  ]}));
});
appendix.push(makeTable(bWf, bRows));
appendix.push(new Paragraph({ spacing:{before:140, after:40}, children:[ new TextRun({ text:"Residual risk vs appetite — status, priority and ownership", bold:true, color:NAVY, size:18 }) ]}));
const apmWf = fitWidths([700, 1700, 2100, 2600, 1900, 3600, 1800], LW);
const apmRows = [ headerRow(["ID","Residual","Appetite ceiling","Status","Action priority","Risk owner (role)","Action"], apmWf, {size:16}) ];
X.apm.forEach((m,idx)=>{ const alt=idx%2===1?ALT_FILL:undefined; apmRows.push(new TableRow({ children:[
  cell(m[0],{width:apmWf[0],bold:true,align:AlignmentType.CENTER,fill:alt,size:16,color:NAVY}),
  bandCell(m[1],apmWf[1]),
  cell(m[2],{width:apmWf[2],align:AlignmentType.CENTER,fill:alt,size:16}),
  cell(m[3],{width:apmWf[3],align:AlignmentType.CENTER,bold:true,fill:statusBand(m[3]).fill,color:statusBand(m[3]).txt,size:16}),
  cell(m[4],{width:apmWf[4],align:AlignmentType.CENTER,fill:alt,size:16,bold:true,color:priBand(m[4]).txt}),
  cell(m[5],{width:apmWf[5],fill:alt,size:16}),
  cell(m[6],{width:apmWf[6],align:AlignmentType.CENTER,fill:alt,size:16}),
]}));});
appendix.push(makeTable(apmWf, apmRows));

// ---- Appendix C: Control Inventory ----
appendix.push(new Paragraph({ spacing:{before:200, after:40}, children:[ new TextRun({ text:"APPENDIX C — Control Inventory", bold:true, color:NAVY, size:26 }) ]}));
appendix.push(subNote(X.controlSubnote));
const cWf = fitWidths([560, 2650, 900, 1350, 1450, 1050, 6440], LW);
const cRows = [ headerRow(["ID","Control / objective","Type","Design","Operating","Related risks","Assessment note (why it failed) & remediation direction"], cWf, {size:16}) ];
X.controls.forEach((c, idx) => { const alt = idx % 2 === 1 ? ALT_FILL : undefined;
  cRows.push(new TableRow({ children: [
    cell(c[0], {width:cWf[0],bold:true,align:AlignmentType.CENTER,fill:alt,size:16}),
    cell(c[1], {width:cWf[1],bold:true,fill:alt,size:16,color:NAVY}),
    cell(c[2], {width:cWf[2],align:AlignmentType.CENTER,fill:alt,size:16}),
    effCell(c[3], cWf[3]),
    effCell(c[4], cWf[4]),
    cell(c[5], {width:cWf[5],align:AlignmentType.CENTER,fill:alt,size:16}),
    cell(c[6], {width:cWf[6],fill:alt,size:16}),
  ]}));
});
appendix.push(makeTable(cWf, cRows));

// ---- Appendix D: Control Gap / Findings Log ----
appendix.push(new Paragraph({ spacing:{before:200, after:40}, children:[ new TextRun({ text:"APPENDIX D — Control Gap & Findings Log", bold:true, color:NAVY, size:26 }) ]}));
appendix.push(subNote(X.gapSubnote));
const dWf = fitWidths([560, 3550, 1150, 4520, 4620], LW);
const dRows = [ headerRow(["ID","Control gap / finding","Related risk(s)","Effect (why residual risk is elevated)","Remediation theme (committed)"], dWf, {size:16}) ];
X.gaps.forEach((g, idx) => { const alt = idx % 2 === 1 ? ALT_FILL : undefined;
  dRows.push(new TableRow({ children: [
    cell(g[0], {width:dWf[0],bold:true,align:AlignmentType.CENTER,fill:alt,size:16}),
    cell(g[1], {width:dWf[1],bold:true,fill:alt,size:16,color:NAVY}),
    cell(g[2], {width:dWf[2],align:AlignmentType.CENTER,fill:alt,size:16}),
    cell(g[3], {width:dWf[3],fill:alt,size:16}),
    cell(g[4], {width:dWf[4],fill:alt,size:16}),
  ]}));
});
appendix.push(makeTable(dWf, dRows));

// ---- Appendix E: Action Plan ----
appendix.push(new Paragraph({ spacing:{before:200, after:40}, children:[ new TextRun({ text:"APPENDIX E — Action Plan", bold:true, color:NAVY, size:26 }) ]}));
appendix.push(subNote(X.actionSubnote));
const eWf = fitWidths([640, 1150, 2950, 3350, 2500, 1250, 900, 1200, 1200], LW);
const eRows = [ headerRow(["ID","Addresses","Finding (control gap)","Action","Owner (role)","Priority","Target","Status","Target residual"], eWf, {size:15}) ];
X.acts.forEach((a,idx)=>{ const alt=idx%2===1?ALT_FILL:undefined; const pb=priBand(a[5]); eRows.push(new TableRow({ children:[
  cell(a[0],{width:eWf[0],bold:true,align:AlignmentType.CENTER,fill:alt,size:15,color:NAVY}),
  cell(a[1],{width:eWf[1],align:AlignmentType.CENTER,fill:alt,size:15}),
  cell(a[2],{width:eWf[2],fill:alt,size:15}),
  cell(a[3],{width:eWf[3],fill:alt,size:15}),
  cell(a[4],{width:eWf[4],fill:alt,size:15}),
  cell(a[5],{width:eWf[5],align:AlignmentType.CENTER,bold:true,size:15,fill:pb.fill,color:pb.txt}),
  cell(a[6],{width:eWf[6],align:AlignmentType.CENTER,fill:alt,size:15}),
  cell(a[7],{width:eWf[7],align:AlignmentType.CENTER,fill:alt,size:15}),
  bandCell(a[8],eWf[8]),
]}));});
appendix.push(makeTable(eWf, eRows));

// ---- Appendix F: KRI / KCI ----
appendix.push(new Paragraph({ spacing:{before:200, after:40}, children:[ new TextRun({ text:"APPENDIX F — Key Risk & Control Indicators (KRI / KCI)", bold:true, color:NAVY, size:26 }) ]}));
appendix.push(subNote(X.kriSubnote));
const fWf = fitWidths([700, 3700, 900, 2700, 3200, 3200], LW);
const fRows = [ headerRow(["ID","Indicator","Type","Target / appetite","Owner (role)","Related risks"], fWf, {size:15}) ];
X.kris.forEach((k,idx)=>{ const alt=idx%2===1?ALT_FILL:undefined; fRows.push(new TableRow({ children:[
  cell(k[0],{width:fWf[0],bold:true,align:AlignmentType.CENTER,fill:alt,size:15,color:NAVY}),
  cell(k[1],{width:fWf[1],fill:alt,size:15}),
  cell(k[2],{width:fWf[2],align:AlignmentType.CENTER,fill:alt,size:15}),
  cell(k[3],{width:fWf[3],fill:alt,size:15}),
  cell(k[4],{width:fWf[4],fill:alt,size:15}),
  cell(k[5],{width:fWf[5],align:AlignmentType.CENTER,fill:alt,size:15}),
]}));});
appendix.push(makeTable(fWf, fRows));

// ---- Appendix G: Basis / Sources ----
appendix.push(new Paragraph({ spacing:{before:200, after:40}, children:[ new TextRun({ text:"APPENDIX G — Basis of Assessment & Sources", bold:true, color:NAVY, size:26 }) ]}));
X.sources.forEach(s => appendix.push(new Paragraph({ spacing: { after: 60, line: 252 }, bullet: { level: 0 },
  children: [ new TextRun({ text: s, size: 18 }) ] })));
appendix.push(new Paragraph({ spacing:{before:120}, children:[ new TextRun({ text:X.closingNote, italics:true, size:16, color:"595959" }) ]}));

// =====================================================================
// DOCUMENT
// =====================================================================
const doc = new Document({
  creator: M.creator, title: M.title, description: M.description,
  styles: { default: { document: { run: { font: "Calibri", size: 21, color: "1A1A1A" } } } },
  sections: [
    { properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, bottom: 1080, left: 1224, right: 1224 } } },
      footers: { default: footer(M.footerA) }, children: narrative },
    { properties: { page: { size: { width: 12240, height: 15840, orientation: PageOrientation.LANDSCAPE }, margin: { top: 900, bottom: 900, left: 720, right: 720 } } },
      footers: { default: footer(M.footerB) }, children: appendix },
  ],
});
const outDir = path.join(__dirname, "..", "examples", M.dir);
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "report.docx");
Packer.toBuffer(doc).then(buf => { fs.writeFileSync(outPath, buf); console.log("WROTE", outPath, buf.length, "bytes"); });
