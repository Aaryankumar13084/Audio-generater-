
const { Telegraf } = require('telegraf');
const googleTTS = require('google-tts-api');
const fs = require('fs');
const axios = require('axios');

const bot = new Telegraf('7072083860:AAE1ZPxUstthNurbzm7a9weHzMjwO8EQvHM'); // टोकन को .env से सेफ लोड करो

// टेक्स्ट को 200 कैरेक्टर के पार्ट्स में डिवाइड करने के लिए फंक्शन
function splitText(text, maxLength = 200) {
    let result = [];
    while (text.length > 0) {
        result.push(text.substring(0, maxLength));
        text = text.substring(maxLength);
    }
    return result;
}

bot.start((ctx) => {
   const from = ctx.update.message.from
    console.log('from',from)
ctx.reply('👋 नमस्ते! मुझे कोई भी टेक्स्ट भेजो, मैं उसे ऑडियो में बदल दूँगा 🎤🔊')
});


bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    console.log(text);
    const lang = 'hi'; // हिंदी के लिए 'hi', इंग्लिश के लिए 'en'

    try {
        // टेक्स्ट को 200-200 कैरेक्टर के छोटे हिस्सों में तोड़ो
        const textChunks = splitText(text);
        
        for (let i = 0; i < textChunks.length; i++) {
            const chunk = textChunks[i];

            // Google TTS से ऑडियो लिंक लो
            const url = googleTTS.getAudioUrl(chunk, {
                lang: lang,
                slow: false,
                host: 'https://translate.google.com',
            });

            // ऑडियो को डाउनलोड करो
            const response = await axios({ url, responseType: 'stream' });
            const fileName = `audio_${Date.now()}_${i}.mp3`;
            const writer = fs.createWriteStream(fileName);

            response.data.pipe(writer);

            await new Promise((resolve) => writer.on('finish', resolve));

            console.log(`✅ ऑडियो तैयार: ${fileName}`);
            await ctx.replyWithAudio({ source: fileName });

            // ऑडियो भेजने के बाद फाइल डिलीट कर दो
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
