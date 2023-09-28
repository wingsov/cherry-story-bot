require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');

// Функция для обновления Instagram-токена
const refreshAccessToken = async () => {
    try {
        const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${process.env.INSTAGRAM_TOKEN}`;
        const response = await axios.get(url);

        // Обновляем значение токена в переменных окружения
        process.env.INSTAGRAM_TOKEN = response.data.access_token;

        // Обновляем переменную INSTAGRAM_TOKEN_TIMESTAMP с текущим временем в секундах
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        process.env.INSTAGRAM_TOKEN_TIMESTAMP = currentTimeInSeconds.toString();

        // Записываем новые значения в файл .env
        const envData = Object.keys(process.env).reduce((acc, key) => {
            return `${acc}${key}=${process.env[key]}\n`;
        }, '');
        fs.writeFileSync('.env', envData);

        console.log('INSTAGRAM_TOKEN and TIMESTAMP have been successfully updated!');
    } catch (error) {
        console.error('An error occurred while updating the token:', error);
    }
};

// Функция для проверки и обновления Instagram-токена, если это необходимо
const checkAndRefreshTokenIfNeeded = async () => {
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const tokenTimestamp = parseInt(process.env.INSTAGRAM_TOKEN_TIMESTAMP);

    // Проверяем, если прошло более 50 дней (50 * 24 * 60 * 60 секунд) с момента последнего обновления токена
    if (currentTimeInSeconds - tokenTimestamp > 50 * 24 * 60 * 60) {
        await refreshAccessToken();
    } else {
        console.log('The token is still valid, no update required.');
    }
};

// Обработка команд бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});

//Ссылка на основную страницу аккаунта Instagram
const instagramLink = 'https://www.instagram.com/_cherry_story_/';

// Instagram API
const instaPosts = `https://graph.instagram.com/me/media?fields=id,media_type,media_url,caption,timestamp,thumbnail_url,permalink,children{fields=id,media_url,thumbnail_url,permalink}&limit=1000&access_token=${process.env.INSTAGRAM_TOKEN}`

// Instagram API
const instaPostsLimit10 = `https://graph.instagram.com/me/media?fields=id,media_type,media_url,caption,timestamp,thumbnail_url,permalink,children{fields=id,media_url,thumbnail_url,permalink}&limit=10&access_token=${process.env.INSTAGRAM_TOKEN}`


//Ссылка на следующие посты из Instagram API
let nextInstaPostsUrl = instaPostsLimit10;

// Обработка команд бота
bot.on('message', async (msg) => {
    const messageId = msg.message_id;
    const chatId = msg.chat.id;
    const text = msg.text;

    // Обработка команды start
    if (text === "/start") {
        try {
            await bot.sendPhoto(chatId, 'https://t.me/teemonvideoeditor/30', {
                disable_notification: true,
                protect_content: true
            });
            await bot.sendMessage(chatId, `Привет ${msg.from.first_name}!💋\nМеня зовут Юля, я являюсь создателем бренда украшений\nCherry Story.\n\n Приглашаю Вас подписаться на мою страницу в Instagram, где Вы сможете насладиться множеством красивых и уникальных украшений от бренда Cherry Story. Будьте в курсе всех новых коллекций, которые мы предлагаем.\n Окунитесь в мир элегантности и стиля! 😊✨`, {
                disable_notification: true,
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [{text: "Instagram Cherry Story", web_app: {url: instagramLink}}]
                    ]
                }
            });
            await bot.deleteMessage(chatId,messageId)
            setTimeout(async () => {
                await bot.sendMessage(chatId, ` Раздел "Меню" ↙️ содержит список всех доступных для использования команд.`, {disable_notification: true})
            }, 5000)
        } catch (e) {
            console.log(e.message)
        }
    }

    // Обработка команды categories
    if (text === "/categories") {
        try {
            await bot.sendMessage(chatId, `${msg.from.first_name},\nкатегории украшений, изготовленных с заботой и любовью для вас.💕💫`, {
                disable_notification: true,
                reply_markup: {
                    inline_keyboard: [
                        [{text: "Кольца", callback_data: 'get_rings'}, {text: "Серьги", callback_data: 'get_earrings'}],
                        [{text: "Чокеры", callback_data: 'get_chokers'}, {text: "Колье", callback_data: 'get_necklaces'}, {text: "Цепи", callback_data: 'get_chains'},],
                        [{text: "Браслеты", callback_data: 'get_bracelets'}, {text: "Анклеты", callback_data: 'get_anclets'}],
                            [{text: "10 последних постов из Instagram", callback_data:'get_posts'}]
                    ]
                }
            });
            await bot.deleteMessage(chatId,messageId)
        } catch (e) {
            console.log(e.message)
        }
    }

    // Обработка команды pay
    if (text === '/pay') {
        try {
            await bot.sendMessage(chatId, 'Получить информацию о наличии товара, вариантах доставки и оплаты Вы можете, написав мне @cherry_story', {disable_notification: true})
            await bot.deleteMessage(chatId,messageId)
        } catch (e) {
            console.log(e.message)
        }
    }

    // Обработка команды care
    if (text === '/care') {
        try {
            await bot.sendMessage(chatId, 'Храните украшения в индивидуальной упаковке, раздельно друг от друга.🎁\n' +
                '\n' +
                ' Снимайте украшения перед контактом с водой, нанесением кремов и парфюма.💦\n' +
                '\n' +
                ' После ношения тщательно протирайте украшения мягкой тканевой салфеткой.🧺\n' +
                '\n' +
                ' Рекомендуется снимать украшения перед сном.🌙\n' +
                '\n' +
                ' Не рекомендуется носить украшения во время занятий спортом или физических упражнений, чтобы избежать повреждений или потери.⛔️', {disable_notification: true})

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Эти рекомендации помогут Вам дольше наслаждаться своими украшениями и сохранить их привлекательный внешний вид.💍✨', {disable_notification: true})
            }, 5000)

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Если у Вас остались вопросы, не стесняйтесь обращаться ко мне в чате @cherry_story.', {disable_notification: true})
            }, 10000)
            await bot.deleteMessage(chatId,messageId)
        } catch (e) {
            console.log(e.message)
        }
    }

    //Обработка команды posts
    if (text === "/posts"){
        try {
            await bot.sendMessage(chatId, "Этот бот может отправить Вам фото из моих постов в Instagram, без использования VPN", {
                disable_notification: true,
                reply_markup: {
                    inline_keyboard: [
                        [{text: "10 последних постов из Instagram", callback_data:'get_posts'}]
                    ]
                }
            })
            await bot.deleteMessage(chatId,messageId)
        } catch (e) {
            console.log(e.message);

        }
    }
});

