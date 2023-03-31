/*const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');

module.exports.getTopProducts = async (event, context) => {
  const url = 'https://www.amazon.com.br/gp/bestsellers/electronics/';

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36');
  await page.goto(url, {
    waitUntil: 'networkidle0',
  });

  const topProducts = await page.evaluate(() => {
    const products = [];
    const productItem = document.querySelectorAll('.zg-item-immersion');
    productItem.forEach((productItem) => {
      const titleItem = productItem.querySelector('.a-link-normal');
      const rankItem = productItem.querySelector('.zg-badge-text');
      const imageItem = productItem.querySelector('.a-section img');
      const product = {
        rank: rankItem.textContent.trim(),
        title: titleItem.textContent.trim(),
        imageUrl: imageItem.src,
      };
      products.push(product);
    });
    return products.slice(0, 3);
  });

  console.log(titleItem)
  console.log(rankItem )
  await browser.close();


  return {
    statusCode: 200,
    body: JSON.stringify(topProducts),
  };
};
*/
