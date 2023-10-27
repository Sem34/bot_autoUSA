import bot from "./app.js";
import { sendNewRowsToTgByPrice710, sendNewRowsTgByPrice1015, sendNewRowsTgByPrice1520, sendNewRowsTgByPrice20 } from './crawler.js';
import { searchForNew } from "./filedata.js";
import { dataBot } from './values.js';

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
  nameRequestPhone: 'Введіть своє ім\'я та номер телефону одним повідомленням',
  phoneRequest: 'Введіть, будь ласка, Ваш номер телефону без "+380"' 
};

const keyboards = {
  startingKeyboard: [['🚙 Підібрати авто', '🚗 Прорахувати авто', '📞 Звʼяжіться зі мною']],
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
  enterPhone: [ ['/start'] ],
  surveyQuestion1: [['💰7000$ - 10000$', '💰10000$ - 15000$'], 
  ['💰15000$ - 20000$', '💰+20000']
],
  surveyQuestion2: [['📅2005-2010', '📅2010-2015'],
  ['📅2015-2020', '📅2020-2023']],
  phoneRequest: [['Ввести номер']],
  budget: [['💵7000$ - 10000$', '💵10000$ - 15000$'], 
  ['💵15000$ - 20000$', '💵+20000$']]
}

export const anketaListiner = async() => {
    let selectedOrderRaw;
    let selectedBudget;
    let selectedYear;    
    
    bot.onText(/\/start/ , (msg) => {
      customerPhone = undefined;
      customerName = undefined;
      let userNickname = ''; // Изначально никнейм пустой
      // Проверка наличия никнейма пользователя
      if (msg.from.username) {
          userNickname = msg.from.username;
      } else {
          userNickname = ''; // Если у пользователя нет никнейма
      }
      // Теперь вы можете использовать userNickname в тексте приветствия
      const greetingMessage = `Вітаємо! Це чат-бот компанії "AutoCar - Авто зі США" 🇺🇸`; //Вітаємо, ${userNickname}
  
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
        bot.sendMessage(chatId, phrases.contactRequest, { reply_markup: { keyboard: keyboards.contactRequest, resize_keyboard: true } });
      } else bot.sendMessage(chatId, 'є замовлення від іншого користувача');
    })
    bot.on('message', async (msg) => {
      console.log(customerInfo);
      const chatId = msg.chat.id;
      if (msg.text === '🚙 Підібрати авто') {
        const chatId = msg.chat.id;
        // Создаем массив кнопок опций для surveyQuestion1
        const optionsQuestion1 = keyboards.surveyQuestion1;
        // Отправляем сообщение с кнопками опций
        bot.sendMessage(chatId, 'В який, приблизно, бюджет Вам підібрати автомобіль?', {
          reply_markup: { keyboard: optionsQuestion1, one_time_keyboard: true },
        });
      } else if (msg.text === '💰7000$ - 10000$') {
        // Пользователь выбрал один из вариантов по цене
        const chatId = msg.chat.id;
        // Передаем информацию о выборе пользователя в функцию для фильтрации
        await sendNewRowsToTgByPrice710(spreadsheetId, dataBot.googleSheetName, dataBot.lotStatusColumn, chatId, bot, msg.text);
      } else if (msg.text === '💰10000$ - 15000$') {
        // Пользователь выбрал один из вариантов по цене
        const chatId = msg.chat.id;
        // Передаем информацию о выборе пользователя в функцию для фильтрации
        await sendNewRowsTgByPrice1015(spreadsheetId, dataBot.googleSheetName, dataBot.lotStatusColumn, chatId, bot, msg.text);
      } else if (msg.text === '💰15000$ - 20000$') {
        const chatId = msg.chat.id;
        // Передаем информацию о выборе пользователя в функцию для фильтрации
        await sendNewRowsTgByPrice1520(spreadsheetId, dataBot.googleSheetName, dataBot.lotStatusColumn, chatId, bot, msg.text);
      } else if (msg.text === '💰+20000') {
        const chatId = msg.chat.id;
        // Передаем информацию о выборе пользователя в функцию для фильтрации
        await sendNewRowsTgByPrice20(spreadsheetId, dataBot.googleSheetName, dataBot.lotStatusColumn, chatId, bot, msg.text);
      } else if (msg.contact) {
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
          await bot.sendMessage(dataBot.channelId, message);
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
      } else if (msg.text === '🚗 Прорахувати авто') {
        const chatId = msg.chat.id;
        // Создаем массив кнопок опций для surveyQuestion1
        const budget = keyboards.budget;
        // Отправляем сообщение с кнопками опций
        bot.sendMessage(chatId, 'В який, приблизно, бюджет Вам підібрати автомобіль?', {
          reply_markup: { keyboard: budget, one_time_keyboard: true },
        });
      } else if (msg.text === '💵7000$ - 10000$' || msg.text === '💵10000$ - 15000$' || msg.text === '💵15000$ - 20000$' || msg.text === '💵+20000$') {
        selectedBudget = msg.text; // Сохраните выбранный бюджет
        const chatId = msg.chat.id;
        const optionsQuestion2 = keyboards.surveyQuestion2;
        bot.sendMessage(chatId, 'Яких років авто Ви розглядаєте?', {
            reply_markup: { keyboard: optionsQuestion2, one_time_keyboard: true },
        });
      } 
      // В блоке обработки сообщений, где пользователь выбирает год
      else if (msg.text === '📅2005-2010' || msg.text === '📅2010-2015' || msg.text === '📅2015-2020' || msg.text === '📅2020-2023') {
        selectedYear = msg.text; // Сохраните выбранный год
        const chatId = msg.chat.id;
        // Создайте клавиатуру "Request Contact"
        const requestContactKeyboard = {
          keyboard: [[{ text: 'Відправити контакт', request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        };
        const messageToChannel = `Клієнт вибрав бюджет: ${selectedBudget}, рік: ${selectedYear}`;
        bot.sendMessage(dataBot.channelId, messageToChannel);
        // Отправьте сообщение с просьбой отправить контакт
        bot.sendMessage(chatId, 'Будь ласка, відправте свій контакт для звʼязку з вами.', {
          reply_markup: requestContactKeyboard,
        });
      }
      if (msg.text === '📞 Звʼяжіться зі мною') {
      const chatId = msg.chat.id;
      // Создайте клавиатуру "Request Contact"
      const requestContactKeyboard = {
        keyboard: [[{ text: 'Відправити контакт', request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      };
      // Отправьте сообщение с просьбой отправить контакт
      bot.sendMessage(chatId, 'Будь ласка, відправте свій контакт для звʼязку з вами.', {
        reply_markup: requestContactKeyboard,
      });
    }
  });
};
  