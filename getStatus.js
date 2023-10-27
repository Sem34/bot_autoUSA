import { getSpreadsheetData } from './crawler.js';
import { dataBot } from './values.js';


//STATUS RANGE
//====================
const spreadsheetId = dataBot.googleSheetId;
const sheetName = "auto";
const columnName = "N";
//======================

//Gives array from column specifide at the top of this file: work good!
const getArrayFromColumn = async (spreadsheetId, sheetName, columnName) => {
    const range = `${sheetName}!${columnName}:${columnName}`;
    const data = await getSpreadsheetData(spreadsheetId, range);
    if (data.values && data.values.length > 0) {
      return data.values.map((row, index) => ({ value: row[0], rowNumber: index + 1 }));
    }
    return [];
};

// find Status raw
const findStatusRawCell = async (searchValue) => {
    const arrayFromColumn = await getArrayFromColumn(spreadsheetId, sheetName, columnName);
    const cell = arrayFromColumn.find(cell => cell.value === searchValue);
    if (cell) {
      //console.log(`Found "${searchValue}" in cell ${columnName}${cell.rowNumber}`);
      return cell.rowNumber;
    } else {
      //console.log(`Could not find "${searchValue}" in column ${columnName}`);
      return null;
    }
};

const findStatusRaw = async (searchValue) => {
    const arrayFromColumn = await getArrayFromColumn(spreadsheetId, sheetName, columnName);
    const rowNumber = arrayFromColumn.findIndex(cell => cell.value === searchValue);
    if (rowNumber >= 0) {
      return rowNumber + 1;
    } else return null;
  };

  
  export {
    findStatusRaw,
    findStatusRawCell
  }