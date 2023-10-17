
require("dotenv").config()
const axios = require("axios");
const fs = require("fs");

// Ссылка на канал пользователей
const followersChannel = process.env.FOLLOWERS_CHANNEL;

// Функция для обновления Instagram-токена
const refreshAccessToken = async (bot) => {
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
        await bot.sendMessage(followersChannel,'INSTAGRAM_TOKEN и TIMESTAMP были успешно обновлены!')
        console.log('INSTAGRAM_TOKEN и TIMESTAMP были успешно обновлены!');
    } catch (e) {
        await bot.sendMessage(followersChannel,`Произошла ошибка при обновлении токена: ${e.message}`)
        console.log(`Произошла ошибка при обновлении токена: ${e.message}`);
    }
};

// Функция для проверки и обновления Instagram-токена, если это необходимо
const checkAndRefreshTokenIfNeeded = async (bot) => {
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const tokenTimestamp = parseInt(process.env.INSTAGRAM_TOKEN_TIMESTAMP);

    // Проверяем, если прошло более 50 дней (50 * 24 * 60 * 60 секунд) с момента последнего обновления токена
    if (currentTimeInSeconds - tokenTimestamp > 50 * 24 * 60 * 60) {
        await refreshAccessToken();
    } else {
        await bot.sendMessage(followersChannel,'Токен по-прежнему действителен, обновление не требуется.',{disable_notification: true})
        console.log('Токен по-прежнему действителен, обновление не требуется.');
    }
};
module.exports = {refreshAccessToken, checkAndRefreshTokenIfNeeded};