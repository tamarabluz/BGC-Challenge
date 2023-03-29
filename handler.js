const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

module.exports.getTopProducts = async (event, context) => {
  const url = 'https://www.amazon.com.br/gp/bestsellers';

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });

  const topProducts = await page.evaluate(() => {
    const products = [];
    const productItem = document.querySelectorAll('.zg-item-immersion');
    productItem.forEach((productItem) => {
      const titleItem = productItem.querySelector('.p13n-sc-truncated');
      const rankItem = productItem.querySelector('.zg-badge-text');
      const imageItem = productItem.querySelector('.a-section img');

      const product = {
        rank: rankItem.innerText,
        title: titleItem.innerText,
        imageUrl: imageItem.src,
      };

      products.push(product);
    });
    return products.slice(0, 3);
  });

  await browser.close();

  return {
    statusCode: 200,
    body: JSON.stringify(topProducts),
  };
};

