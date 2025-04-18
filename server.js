const puppeteer = require('puppeteer');
const TelegramBot = require('node-telegram-bot-api');

// توكن البوت
const token = 'YOUR_BOT_TOKEN'; // استبدله بتوكن البوت الخاص بك
const bot = new TelegramBot(token, { polling: true });

// دالة سحب الصور من رابط تيليجرام
async function getImagesFromTelegramPost(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  // سحب جميع الصور
  const images = await page.evaluate(() => {
    const imgElements = document.querySelectorAll('img');
    return Array.from(imgElements).map(img => img.src);
  });

  await browser.close();
  return images;
}

// عندما يرسل المستخدم رابط تيليجرام للبوت
bot.onText(/\/getimages (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const url = match[1]; // الرابط المرسل من المستخدم

  try {
    const images = await getImagesFromTelegramPost(url);
    if (images.length === 0) {
      bot.sendMessage(chatId, 'لم أتمكن من العثور على صور في هذا الرابط.');
    } else {
      // إرسال أول صورة (يمكنك تعديلها لتبادل الصور)
      bot.sendPhoto(chatId, images[0], { caption: 'تم جلب الصورة بنجاح!' });
    }
  } catch (error) {
    bot.sendMessage(chatId, 'حدث خطأ أثناء معالجة الرابط.');
    console.error(error);
  }
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'أرسل لي رابط منشور تيليجرام مع الأمر /getimages لرؤية الصور.');
});
