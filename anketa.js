import bot from "./app.js";
import { sendToRawContact, sendToRawContactBlunder, sendToRawContacRequest, sendToRawStatusReserve, sendToRawStatusDone } from './writegoog.js'
// import { changeMessage } from "./editChannel.js";
import { googleFindMessageId, sendNewRowsToTelegram } from './crawler.js';
import { getSpreadsheetData, searchForNew } from "./filedata.js";
import { dataBot } from './values.js';
// import { writeToGoogleSheets } from './googleSheets.js';



let customerPhone;
let customerName;
let customerInfo = {};
let message; 


const spreadsheetId = dataBot.googleSheetId;
const phoneRegex = /^\d{10,12}$/;

const phrases = {
  greetings: 'Вітаємо ! Це чат-бот компанії "AutoCar - Авто зі США" 🇺🇸',
  contactRequest: 'Нам потрібні ваші контактні дані. Отримати з контактних даних телеграм?',
  dataConfirmation: `Ваш номер телефону: ${customerPhone}. Ваше імя ${customerName}. Дані вірні?`,
  thanksForOrder: `Ваші дані відправлені. Дякуємо ${customerName} за звернення. Менеджер звʼяжеться з Вами найближчим часом.`,
  wrongName: 'Невірне ім\'я. Будь ласка, введіть своє справжнє ім\'я:',
  wrongPhone: 'Невірний номер телефону. Будь ласка, введіть номер телефону ще раз:',
  phoneRules: 'Введіть ваш номер телефону без +. Лише цифри. І відправте повідомлення',
  nameRequest: 'Введіть своє ім\'я:',
};

const keyboards = {
  startingKeyboard: [['Підібрати авто', 'Прорахувати авто', 'Звʼяжіться зі мною']],
  contactRequest: [
    [ { text: 'Так', request_contact: true, } ],
    ['Ні, я введу номер вручну'],
    ['/start'],
  ],
  dataConfirmation: [
    ['Так, відправити заявку'],
    ['Ні, повторити введення'],
    ['/start'],
  ],
  enterPhone: [ ['/start'] ]
}

export const anketaListiner = async() => {
    let selectedOrderRaw;
    let calculationState = false; // Новое состояние для прорасчета авто
    let desiredCarInfo = {}; // Информация о желаемом авто

    bot.onText(/\/start/ , (msg) => {
      customerPhone = undefined;
      customerName = undefined;
      calculationState = false; // Сбрасываем состояние
      desiredCarInfo = {}; // Сбрасываем информацию о желаемом авто

      let userNickname = ''; // Изначально никнейм пустой
  
      // Проверка наличия никнейма пользователя
      if (msg.from.username) {
          userNickname = msg.from.username;
      } else {
          userNickname = ''; // Если у пользователя нет никнейма
      }
  
      // Теперь вы можете использовать userNickname в тексте приветствия
      const greetingMessage = `Вітаємо, ${userNickname}! Це чат-бот компанії "AutoCar - Авто зі США" 🇺🇸`;
  
      bot.sendMessage(msg.chat.id, greetingMessage, {
          reply_markup: {
              keyboard: keyboards.startingKeyboard,
              resize_keyboard: true,
              one_time_keyboard: true
          }
      });
  });
  
    //'Детальніше про це авто' button handler
    bot.on("callback_query", async (query) => {
      selectedOrderRaw = query.data;
      const chatId = query.message.chat.id;
      const range = `auto!N${selectedOrderRaw}`;
      const statusNew = await searchForNew(spreadsheetId, range)
      if (statusNew) {
        sendToRawStatusReserve(selectedOrderRaw);
        bot.sendMessage(chatId, phrases.contactRequest, { reply_markup: { keyboard: keyboards.contactRequest, resize_keyboard: true } });
      } else bot.sendMessage(chatId, 'є замовлення від іншого користувача');
    })
    bot.on('message', async (msg) => {
      console.log(customerInfo);
      const chatId = msg.chat.id;
      if (msg.text === 'Підібрати авто') await sendNewRowsToTelegram(spreadsheetId, dataBot.googleSheetName, dataBot.lotStatusColumn, chatId, bot);
      else if (msg.contact) {
        customerInfo[chatId] = { name : msg.contact.first_name, phone : msg.contact.phone_number};
        customerPhone = msg.contact.phone_number;
        customerName = msg.contact.first_name;
        message = customerName + ' ' + customerPhone;
        bot.sendMessage(chatId, `Ваш номер телефону: ${msg.contact.phone_number}. Ваше імя ${msg.contact.first_name}. Дані вірні?`, 
          {
            reply_markup: {
              keyboard: keyboards.dataConfirmation,
              resize_keyboard: true,
              one_time_keyboard: true
            },
          });
      } else if(msg.text === 'Так, відправити заявку') {
          // переписати функції запису даних згідно рядка а не колонки
          await bot.sendMessage(dataBot.channelId, message);
          await sendToRawContact(customerInfo[chatId].phone, customerInfo[chatId].name, selectedOrderRaw);
          await sendToRawStatusDone(selectedOrderRaw);
          const range = `auto!A${selectedOrderRaw}:E${selectedOrderRaw}`;
          const data = await getSpreadsheetData(spreadsheetId, range);
          if (data.values && data.values.length > 0) {
          // const message = data.values[0].join('\n');
          // const idToDelete = await googleFindMessageId(selectedOrderRaw)
          // await changeMessage(idToDelete, message);
          }
          bot.sendMessage(chatId, `Ваші дані відправлені. Дякуємо ${customerInfo[chatId].name} за звернення. Наш менеджер звʼяжеться з Вами найближчим часом.`);
      } else if (msg.text === 'Почати спочатку') {
        bot.sendMessage(chatId, '/start');
      } else if(msg.text === `Ні, я введу номер вручну` || msg.text === 'Ні, повторити введення') {
        customerPhone = undefined;
        customerName = undefined;  
        bot.sendMessage(chatId, phrases.phoneRules, {
          reply_markup: { keyboard: keyboards.enterPhone, resize_keyboard: true },
        });
      } else if (phoneRegex.test(msg.text)) {
        customerInfo[chatId] = { phone : msg.text };
        customerPhone = msg.text;
        bot.sendMessage(chatId, phrases.nameRequest);
      } else if (customerPhone && customerName == undefined ) {
        if (msg.text.length >= 2) {
        customerName = msg.text;
        customerInfo[chatId].name = msg.text;
        bot.sendMessage(chatId, `Ваш номер телефону: ${customerInfo[chatId].phone}. Ваше імя ${customerInfo[chatId].name}. Дані вірні?` , {
          reply_markup: { keyboard: keyboards.dataConfirmation, resize_keyboard: true, one_time_keyboard: true },
        });
        };
      } else if (msg.text === 'Прорахувати авто') {
        const chatId = msg.chat.id;
        let clientWishes = '';
        let awaitingContact = false; // Флаг для отслеживания ожидания контакта
      
        bot.sendMessage(chatId, 'Введіть ваші побажання по авто:');
        //звʼяжіться зі мною 
      } else if (msg.text === 'Звʼяжіться зі мною') {
       
      }

  
  });
};
  