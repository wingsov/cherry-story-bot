
// Ссылка на основную страницу в Instagram
const instagramLink = process.env.INSTAGRAM_PAGE;

// Ссылка чат с пользователями
const followersChannel = process.env.FOLLOWERS_CHANNEL;

// Ссылка на фото
const photo = process.env.START_PHOTO;

//Username для отправки в чат пользователей
//let globalUsername = '';



const hello = "Привет, милая!\n" +
    "\n" +
    "Меня зовут Юля, и я основатель Бренда украшений ручной работы Cherry Story. Я создаю самые красивые и восхитительные украшения, в которых ты будешь неотразима!\nПриглашаю подписаться на мою страницу в Instagram, чтобы быть в курсе новинок ✨\n"



// Обработка команды /start
async function handleStartCommand(bot, msg, count, ) {
    const chatId = msg.chat.id;
    const username = msg.from.username;
    const messageId = msg.message_id;
    try {
        await bot.sendPhoto(chatId, photo, {
            caption: hello,
            disable_notification: true,
            protect_content: true,
            reply_markup: {
                resize_keyboard: true,
                keyboard: [
                    [{text: "⭐️Instagram Cherry Story⭐️", web_app: {url: instagramLink}}]
                ]
            }
        });
        // Удаление сообщения с командой /start
        await bot.deleteMessage(chatId, messageId);
        await bot.sendMessage(followersChannel, `@${username} начал пользоваться ботом`, {disable_notification: true});
        count++;
        // Отправка дополнительной информации
        setTimeout(async () => {
            await bot.sendMessage(chatId, ` Раздел "Меню" ↙️ содержит список всех доступных для использования команд.`, {disable_notification: true})
        }, 3000);
    } catch (e) {
        await bot.sendMessage(followersChannel, `У @${username} в обработке команды /start ошибка:${e.message}`);
        console.log(`в обработке команды /start ошибка:${e.message}`);
    }
}

// Обработка команды /categories
async function handleCategoriesCommand(bot, msg) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const username = msg.from.username;
    try {
        // Отправляем сообщение с категориями украшений
        await bot.sendMessage(chatId, `Вот категории украшений, изготовленных с заботой и любовью для тебя.💕💫`, {
            disable_notification: true,
            reply_markup: {
                inline_keyboard: [
                    [{text: "Кольца", callback_data: 'get_rings'}, {text: "Серьги", callback_data: 'get_earrings'}],
                    [{text: "Чокеры", callback_data: 'get_chokers'}, {text: "Колье", callback_data: 'get_necklaces'}, {text: "Цепи", callback_data: 'get_chains'}],
                    [{text: "Браслеты", callback_data: 'get_bracelets'}, {text: "Анклеты", callback_data: 'get_anklets'}],
                    [{text: "10 последних постов из Instagram", callback_data: 'get_posts'}]
                ]
            }
        });

        // Удаление сообщения с командой /categories
        await bot.deleteMessage(chatId, messageId);
    } catch (e) {
        await bot.sendMessage(followersChannel, `У @${username} в обработке команды /categories ошибка:${e.message}`);
        console.log(`в обработке команды /categories ошибка:${e.message}`);
    }
}

// Обработка команды /pay
async function handlePayCommand(bot, msg) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const username = msg.from.username;
    try {
        await bot.sendMessage(chatId, 'Получить информацию о наличии товара, вариантах доставки и оплаты можно, написав мне @cherry_story', {disable_notification: true})
        await bot.deleteMessage(chatId, messageId)
    } catch (e) {
        await bot.sendMessage(followersChannel, `У @${username} в обработке команды /pay ошибка:${e.message}`);
        console.log(`в обработке команды /pay ошибка:${e.message}`)
    }
}

//Обработка команды /care
async function handleCareCommand(bot, msg) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const username = msg.from.username;
    try {
        await bot.sendMessage(chatId, 'Храни украшения в индивидуальной упаковке, раздельно друг от друга.🎁\n' +
            '\n' +
            ' Снимай украшения перед контактом с водой, нанесением кремов и парфюма.💦\n' +
            '\n' +
            ' После ношения тщательно протри украшения мягкой тканевой салфеткой.🧺\n' +
            '\n' +
            ' Рекомендуется снимать украшения перед сном.🌙\n' +
            '\n' +
            ' Не рекомендуется носить украшения во время занятий спортом или физических упражнений, чтобы избежать повреждений или потери.⛔️', {disable_notification: true})

        setTimeout(async () => {
            await bot.sendMessage(chatId, 'Эти рекомендации помогут тебе дольше наслаждаться своими украшениями и сохранить их привлекательный внешний вид.💍✨', {disable_notification: true})
        }, 5000)

        setTimeout(async () => {
            await bot.sendMessage(chatId, 'Если остались вопросы, не стесняйся обращаться ко мне в чате @cherry_story.', {disable_notification: true})
        }, 7000)
        await bot.deleteMessage(chatId, messageId)
    } catch (e) {
        await bot.sendMessage(followersChannel, `У @${username} в обработке команды /care ошибка:${e.message}`);
        console.log(`в обработке команды /care ошибка:${e.message}`)
    }
}

//Обработка команды /posts
async function handlePostsCommand(bot, msg) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const username = msg.from.username;
    try {
        await bot.sendMessage(chatId, "Этот бот может отправить фото и видео из моих постов в Instagram, без использования VPN", {
            disable_notification: true,
            reply_markup: {
                inline_keyboard: [
                    [{text: "10 последних постов из Instagram", callback_data: 'get_posts'}]
                ]
            }
        });
        await bot.deleteMessage(chatId, messageId)
    } catch (e) {
        await bot.sendMessage(followersChannel, `У @${username} в обработке команды /posts ошибка:${e.message}`);
        console.log(`в обработке команды /posts ошибка:${e.message}`);

    }

}

async function handleQuantityUsers (bot, msg, count) {
    const username = msg.from.username;
    try{
        console.log(count)
        await bot.sendMessage(followersChannel, `Количество пользователей: ${count}`,{disable_notification: true})
    } catch (e) {
        await bot.sendMessage(followersChannel, `У @${username} в обработке команды /how many users ошибка:${e.message}`);
        console.log(`в обработке команды /how many users ошибка:${e.message}`)
    }
}

module.exports = {handleStartCommand, handleCategoriesCommand, handlePayCommand, handleCareCommand, handlePostsCommand, handleQuantityUsers};