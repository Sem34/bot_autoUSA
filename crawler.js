import { getSpreadsheetData } from "./filedata.js";
import { dataBot } from './values.js';

const getArrayFromColumn = async (spreadsheetId, sheetName, columnName) => {
    const data = await getSpreadsheetData(spreadsheetId, `${sheetName}!${columnName}:${columnName}`);
    return data.values.map(row => row[0]);
};

const crawler = async (spreadsheetId, sheetName, triggerColumn) => {
  // Get array of trigger values in column
  const triggerArray = await getArrayFromColumn(spreadsheetId, sheetName, triggerColumn);
        
  // Find row numbers where trigger value is резерв
  const rowNumbers = triggerArray
    .map((value, index) => value === "reserve" ? index + 1 : null)
    .filter(value => value !== null);    
    if (rowNumbers.length > 0) {
      return false;
    } else {
      return true;
    }
};
  
const crawlerRaw = async (spreadsheetId, sheetName, triggerColumn) => {
  // Get array of trigger values in column
  const triggerArray = await getArrayFromColumn(spreadsheetId, sheetName, triggerColumn);
  
  // Find row numbers where trigger value is резерв
  const rowNumbers = triggerArray
    .map((value, index) => value === "reserve" ? index + 1 : null)
    .filter(value => value !== null);
    
  // Get row data for each row number
  const rowPromises = rowNumbers.map(rowNumber => {
    const range = `${sheetName}!A${rowNumber}:E${rowNumber}`;
    return getSpreadsheetData(spreadsheetId, range);
  });
  
  const rowDataArray = await Promise.all(rowPromises);
  
  // Print row data to console
  rowDataArray.forEach(rowData => {
    if (rowData.values && rowData.values.length > 0) {
      //console.log(rowData.values[0].join("\t"));
    }
  });
};

const crawlerStatusNew = async (spreadsheetId, sheetName, triggerColumn) => {
  // Get array of trigger values in column
  const triggerArray = await getArrayFromColumn(spreadsheetId, sheetName, triggerColumn);
        
  // Find row numbers where trigger value is резерв
  const rowNumbers = triggerArray
    .map((value, index) => value === "new" ? index + 1 : null)
    .filter(value => value !== null);    
    if (rowNumbers.length > 0) {
      return false;
    } else {
      return true;
    }
};

//  search value in specified cell
const getCellValue = async (spreadsheetId, sheetName, columnName, rowNumber) => {
  const range = `${sheetName}!${columnName}${rowNumber}`;
  const data = await getSpreadsheetData(spreadsheetId, range);
  if (data.values && data.values.length > 0) {
    return data.values[0][0];
  }
  return "";
};

const googleFindMessageId = async (rowNumber) => {
  const spreadsheetId = dataBot.googleSheetId;
  const sheetName = "auto";
  const columnName = "L";
  const cellValue = await getCellValue(spreadsheetId, sheetName, columnName, rowNumber);
  return cellValue;
};

//ВИКОРИСТОВУЄТЬСЯ!!!
const sendNewRowsToTelegram = async (spreadsheetId, sheetName, columnName, chatId, bot) => {
  const getStatusData = await  getArrayFromColumn(spreadsheetId, sheetName, columnName);
  const newRows = getStatusData
    .map((value, index) => value === "new" ? index + 1 : null)
    .filter(value => value !== null);
  const rowPromises = newRows.map(rowNumber => getSpreadsheetData(spreadsheetId, `${sheetName}!A${rowNumber}:F${rowNumber}`));
  const rowDataArray = await Promise.all(rowPromises);
  // Build row text for each row data
  rowDataArray.forEach((rowData, index) => {
      const rowNumber = newRows[index];
      const rowText = `Авто  ${rowNumber} \n ${rowData.values[0][0]} \n ${rowData.values[0][1]} \n ${rowData.values[0][2]} \n ${rowData.values[0][3]} \n ${rowData.values[0][4]} \n ${rowData.values[0][5]}`;; // Adds a smiley emoji
      bot.sendMessage(chatId, rowText, { reply_markup: { inline_keyboard: [[{ text: "Детальніше про це авто", callback_data: `${rowNumber}` }]] } });
  });
};

export {
  crawler,
  crawlerRaw,
  getArrayFromColumn,
  getSpreadsheetData,
  crawlerStatusNew,
  googleFindMessageId,
  sendNewRowsToTelegram
};