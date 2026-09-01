/* Build an interactive matrix page (matrix.html) from a dataset module.
 *   node build_matrix.js <slug>
 * Injects META + RISKS + CONTROLS from ./data/<slug>_matrix.js into the shared
 * viewer_template.html and writes ../examples/<dir>/matrix.html. The viewer logic
 * (CSS + script) is identical for every example — only the data and titles differ. */
const fs = require("fs");
const path = require("path");

const slug = process.argv[2];
if (!slug) { console.error("usage: node build_matrix.js <slug>"); process.exit(1); }
const D = require(path.join(__dirname, "data", `${slug}_matrix.js`));
const M = D.META;

let tpl = fs.readFileSync(path.join(__dirname, "viewer_template.html"), "utf-8");
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

tpl = tpl
  .replace("{{TITLE}}", esc(M.title))
  .replace("{{DESC}}", esc(M.desc))
  .replace("{{HEADING}}", esc(M.heading))
  .replace("{{FOOTER}}", esc(M.footer))
  .replace("__RISKS__", JSON.stringify(D.RISKS))
  .replace("__CONTROLS__", JSON.stringify(D.CONTROLS))
  .replace("__MBASIS__", JSON.stringify(M.basis))
  .replace("__MBASIS_SHORT__", JSON.stringify(M.basis_short));

for (const tok of ["{{TITLE}}","{{DESC}}","{{HEADING}}","{{FOOTER}}","__RISKS__","__CONTROLS__","__MBASIS__","__MBASIS_SHORT__"]) {
  if (tpl.includes(tok)) { console.error("ERROR: placeholder not replaced:", tok); process.exit(1); }
}

const outDir = path.join(__dirname, "..", "examples", M.dir);
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "matrix.html");
fs.writeFileSync(outPath, tpl);
console.log("WROTE", outPath, tpl.length, "bytes");
