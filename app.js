import TelegramBot from 'node-telegram-bot-api';
import { sendToBaseMessageId } from './writegoog.js'
import { getSpreadsheetData } from "./filedata.js";
import { anketaListiner } from './anketa.js';
import { dataBot } from './values.js';

const bot = new TelegramBot(dataBot.telegramBotToken, { polling: true });
export default bot;

anketaListiner();
//channel lots autoposting
bot.on('message', async (message) => {
  if (message.text < 9999999) {
    try {
      const rowNumber = parseInt(message.text);
      const data = await getSpreadsheetData(dataBot.googleSheetId, `${dataBot.googleSheetName}!A${rowNumber}:I${rowNumber}`);
      if (data.values && data.values.length > 0) {
        const message = data.values[0].join('\n')
        .replace(/^/, '\u{1F4CA} ') // add diagramm in 1 line 
        .replace(/^.*\n.*\n.*\n/, '$&\u{1F69C} '); // add tractor in 4 line
        const keyboard = { inline_keyboard: [[{ 
          text: 'Скористайтеся ботом, щоб зробити замовлення',
          url: dataBot.botUrl,
        }]] };
        const sentMessage = await bot.sendMessage(dataBot.channelId, message, { reply_markup: keyboard });
        await sendToBaseMessageId(sentMessage.message_id, rowNumber);
      }
    } catch (error) {
      console.error(error);
    }
  }
});