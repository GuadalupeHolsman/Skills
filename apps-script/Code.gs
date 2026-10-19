/**
 * Loomlock kiosk -> Google Sheet
 * Pegar en Extensiones > Apps Script de la planilla, correr setup() una vez y publicar como Web app.
 * Cada elección de "¿Quién te invitó?" llega como una fila nueva (doPost); el panel del kiosco lee los totales (doGet).
 */
const HOJA = "Respuestas";
const IDS = ["pr", "loomlock", "donjulio", "bikini", "locky"];

/** Solo crea lo que falta: es seguro volver a ejecutarla (no pisa formato ni datos). */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let h = ss.getSheetByName(HOJA) || ss.insertSheet(HOJA);
  if (h.getLastRow() === 0) h.appendRow(["fecha_hora", "invitacion", "id", "clave"]);
  h.setFrozenRows(1);
  if (!ss.getSheetByName("Resumen")) {
    const r = ss.insertSheet("Resumen");
    r.getRange("A1:B1").setValues([["Invitó", "Personas"]]).setFontWeight("bold");
    const filas = [["PR", "pr"], ["Equipo Loomlock", "loomlock"], ["Equipo Don Julio", "donjulio"], ["Equipo Bikini", "bikini"], ["Quería conocer a Locky", "locky"]];
    filas.forEach((f, i) => r.getRange(i + 2, 1, 1, 2).setValues([[f[0], '=COUNTIF(' + HOJA + '!C:C,"' + f[1] + '")']]));
    r.getRange("A7:B7").setValues([["Total", "=SUM(B2:B6)"]]).setFontWeight("bold");
  }
}

/** Menú "Loomlock" en la planilla: reiniciar datos antes del evento. */
function onOpen() {
  SpreadsheetApp.getUi().createMenu("Loomlock").addItem("Reiniciar datos…", "reiniciar").addToUi();
}

function reiniciar() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.getSheetByName(HOJA);
  const n = Math.max(h.getLastRow() - 1, 0);
  if (n === 0) { ui.alert("No hay datos para borrar."); return; }
  const r = ui.alert("Reiniciar datos", "Hay " + n + " respuestas. ¿Guardar una copia antes de borrar?\n\nSí = copia y borrar · No = borrar sin copia · Cancelar = no hacer nada", ui.ButtonSet.YES_NO_CANCEL);
  if (r === ui.Button.CANCEL || r === ui.Button.CLOSE) return;
  if (r === ui.Button.YES) {
    const f = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), "yyyy-MM-dd HH.mm");
    h.copyTo(ss).setName("Copia " + f);
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try { h.getRange(2, 1, h.getLastRow() - 1, h.getLastColumn()).clearContent(); } finally { lock.releaseLock(); }
  ss.toast("Datos reiniciados", "Loomlock", 5);
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
