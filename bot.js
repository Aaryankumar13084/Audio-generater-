const { Telegraf } = require('telegraf');
const googleTTS = require('google-tts-api');
const fs = require('fs');
const axios = require('axios');

const bot = new Telegraf('7072083860:AAE1ZPxUstthNurbzm7a9weHzMjwO8EQvHM'); // यहाँ अपना टोकन डालो

bot.start((ctx) => ctx.reply('👋 नमस्ते! मुझे कोई भी टेक्स्ट भेजो, मैं उसे ऑडियो में बदल दूँगा 🎤🔊'));

bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    const lang = 'hi'; // हिंदी के लिए 'hi', इंग्लिश के लिए 'en'
    
    try {
        // Google TTS API से ऑडियो लिंक प्राप्त करें
        const url = googleTTS.getAudioUrl(text, {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
        });

        // ऑडियो फाइल को डाउनलोड करके सेव करो
        const response = await axios({ url, responseType: 'stream' });
        const fileName = `audio_${Date.now()}.mp3`;
        const writer = fs.createWriteStream(fileName);

        response.data.pipe(writer);

        writer.on('finish', async () => {
            console.log('✅ ऑडियो तैयार हो गया');
            await ctx.replyWithAudio({ source: fileName });
            fs.unlinkSync(fileName); // फाइल को डिलीट कर दो
        });
    } catch (error) {
        console.error('❌ ऑडियो बनाने में दिक्कत:', error);
        ctx.reply('⚠️ कुछ गलत हो गया, कृपया दोबारा कोशिश करें!');
    }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
