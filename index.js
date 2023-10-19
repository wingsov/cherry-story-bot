
require("dotenv").config()
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Обработка команд бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});

// Instagram API
const instaPosts = `https://graph.instagram.com/me/media?fields=id,media_type,media_url,caption,timestamp,thumbnail_url,permalink,children{fields=id,media_url,thumbnail_url,permalink}&limit=1000&access_token=${process.env.INSTAGRAM_TOKEN}`

// Instagram API
const instaPostsLimit10 = `https://graph.instagram.com/me/media?fields=id,media_type,media_url,caption,timestamp,thumbnail_url,permalink,children{fields=id,media_url,thumbnail_url,permalink}&limit=10&access_token=${process.env.INSTAGRAM_TOKEN}`

// Ссылка на канал пользователей
const followersChannel = process.env.FOLLOWERS_CHANNEL;

// Функции команд бота
const {
    handleStartCommand,
    handleCategoriesCommand,
    handlePayCommand,
    handleCareCommand,
    handlePostsCommand,
    handleQuantityUsers
} = require('./botCommands');

//Функции отправки напомнинаний
const {
    happyNY,
    march,
    reminderWinter,
    reminderSpring,
    reminderSummer,
    reminderAutumn
} = require('./newsLetter');


// Кейсы запросов
const GET_POSTS = 'get_posts';
const GET_NEXT_POSTS = 'get_next_posts';
const GET_NEXT_CATEGORY_POSTS = 'get_next_category_posts';
const CATEGORY_MAP = {
    'get_rings': 'кольцо',
    'get_earrings': 'серьги',
    'get_chokers': 'чокер',
    'get_necklaces': 'колье',
    'get_chains': 'цепь',
    'get_bracelets': 'браслет',
    'get_anklets': 'анклет'
};

//Ссылка на следующие посты из Instagram API
let nextInstaPostsUrl = instaPostsLimit10;
//Ссылка на следующие посты по выбранной категории
let nextCategoryPostsUrl = instaPosts;

//Username для отправки в чат пользователей
//let globalUsername = '';
// callbackData соответствующая нажатой кнопке с категорией
let buttonCallbackData = '';

// Массив для хранения всех полученных медиафайлов
let allMediaUrls = [];
// Массив для хранения всех полученных медиафайлов по выбранной категории
let allMediaCategoryUrls = [];

let count = 0;

// Обработка команд бота
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const username = msg.from.username ?? 'anonymous user';
    const {checkAndRefreshTokenIfNeeded} = require('./refreshInstaToken');
    try {
        switch (text) {
            case '/start':
                await handleStartCommand(bot, msg, chatId);
                await checkAndRefreshTokenIfNeeded(bot, msg);
                count++;
                await reminderWinter(bot, msg);
                await happyNY(bot, msg);
                await march(bot, msg);
                await reminderSpring(bot, msg);
                await reminderSummer(bot, msg);
                await reminderAutumn(bot, msg);
                break;
            case '/categories':
                await handleCategoriesCommand(bot, msg);
                break;
            case '/pay':
                await handlePayCommand(bot, msg);
                break;
            case '/care':
                await handleCareCommand(bot, msg);
                break;
            case '/posts':
                await handlePostsCommand(bot, msg);
                break;
            case '/how many users':
                await handleQuantityUsers(bot, count);
                break;
            default:
                // await bot.forwardMessage(myId, chatId, messageId);
                await bot.sendMessage(chatId, "Я всего лишь бот и знаю только команды.😔️️️️️️\nПо всем вопросам пиши моей госпоже @cherry_story\n Вообще, Юля мне не госпожа, но ей нравится, когда я её так называю.", {disable_notification: true});
                setTimeout(async () => {
                    await bot.sendMessage(chatId, ` Раздел "Меню" ↙️ содержит список всех доступных для использования команд.`, {disable_notification: true})
                }, 3000);
                break;
        }
    } catch (e) {
        console.log(`в обработке message ошибка:${e.message}`);
        await bot.sendMessage(followersChannel, `У @${username} не работает обработка commands ошибка:${e.message}`)
        await bot.sendMessage(chatId, 'Упс! Что-то пошло не так. Пожалуйста, попробуйте еще раз.');
    }
});

