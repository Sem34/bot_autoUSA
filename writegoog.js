import { getClient, getSheetsInstance } from "./google.js";
import { findStatusRaw } from "./getStatus.js";
import { dataBot } from './values.js';

const spreadsheetId = dataBot.googleSheetId;
const sheetName = dataBot.googleSheetName;

const logErrorToConsole = (data) => {
  console.log(`Status "${data}" not found in spreadsheet`);
}

export const writeSpreadsheetData = async (spreadsheetId, range, data) => {
  const client = await getClient();
  const sheets = getSheetsInstance(client);
  const request = {
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    resource: { values: data },
  };
  const response = await sheets.spreadsheets.values.update(request);
  return response.data;
};

const sendToRawContact = async (phone, name, rawNumber) => {
  if (rawNumber) {
    const range = `${sheetName}!O${rawNumber}`;
    const data = [[`${phone} ${name}`]];
    await writeSpreadsheetData(spreadsheetId, range, data);
  } else logErrorToConsole(name);
};
// Відправка контакту по Прорахунку АВТО 
const sendToRawContactBlunder = async (phone, name, rawNumber) => {
  if (rawNumber) {
    const range = `${sheetName}!P${rawNumber}`;
    const data = [[`${phone} ${name}`]];
    await writeSpreadsheetData(spreadsheetId, range, data);
  } else logErrorToConsole(name);
};
//просто отправка заявки по кнопке "Звʼяжіться зі мною"
const sendToRawContacRequest = async (phone, name, rawNumber) => {
  if (rawNumber) {
    const range = `${sheetName}!Q${rawNumber}`;
    const data = [[`${phone} ${name}`]];
    await writeSpreadsheetData(spreadsheetId, range, data);
  } else logErrorToConsole(name);
};
//ВИКОРИСТОВУЄТЬСЯ!!!! ВИРІШИТИ ЧИ ПОТРІБНА
const sendToRawStatusReserve = async (rowNumber) => {
  const writeStatus = await writeSpreadsheetData(spreadsheetId, `${sheetName}!N${rowNumber}`, [['reserve']]);
  writeStatus.updatedCells?true:logErrorToConsole(rowNumber);
};

const sendToRawStatusDone = async (rowNumber) => {
  if (rowNumber) {
    const range = `${sheetName}!N${rowNumber}`;
    const data = [['done']];
    await writeSpreadsheetData(spreadsheetId, range, data);
  } else logErrorToConsole(rowNumber);
};

const sendToBase = async (phone, name, status) => {
  const rowNumber = await findStatusRaw('reserve');
  if (rowNumber) {
    const range = `${sheetName}!O${rowNumber}`;
    const data = [[`${phone} ${name}`]];
    await writeSpreadsheetData(spreadsheetId, range, data);
    //console.log(`Using range ${range} for cell with reserve status`);
    //console.log(`Data sended ${phone} , ${name}`);
  } else logErrorToConsole(status);
};

const sendToBaseStatusDone = async (phone, name, status) => {
  const rowNumber = await findStatusRaw('reserve');
  if (rowNumber) {
    const range = `${sheetName}!N${rowNumber}`;
    const data = [['done']];
    await writeSpreadsheetData(spreadsheetId, range, data);
  } else logErrorToConsole(status);
};


const sendToBaseStatusReserve = async (status) => {
  const rowNumber = await findStatusRaw('new');
  if (rowNumber) {
    const range = `${sheetName}!N${rowNumber}`;
    const data = [['reserve']];
    await writeSpreadsheetData(spreadsheetId, range, data);
  } else logErrorToConsole(status);
};


//ВИКОРИСТОВУЄТЬСЯ!!!!
const sendToBaseMessageId = async (id, rowNumber) => {
  if (rowNumber) {
    await writeSpreadsheetData(spreadsheetId, `${sheetName}!L${rowNumber}`, [[id]]);
  } else logErrorToConsole(id);
};

export {
  sendToBase,
  sendToBaseStatusDone,
  sendToBaseStatusReserve,
  sendToBaseMessageId,
  sendToRawContact,
  sendToRawContactBlunder,
  sendToRawContacRequest,
  sendToRawStatusReserve,
  sendToRawStatusDone
}