// Обработка запросов
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const callbackData = query.data;

    // Обработка события callbackData === 'get_posts'
    if (callbackData === 'get_posts') {
        try {
            const response = await axios.get(instaPostsLimit10);
            const {data} = response.data;
            const mediaUrls = data.map(item => item.media_url);
            const chunks = chunkArray(mediaUrls, 10);
            for (let chunk of chunks) {
                await sendMedia(bot, chatId, chunk);
            }
            if (response.data.paging && response.data.paging.next) {
                // Если есть следующая страница, обновляем URL для следующих постов
                nextInstaPostsUrl = response.data.paging.next;
                // После отправки первых 10 постов, добавляем кнопку "Ещё 10 постов"
                await bot.sendMessage(chatId, "👇Здесь ещё 10 постов👇", {
                    disable_notification: true,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "Ещё 10 постов", callback_data: 'get_next_posts' }] // Изменил на 'get_next_posts' чтобы показать следующие 10 постов
                        ]
                    }
                });
            }
        } catch (e) {
            console.log(e.message);
            await bot.sendMessage(chatId, "Упс... Instagram, в отличии от меня, не хочет работать. Попробуйте ещё раз!😉️️");
        }
    }

    // Обработка события callbackData === 'get_next_posts'
    if (callbackData === 'get_next_posts') {
        try {
            const response = await axios.get(nextInstaPostsUrl);
            const { data } = response.data;
            const mediaUrls = data.map(item => item.media_url);
            const chunks = chunkArray(mediaUrls, 10);
            for (let chunk of chunks) {
                await sendMedia(bot, chatId, chunk);
            }
            if (response.data.paging && response.data.paging.next) {
                // Если есть следующая страница, обновляем URL для следующих постов
                nextInstaPostsUrl = response.data.paging.next;
                // После отправки первых 10 постов, добавляем кнопку "Ещё 10 постов"
                await bot.sendMessage(chatId, "Если Вы нашли идеальное украшение для себя, просто отправьте мне фото этого украшения @cherry_story. Буду рада предоставить дополнительную информацию.🌸", {
                    disable_notification: true,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "Ещё 10 постов", callback_data: 'get_next_posts' }] // Изменил на 'get_next_posts' чтобы показать следующие 10 постов
                        ]
                    }
                });
            }
        } catch (e) {
            console.log(e.message);
            await bot.sendMessage(chatId, "Упс... Instagram, в отличии от меня, не хочет работать. Попробуйте ещё раз!😉️️")
        }
    }


    // Обработка события callbackData === 'get_rings'
    if (callbackData === 'get_rings') {
        try {
            await sendRingPosts(bot, chatId);
        } catch (e) {
            console.log(e.message);
        }
    }
    // Обработка события callbackData === 'get_earrings'
    if (callbackData === 'get_earrings') {
        try {
            await sendEarringsPosts(bot, chatId);
        } catch (e) {
            console.log(e.message);
        }
    }
    // Обработка события callbackData === 'get_chokers'
    if (callbackData === 'get_chokers') {
        try {
            await sendChokerPosts(bot, chatId);
        } catch (e) {
            console.log(e.message);
        }
    }
    // Обработка события callbackData === 'get_necklace'
    if (callbackData === 'get_necklaces') {
        try {
            await sendNecklacePosts(bot, chatId);
        } catch (e) {
            console.log(e.message);
        }
    }
    // Обработка события callbackData === 'get_chains'
    if (callbackData === 'get_chains') {
        try {
            await sendChainPosts(bot, chatId);
        } catch (e) {
            console.log(e.message);
        }
    }
    // Обработка события callbackData === 'get_bracelets'
    if (callbackData === 'get_bracelets') {
        try {
            await sendBraceletPosts(bot, chatId);
        } catch (e) {
            console.log(e.message);
        }
    }
    // Обработка события callbackData === 'get_anclets'
    if (callbackData === 'get_anclets') {
        try {
            await sendAncletPosts(bot, chatId);
        } catch (e) {
            console.log(e.message);
        }
    }
});