// Обработка запросов
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const callbackData = query.data;
    const username = query.message.chat.username;

    try {
        switch (callbackData) {
            case GET_POSTS:
                await handleGetPosts(chatId, username);
                break;
            case GET_NEXT_POSTS:
                await handleGetNextPosts(chatId, username);
                break;
            case GET_NEXT_CATEGORY_POSTS:
                await handleNextCategoryPosts(chatId, buttonCallbackData, username)
                break;
            default:
                if (callbackData in CATEGORY_MAP) {
                    await handleCategory(chatId, CATEGORY_MAP[callbackData], username);
                    buttonCallbackData = CATEGORY_MAP[callbackData];
                }
                break;
        }
    } catch (e) {
        console.error(`в обработке callback_query ошибка:${e.message}`);
        await bot.sendMessage(followersChannel, `У @${username} не работает обработка commands ошибка:${e.message}`);
        await bot.sendMessage(chatId, 'Упс! Что-то пошло не так. Пожалуйста, попробуйте еще раз.');
    }
});

//Функция обработки callback === GET_POSTS
async function handleGetPosts(chatId, username) {
    try {
        await bot.sendChatAction(chatId, 'upload_photo')
        const response = await axios.get(instaPostsLimit10);
        const {data} = response.data;

        for (let item of data) {
            if (item.media_type === 'CAROUSEL_ALBUM' && item.children && item.children.data.length > 0) {
                // Если это карусель, добавляем все изображения из карусели
                allMediaUrls.push(...item.children.data.map(child => child.media_url));
            } else {
                // Иначе добавляем изображение
                allMediaUrls.push(item.media_url);
            }
        }
        console.log(`было:${allMediaUrls.length}`)

        // Если есть следующая страница, обновляем URL для следующих постов
        if (response.data.paging && response.data.paging.next) {
            nextInstaPostsUrl = response.data.paging.next;
        } else {
            nextInstaPostsUrl = null;
        }

        // Отправляем первые 10 медиафайлов
        const firstMediaUrls = allMediaUrls.slice(0, 10);
        await sendMedia(bot, chatId, firstMediaUrls);

        // Удаляем первые 10 элементов из массива
        allMediaUrls.splice(0, 10);
        console.log(`осталось:${allMediaUrls.length}`)

        if (nextInstaPostsUrl) {
            // Если есть следующая страница, добавляем кнопку "Ещё 10 постов"
            await bot.sendMessage(chatId, "👇Здесь ещё 10 постов👇", {
                disable_notification: true,
                reply_markup: {
                    inline_keyboard: [
                        [{text: "Ещё 10 постов", callback_data: 'get_next_posts'}]
                    ]
                }
            });
        }
        await bot.sendMessage(followersChannel, `@${username} смотрит все посты из Instagram`,{disable_notification: true})
        setTimeout(async ()=>{ await cleaningArray(allMediaUrls)
        },2 * 60 * 60 * 1000);
    } catch (e) {
        await bot.sendMessage(chatId, "Упс... Instagram, в отличии от меня, не хочет работать. \n️️️️️ Попробуй ещё раз!😉️️");
        await bot.sendMessage(followersChannel, `У @${username} не получилось посмотреть посты, ошибка:${e.message}`)
        console.log(`в фукции handleGetPosts ошибка:${e.message}`);
    }
}

