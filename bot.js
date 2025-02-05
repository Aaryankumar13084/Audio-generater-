require('dotenv').config();
const { Telegraf } = require('telegraf');
const googleTTS = require('google-tts-api');
const fs = require('fs');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN); // अब टोकन सेफ रहेगा

function splitText(text, maxLength = 200) {
    let result = [];
    while (text.length > 0) {
        result.push(text.substring(0, maxLength));
        text = text.substring(maxLength);
    }
    return result;
}

bot.start((ctx) => ctx.reply('👋 नमस्ते! मुझे कोई भी टेक्स्ट भेजो, मैं उसे ऑडियो में बदल दूँगा 🎤🔊'));

bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    const lang = 'hi'; // हिंदी के लिए 'hi', इंग्लिश के लिए 'en'

    try {
        const textChunks = splitText(text);
        for (let i = 0; i < textChunks.length; i++) {
            const chunk = textChunks[i];

            const url = googleTTS.getAudioUrl(chunk, {
                lang: lang,
                slow: false,
                host: 'https://translate.google.com',
            });

            const response = await axios({ url, responseType: 'stream' });
            const fileName = `audio_${Date.now()}_${i}.mp3`;
            const writer = fs.createWriteStream(fileName);

            response.data.pipe(writer);

            await new Promise((resolve) => writer.on('finish', resolve));

            console.log(`✅ ऑडियो तैयार: ${fileName}`);
            await ctx.replyWithAudio({ source: fileName });

            fs.unlinkSync(fileName);
        }
    } catch (error) {
        console.error('❌ ऑडियो बनाने में दिक्कत:', error);
        ctx.reply('⚠️ कुछ गलत हो गया, कृपया दोबारा कोशिश करें!');
    }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
