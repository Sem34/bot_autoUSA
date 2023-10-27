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


export {
  sendToRawContact
}

