/**
 * Loomlock kiosk -> Google Sheet
 * Pegar en Extensiones > Apps Script de la planilla, correr setup() una vez y publicar como Web app.
 * Cada elección de "¿Quién te invitó?" llega como una fila nueva (doPost); el panel del kiosco lee los totales (doGet).
 */
const HOJA = "Respuestas";
const IDS = ["pr", "loomlock", "donjulio", "bikini", "locky"];

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let h = ss.getSheetByName(HOJA) || ss.insertSheet(HOJA);
  if (h.getLastRow() === 0) h.appendRow(["fecha_hora", "invitacion", "id", "clave"]);
  h.setFrozenRows(1);
  let r = ss.getSheetByName("Resumen") || ss.insertSheet("Resumen");
  r.clear();
  r.getRange("A1:B1").setValues([["Invitó", "Personas"]]).setFontWeight("bold");
  const filas = [["PR", "pr"], ["Equipo Loomlock", "loomlock"], ["Equipo Don Julio", "donjulio"], ["Equipo Bikini", "bikini"], ["Quería conocer a Locky", "locky"]];
  filas.forEach((f, i) => r.getRange(i + 2, 1, 1, 2).setValues([[f[0], '=COUNTIF(' + HOJA + '!C:C,"' + f[1] + '")']]));
  r.getRange("A7:B7").setValues([["Total", "=SUM(B2:B6)"]]).setFontWeight("bold");
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const h = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
    const claves = h.getLastRow() > 1 ? h.getRange(2, 4, h.getLastRow() - 1, 1).getValues().flat() : [];
    if (claves.indexOf(d.k) === -1) h.appendRow([new Date(d.ts), d.label, d.id, d.k]);   // la clave evita filas duplicadas si el kiosco reintenta
    return ContentService.createTextOutput("ok");
  } finally { lock.releaseLock(); }
}

function doGet() {
  const h = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
  const datos = h.getLastRow() > 1 ? h.getRange(2, 1, h.getLastRow() - 1, 3).getValues() : [];
  const counts = {}, rows = [];
  datos.forEach(f => { counts[f[2]] = (counts[f[2]] || 0) + 1; rows.push({ ts: new Date(f[0]).toISOString(), id: f[2] }); });
  return ContentService.createTextOutput(JSON.stringify({ counts: counts, rows: rows })).setMimeType(ContentService.MimeType.JSON);
}