// Функция для отправки медиафайлов в чат
async function sendMedia(bot, chatId, mediaUrls) {
    const media = [];
    for (let url of mediaUrls) {
        const mediaObject = {
            type: 'photo',
            media: url
        };
        media.push(mediaObject);
    }
    await bot.sendMediaGroup(chatId, media, {
        disable_notification: true,
    });
}

// Разбиваем URL-адреса на группы по 10
function chunkArray(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}
// Функция для отправки медиафайлов в чат по хэштегу
async function fetchAndSendCategoryPosts(bot, chatId, hashtag) {
    try {
        // Получаем данные с Instagram API
        const response = await axios.get(instaPosts);
        const { data } = response.data;

        // Фильтруем посты, оставляем только те, у которых в поле "caption" есть указанный хэштег
        const categoryPosts = data.filter((item) => {
            const caption = item.caption ? item.caption.toLowerCase() : '';
            return caption.includes(hashtag);
        });

        // Ограничиваем количество постов до 10
        const first10CategoryPosts = categoryPosts.slice(0, 10);

        // Извлекаем URL-адреса медиафайлов
        const mediaUrls = first10CategoryPosts.map((item) => item.media_url);

        // Разбиваем URL-адреса на группы по 10 и отправляем пользователю
        const chunks = chunkArray(mediaUrls, 10);
        for (let chunk of chunks) {
            await sendMedia(bot, chatId, chunk);
        }
        await bot.sendMessage(chatId, 'Больше украшений по выбранной категории Вы найдете на моей странице в Instagram');
    } catch (e) {
        console.log(e.message);
    }
}

// Использование функции для каждой категории
async function sendRingPosts(bot, chatId) {
    await fetchAndSendCategoryPosts(bot, chatId, '#кольцо');
}

async function sendEarringsPosts(bot, chatId) {
    await fetchAndSendCategoryPosts(bot, chatId, '#серьги');
}

async function sendChokerPosts(bot, chatId) {
    await fetchAndSendCategoryPosts(bot, chatId, '#чокер');
}

async function sendNecklacePosts(bot, chatId) {
    await fetchAndSendCategoryPosts(bot, chatId, '#колье');
}

async function sendChainPosts(bot, chatId) {
    await fetchAndSendCategoryPosts(bot, chatId, '#цепь');
}

async function sendBraceletPosts(bot, chatId) {
    await fetchAndSendCategoryPosts(bot, chatId, '#браслет');
}

async function sendAncletPosts(bot, chatId) {
    await fetchAndSendCategoryPosts(bot, chatId, '#анклет');
}

(async () => {
    await checkAndRefreshTokenIfNeeded();
})();