//Функция обработки callback === GET_NEXT_POSTS
async function handleGetNextPosts(chatId, username) {
    try {
        await bot.sendChatAction(chatId, 'upload_photo')
        // Если массив пуст, получите новые медиафайлы из Instagram
        if (allMediaUrls.length === 0) {
            const response = await axios.get(nextInstaPostsUrl);
            const {data} = response.data;

            // Если это карусель, добавляем все изображения из карусели
            for (let item of data) {
                if (item.media_type === 'CAROUSEL_ALBUM' && item.children && item.children.data.length > 0) {
                    allMediaUrls.push(...item.children.data.map(child => child.media_url));
                } else {
                    // Иначе добавляем изображение
                    allMediaUrls.push(item.media_url);
                }
            }

            console.log(`было:${allMediaUrls.length}`);

            // Если есть следующая страница, обновляем URL для следующих постов
            if (response.data.paging && response.data.paging.next) {
                nextInstaPostsUrl = response.data.paging.next;
            } else {
                nextInstaPostsUrl = null;
            }
        }

        if (allMediaUrls.length > 0) {
            // Отправляем первые 10 медиафайлов
            const firstMediaUrls = allMediaUrls.slice(0, 10);
            await sendMedia(bot, chatId, firstMediaUrls);

            // Удаляем первые 10 элементов из массива
            allMediaUrls.splice(0, 10);
            console.log(`осталось:${allMediaUrls.length}`)
            if (allMediaUrls.length === 0) {
                // Если массив полностью пуст, выполните операцию очистки массива
                allMediaUrls.length = 0;
            }

            if (nextInstaPostsUrl) {
                // Если есть следующая страница, добавляем кнопку "Ещё 10 постов"
                await bot.sendMessage(chatId, "Если ты нашла идеальное украшение для себя, просто отправь мне фото этого украшения @cherry_story.\n Буду рада предоставить дополнительную информацию.🌸", {
                    disable_notification: true,
                    reply_markup: {
                        inline_keyboard: [
                            [{text: "Ещё 10 постов", callback_data: 'get_next_posts'}]
                        ]
                    }
                });
            }
        } else {
            // Если массив все равно пуст, сообщите пользователю, что больше медиафайлов нет
            await bot.sendMessage(chatId, "Ты просмотрела все посты.",{disable_notification: true});
            await bot.sendMessage(followersChannel, `@${username} посмотрел все посты из Instagram`,{disable_notification: true})
        }
        setTimeout(async ()=>{ await cleaningArray(allMediaUrls)
        },2 * 60 * 60 * 1000);
    } catch (e) {
        await bot.sendMessage(chatId, "Упс... Instagram, в отличии от меня, не хочет работать. \n️️️️️ Попробуй ещё раз!😉️️");
        await bot.sendMessage(followersChannel, `У @${username} не получилось посмотреть следующие посты, ошибка:${e.message}`)
        console.log(`в фукции handleGetNextPosts ошибка:${e.message}`);
    }
}

//Функция для отправки медиафайлов по категории из CATEGORY_MAP в чат
async function handleCategory(chatId, hashtag, username) {
    try {
        await bot.sendChatAction(chatId, 'upload_photo')

        // Очищаем массив перед добавлением медиафайлов из новой категории
        allMediaCategoryUrls = [];

        // Отправляем запрос на Instagram API
        const response = await axios.get(instaPosts);
        const {data} = response.data;

        // Фильтруем посты по хэштегу
        for (let item of data) {
            if (item.caption && item.caption.toLowerCase().includes(hashtag)) {

                // Если это карусель, добавляем все изображения из карусели
                if (item.media_type === 'CAROUSEL_ALBUM' && item.children && item.children.data.length > 0) {
                    allMediaCategoryUrls.push(...item.children.data.map(child => child.media_url));
                } else {

                    // Иначе добавляем изображение
                    allMediaCategoryUrls.push(item.media_url);

                }
            }
        }

        console.log(`${hashtag} было: ${allMediaCategoryUrls.length}`);

        // Если есть следующая страница, обновляем URL для следующих постов
        if (response.data.paging && response.data.paging.next) {
            nextCategoryPostsUrl = response.data.paging.next;
        } else {
            nextCategoryPostsUrl = null;
        }

        // Отправляем первые 10 медиафайлов
        const firstMediaUrls = allMediaCategoryUrls.slice(0, 10);
        await sendMedia(bot, chatId, firstMediaUrls);

        // Удаляем первые 10 элементов из массива
        allMediaCategoryUrls.splice(0, 10);
        console.log(`${hashtag} осталось: ${allMediaCategoryUrls.length}`);

        if (nextCategoryPostsUrl) {
            // Если есть следующая страница, добавляем кнопку "Ещё 10 постов"
            await bot.sendMessage(chatId, "👇Ещё 10 постов из этой категории👇", {
                disable_notification: true,
                reply_markup: {
                    inline_keyboard: [
                        [{text: 'Ещё 10 постов', callback_data: 'get_next_category_posts'}]
                    ]
                }
            });
        }
        setTimeout(async () => {
            await sendQuotes(chatId,hashtag)
        }, 3000)
        setTimeout(async ()=>{ await cleaningArray(allMediaCategoryUrls)
        }, 2 * 60 * 20 * 1000);
        await bot.sendMessage(followersChannel, `@${username} смотрит категорию: ${hashtag}`,{disable_notification: true});
    } catch (e) {
        await bot.sendMessage(chatId, "Упс... Instagram, в отличии от меня, не хочет работать. ️️️️️\n Попробуй ещё раз!😉️️");
        await bot.sendMessage(followersChannel, `У @${username} не получилось посмотреть категорию ${hashtag}, ошибка:${e.message}`)
        console.log(`в фукции handleCategory ошибка:${e.message}`);
    }
}

