
/*
Star Code Studio — Backend Apps Script
Admin: leonemmanuel6247@gmail.com
1. Registry central des projets
2. Stockage isolé (un Sheet par projet)
3. Proxy API sécurisé
*/

const REGISTRY_SHEET_ID = "VOTRE_ID_REGISTRY_CENTRAL"; // Feuille listant: Email, NomProjet, SheetID, Date, IP
const TEMPLATE_SHEET_ID = "VOTRE_ID_SHEET_MODELE";
const FOLDER_ID = "VOTRE_ID_DOSSIER_DATABASE";

function doGet(e) {
  const action = e.parameter.action;
  const email = e.parameter.email;
  const projectName = e.parameter.project;
  const ip = e.parameter.ip;

  // 1. Vérification d'existence ou d'inscription IP
  if (action === 'check') {
    const registry = SpreadsheetApp.openById(REGISTRY_SHEET_ID).getSheets()[0];
    const data = registry.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][4] === ip) { // Recherche par IP
        return jsonResponse({ found: true, email: data[i][0], firstName: data[i][5], lastName: data[i][6], country: data[i][7] });
      }
    }
    return jsonResponse({ found: false });
  }

  // 2. Récupération des items du classeur spécifique
  if (action === 'fetch') {
    const registry = SpreadsheetApp.openById(REGISTRY_SHEET_ID).getSheets()[0];
    const data = registry.getDataRange().getValues();
    let sheetId = "";
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === email && data[i][1] === projectName) {
        sheetId = data[i][2];
        break;
      }
    }

    if (sheetId) {
      try {
        const targetSheet = SpreadsheetApp.openById(sheetId).getSheets()[0];
        const itemsData = targetSheet.getDataRange().getValues().slice(1);
        const items = itemsData.map(r => ({ title: r[0], link: r[1], meta: r[2] })).filter(r => r.title);
        return jsonResponse({ items, sheetId });
      } catch (err) { return jsonResponse({ error: "Access Denied" }); }
    }
  }

  return jsonResponse({ error: "Invalid Action" });
}

function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  const registry = SpreadsheetApp.openById(REGISTRY_SHEET_ID).getSheets()[0];
  
  // A. INSCRIPTION & CRÉATION DE MICRO-DB
  if (payload.action === 'register') {
    const data = registry.getDataRange().getValues();
    let existingSheetId = "";
    
    // Vérifier si ce projet (Email + Nom) existe déjà
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === payload.email && data[i][1] === payload.projectName) {
        existingSheetId = data[i][2];
        break;
      }
    }

    if (!existingSheetId) {
      // CRÉATION UNIQUE SÉCURISÉE SUR LE COMPTE ADMIN
      const folder = DriveApp.getFolderById(FOLDER_ID);
      const template = DriveApp.getFileById(TEMPLATE_SHEET_ID);
      const uniqueID = Utilities.getUuid().substring(0, 8);
      const fileName = `[${payload.firstName}]_[${payload.projectName}]_${uniqueID}`;
      
      const newFile = template.makeCopy(fileName, folder);
      existingSheetId = newFile.getId();
      
      // Permission de lecture universelle (nécessaire pour le fetch du site cloné)
      newFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      // Enregistrement dans la table maître
      registry.appendRow([
        payload.email, 
        payload.projectName, 
        existingSheetId, 
        new Date(), 
        payload.ip, 
        payload.firstName, 
        payload.lastName,
        payload.config.country || "Togo"
      ]);
    }
    return jsonResponse({ success: true, sheetId: existingSheetId });
  }

  // B. AJOUT D'UN ITEM DANS LE CLASSEUR ISOLÉ
  if (payload.action === 'update') {
    const registryData = registry.getDataRange().getValues();
    let targetId = "";
    for (let i = 1; i < registryData.length; i++) {
      if (registryData[i][0] === payload.email && registryData[i][1] === payload.project) {
        targetId = registryData[i][2];
        break;
      }
    }
    if (targetId) {
      const sheet = SpreadsheetApp.openById(targetId).getSheets()[0];
      sheet.appendRow([payload.item.title, payload.item.link, payload.item.meta, new Date()]);
      return jsonResponse({ success: true });
    }
  }

  // C. SUPPRESSION D'UN ITEM
  if (payload.action === 'delete') {
    const registryData = registry.getDataRange().getValues();
    let targetId = "";
    for (let i = 1; i < registryData.length; i++) {
      if (registryData[i][0] === payload.email && registryData[i][1] === payload.project) {
        targetId = registryData[i][2];
        break;
      }
    }
    if (targetId) {
      const sheet = SpreadsheetApp.openById(targetId).getSheets()[0];
      sheet.deleteRow(payload.index + 2); // +2 car index 0 = ligne 2 (après header)
      return jsonResponse({ success: true });
    }
  }

  return jsonResponse({ error: "Action failure" });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
