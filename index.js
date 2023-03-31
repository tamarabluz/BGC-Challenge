const express = require('express');
const app = express();
const fs = require('fs');
const util = require('util');
const puppeteer = require('puppeteer');

app.get('/', (req, res) => {
res.send('Hello World!');
});

app.get('/top-products', async (req, res) => {
const url = 'https://www.amazon.com.br/gp/bestsellers/electronics';

const browser = await puppeteer.launch({
  headless: true,
  slowMo: 50
  
  
});

const page = await browser.newPage();
await page.setExtraHTTPHeaders({
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
});

const response = await page.goto(url, { waitUntil: 'load', timeout: 30000 });

// espera pelo elemento 'body' estar disponível
await page.waitForSelector('body');
console.log("encontrado")



// Salva a imagem em um arquivo no projeto
const imageBuffer = await page.screenshot();
fs.writeFile('imagem.png', imageBuffer, (err) => {
if (err) throw err;
console.log('Imagem salva com sucesso!');
});



if (response.status() !== 200) {
console.log('A página não foi carregada com sucesso.');
} else {
console.log('A página foi carregada com sucesso!');
}

const products = await page.evaluate(() => {
  const products = [];
  
  const productItems = document.querySelectorAll('body');

  productItems.forEach((productItem) => {
    const titleItem = productItem.querySelector('._cDEzb_p13n-sc-css-line-clamp-3_g3dy1');
  
    const rankItem = productItem.querySelector('.zg-bdg-text');
  
    
    const urlItem = productItem.querySelector('.a-link-normal');
  
    
    const priceItem = productItem.querySelector('._cDEzb_p13n-sc-price_3mJ9Z');

    const price = `${priceItem?.innerText || 0}`;
    const product = {
      rank: rankItem?.innerText || '',
      title: titleItem?.innerText || '',
      price: price,
      url: urlItem?.href || '',
    };
    products.push(product);
  });
  return products;
  
});
await browser.close();
const topProducts = products
  .sort((a, b) => b.rank - a.rank)
  .slice(0, 3);



const data = JSON.stringify(topProducts);


fs.writeFile('top_products.json', data, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Top products saved to file.');
  }
  
});

return topProducts;

});
app.listen(3000, () => {
console.log('Server started on port 3000');
});