//Функция обработки callback === GET_NEXT_CATEGORY_POSTS
async function handleNextCategoryPosts(chatId, hashtag, username) {
    try {
        await bot.sendChatAction(chatId, 'upload_photo')
        if (allMediaCategoryUrls.length === 0) {
            // Если массив пуст, получите новые медиафайлы из Instagram
            const response = await axios.get(nextCategoryPostsUrl);
            const {data} = response.data;

            for (let item of data) {
                // Фильтруем медиафайлы по хэштегу
                if (item.caption && item.caption.toLowerCase().includes(hashtag)) {
                    // Если это карусель, добавляем все изображения из карусели
                    if (item.media_type === 'CAROUSEL_ALBUM' && item.children && item.children.data.length > 0) {
                        allMediaCategoryUrls.push(...item.children.data.map(child => child.media_url));
                    } else {
                        // Иначе добавляем изображение
                        allMediaCategoryUrls.push(item.media_url);
                    }
                }
            }
            console.log(`${hashtag} было:${allMediaCategoryUrls.length}`);

            // Если есть следующая страница, обновляем URL для следующих постов
            if (response.data.paging && response.data.paging.next) {
                nextCategoryPostsUrl = response.data.paging.next;
            } else {
                nextCategoryPostsUrl = null;
                allMediaCategoryUrls = [];
            }
        }
        if (allMediaCategoryUrls.length > 0) {
            // Отправляем первые 10 медиафайлов
            const firstMediaUrls = allMediaCategoryUrls.slice(0, 10);
            await sendMedia(bot, chatId, firstMediaUrls);

            // Удаляем отправленные медиафайлы из массива
            allMediaCategoryUrls.splice(0, 10);
            console.log(`${hashtag} осталось:${allMediaCategoryUrls.length}`)
            if (nextCategoryPostsUrl) {
                // Если есть следующая страница, добавляем кнопку "Ещё 10 постов"
                await bot.sendMessage(chatId, "Если ты нашла идеальное украшение для себя, просто отправь мне фото этого украшения @cherry_story. Буду рада предоставить дополнительную информацию 🌸", {
                    disable_notification: true,
                    reply_markup: {
                        inline_keyboard: [
                            [{text: "Ещё 10 постов по этой категории", callback_data: 'get_next_category_posts'}]
                        ]
                    }
                });
            }
        } else {
            // Если массив все равно пуст, сообщите пользователю, что больше медиафайлов нет
            await bot.sendMessage(chatId, "Больше нет постов по выбранной категории.",{disable_notification: true});
            await bot.sendMessage(followersChannel, `@${username} посмотрел все посты из категории: ${hashtag}`,{disable_notification: true})
        }
        setTimeout(async ()=>{ await cleaningArray(allMediaCategoryUrls)
        },2 * 60 * 60 * 1000);
        await bot.sendMessage(followersChannel, `@${username} смотрит следующие посты по категории: ${hashtag}`,{disable_notification: true});
    } catch (e) {
        await bot.sendMessage(chatId, "Упс... Instagram, в отличии от меня, не хочет работать. \n️️️️️ Попробуй ещё раз!😉️️");
        await bot.sendMessage(followersChannel, `У @${username} не получилось посмотреть следующие посты по категории ${hashtag}, ошибка:${e.message}`)
        console.log(`в фукции handleNextCategoryPosts ошибка:${e.message}`);
    }
}

