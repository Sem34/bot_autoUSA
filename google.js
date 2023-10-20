import { google } from "googleapis";

export const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

export const getClient = async () => {
  return await auth.getClient();
};

export const getSheetsInstance = (client) => {
  return google.sheets({ version: "v4", auth: client });
};
