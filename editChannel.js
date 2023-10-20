// import bot from "./app.js";
// import { dataBot } from './values.js';


// // Працює хай живе
// const deleteButton = async () => {
//   try {
//     //console.log(`Delete button clicked in channel ${channelId}`);
//     // функція що знаходить messageID
//     const messageId = 523;//await googleFindMessageId();
//     await bot.deleteMessage(channelId, messageId);

//   } catch (err) {
//     console.error(err);
//     // handle the error 
//   }
// };

// // Працює хай живе
// const changeMessage = async (messageId, message) => {
//   try {
//     // Додати інформацію про колонку, номер рядка передається в анкеті в аргумент
//     //const messageId = 527;
//     const newText = "📌 " + message;
//     await bot.editMessageText(newText, {chat_id: dataBot.channelId, message_id: messageId});

//   } catch (err) {
//     console.error(err);
//     // handle the error 
//   }
// };

// export{
//   deleteButton,
//   changeMessage
// }