//Функция для отправки медиафайлов в чат
async function sendMedia(bot, chatId, mediaUrls, username) {
    try {
        const photoMedia = [];
        const videoMedia = [];

        for (let url of mediaUrls) {
            const mediaType = url.includes('.mp4') ? 'video' : 'photo';

            if (mediaType === 'photo') {
                const mediaObject = {
                    type: 'photo',
                    media: url
                };
                photoMedia.push(mediaObject);
            } else {
                const objectVideo = {
                    type: 'video',
                    media: url
                };
                videoMedia.push(objectVideo)
            }
        }
        // Проверка на пустые массивы и отправка соответствующих массивов
        if (photoMedia.length === 0 && videoMedia.length > 0) {
            await bot.sendMediaGroup(chatId, videoMedia, {disable_notification: true});
        } else if (photoMedia.length > 0 && videoMedia.length === 0) {
            await bot.sendMediaGroup(chatId, photoMedia, {disable_notification: true});
        } else if (photoMedia.length > 0 && videoMedia.length > 0) {
            // Если оба массива не пусты, отправляем их оба
            await bot.sendMediaGroup(chatId, photoMedia, {disable_notification: true});
            await bot.sendMediaGroup(chatId, videoMedia, {disable_notification: true});
        }
    } catch (e) {
        await bot.sendMessage(followersChannel, `@${username} не отправились медиа, ошибка:${e.message}`)
        console.log(`в фукции sendMedia ошибка:${e.message}`);
    }
}

//Функция для отправки цитат
async function sendQuotes(chatId, hashtag, username) {
    try {
        if (hashtag === 'кольцо') {
            await bot.sendMessage(chatId, '"Самое важное в моде - это доверие себе. Если вы не верите в себя, никто другой не поверит."(Tom Ford)', {disable_notification: true});
        } else if (hashtag === 'серьги') {
            await bot.sendMessage(chatId, '"Женщина никогда не может иметь слишком много украшений. (Coco Chanel)', {disable_notification: true});
        } else if (hashtag === 'чокер') {
            await bot.sendMessage(chatId, '"Мода - это чисто внешняя вещь, стиль - это нечто более глубокое." (Karl Lagerfeld)', {disable_notification: true});
        } else if (hashtag === 'колье') {
            await bot.sendMessage(chatId, '"То, что вы носите, — это то, как вы представляете себя миру, особенно сегодня, когда человеческие контакты проходят так быстро. Мода — это мгновенный язык»" (Miuccia Prada)', {disable_notification: true});
        } else if (hashtag === 'цепь') {
            await bot.sendMessage(chatId, '"Мода - это кажущаяся реальность, а стиль - это индивидуальность." (Alexander McQueen)', {disable_notification: true});
        } else if (hashtag === 'браслет') {
            await bot.sendMessage(chatId, '"Основное правило великой моды: качество вещей никогда не выходит из моды." (Christian Dior)', {disable_notification: true});
        } else {
            await bot.sendMessage(chatId, '"Мода приходит и уходит, но стиль вечен." (Yves Saint Laurent)', {disable_notification: true});
        }
    } catch (e) {
        await bot.sendMessage(followersChannel, `@${username} не отправились цитаты, ошибка:${e.message}`)
        console.log(`в фукции sendQuotes ошибка:${e.message}`);
    }
}

//Функция очистки массивов
async function cleaningArray(username){
    try{
        allMediaUrls =  [];
        allMediaCategoryUrls = [];
    } catch (e) {
        await bot.sendMessage(followersChannel, `@${username} не очистились массивы с медиа-файлами, ошибка:${e.message}`)
        console.log(`в фукции cleaningArray ошибка:${e.message}`);
    }
}