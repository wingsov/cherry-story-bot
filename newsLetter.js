
const cron = require('node-cron')

const followersChannel = process.env.FOLLOWERS_CHANNEL;

//   ┌────────────── second (optional)
//   │ ┌──────────── minute
//   │ │ ┌────────── hour
//   │ │ │ ┌──────── day of month
//   │ │ │ │ ┌────── month
//   │ │ │ │ │ ┌──── day of week
//   │ │ │ │ │ │
//   │ │ │ │ │ │
//   * * * * * *

//фукция-напоминание для зимы
async function reminderWinter (bot, msg){
    const chatId = msg.chat.id;
    const username = msg.from.username;
    try {
        cron.schedule('30 18 02 12 *',async () => {
            await bot.sendMessage(chatId, 'Привет дорогая! \n' +
                '\n' +
                'В Cherry Story сейчас много уютных новинок. Создай свою историю теплых вечеров. Ведь украшение - эта та деталь, которая делает образ уникальным, со своей историей и изюминкой.');
            console.log(`отправил сообщение ${username} в 18:30 02.12`);
        })
    } catch (e) {
        await bot.sendMessage(followersChannel, `@${username} не отправилось напоминание`,{disable_notification: true});
        console.log(`ошибка в отправлении reminder ${e.message}`)
    }
}

//фукция-напоминание для весны
async function reminderSpring (bot, msg){
    const chatId = msg.chat.id;
    const username = msg.from.username;
    try {
        cron.schedule('30 18 02 03 *',async () => {
            await bot.sendMessage(chatId, 'Привет дорогая! \n' +
                '\n' +
                'Весна - это время ярких красок 🌸 Встречай её с яркими и нежными украшениями Cherry Story 🛍️');
            console.log(`отправил сообщение ${username} в 18:30 02.03`);
        })
    } catch (e) {
        await bot.sendMessage(followersChannel, `@${username} не отправилось напоминание`);
        console.log(`ошибка в отправлении reminder ${e.message}`)
    }
}

//фукция-напоминание для лета
async function reminderSummer (bot, msg){
    const chatId = msg.chat.id;
    const username = msg.from.username;
    try {
        cron.schedule('30 18 02 06 *',async () => {
            await bot.sendMessage(chatId, 'Привет милая! \n' +
                '\n' +
                'Встречай лето с вкусной коллекцией украшений Cherry Story 🍭 Новенькие серьги , браслеты и анклеты уже ждут тебя 💋');
            console.log(`отправил сообщение ${username} в 18:30 02.06`);
        })
    } catch (e) {
        await bot.sendMessage(followersChannel, `@${username} не отправилось напоминание`);
        console.log(`ошибка в отправлении reminder ${e.message}`)
    }
}

//фукция-напоминание для осени
async function reminderAutumn (bot, msg){
    const chatId = msg.chat.id;
    const username = msg.from.username;
    try {
        cron.schedule('30 18 02 09 *',async () => {
            await bot.sendMessage(chatId, 'Привет милая! \n' +
                '\n' +
                'Сделай очень яркой и теплой с украшениями Cherry Story❤️ Давай вместе создадим твой неповторимый стиль для этого прекрасного сезона 🍂');
            console.log(`отправил сообщение ${username} в 18:30 02.09`);
        })
    } catch (e) {
        await bot.sendMessage(followersChannel, `@${username} не отправилось напоминание`);
        console.log(`ошибка в отправлении reminder ${e.message}`)
    }
}

//фукция-напоминание к 8 марта
async function happyNY (bot, msg) {
    const chatId = msg.chat.id;
    const username = msg.from.username;
    try{
        cron.schedule('30 18 08 12 *',async () => {
            await bot.sendMessage(chatId,"Привет, милая! \n" +
                "\n" +
                "Уже скоро наступит самое сказочное время в году✨🎄\nУже сейчас стоит позаботиться о подарках для любимых 😉 \n" +
                "Новогоднее предложение от Cherry Story - это уникальный подарок, который порадует тебя и твоих близких ❤️");
            console.log(`отправил сообщение ${username} в 18:30 08.12`)
        })
    } catch (e) {
        await bot.sendMessage(followersChannel, `@${username} не отправилось поздравление с НГ`)
        console.log(`ошибка в отправлении happyNY ${e.message}`)
    }
}

//фукция-напоминание к НГ
async function march (bot,msg) {
    const chatId = msg.chat.id;
    const username = msg.from.username;
    try{
        cron.schedule('30 18 25 02 *',async () => {
            await bot.sendMessage(chatId,"Привет, милая! \n" +
                "\n" +
                "Осталось всего несколько дней до наступления цветущей весны 🌷 И чуть больше недели до 8 марта 🥰\n"+
                "Специально для этого праздника я подготовила много новинок.\n" +
                "Время обновить ювелирный гардероб и побаловать себя новинками от Cherry Story ❤️");
            console.log(`отправил сообщение ${username} в 18:30 25.02`)
        })
    } catch (e) {
        await bot.sendMessage(followersChannel, `@${username} не отправилось поздравление с НГ`)
        console.log(`ошибка в отправлении happyNY ${e.message}`)
    }
}

module.exports = { happyNY, march, reminderWinter, reminderSpring, reminderSummer, reminderAutumn }