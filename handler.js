const AWS = require('aws-sdk');
const express = require('express');
const app = express();
const fs = require('fs');
const util = require('util');
const puppeteer = require('puppeteer');


const region = 'sa-east-1';
const dynamodb = new AWS.DynamoDB.DocumentClient({ region });


const tableName = 'bgc-amazon';


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

  const response = await page.goto(url, { waitUntil: 'load', timeout: 60000 });

  // Espera pelo elemento estar disponível
  await page.waitForSelector('._cDEzb_card_1L-Yx');
  console.log("encontrado");

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

    const productItems = document.querySelectorAll('.p13n-grid-content');

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
    .sort((a, b) => parseInt(a.rank.replace('#','')) - parseInt(b.rank.replace('#','')))
    .slice(0, 3)
    .map((product, index) => {
      const newProduct = {};
      newProduct.id = index + 1;
      newProduct.rank = product.rank;
      newProduct.title = product.title;
      newProduct.price = product.price;
      newProduct.url = product.url;
      return newProduct;
    });

  // Grava os produtos no DynamoDB
const promises = topProducts.map(async (product) => {
  const params = {
    TableName: tableName,
    Item: product,
  };

  try {
    await dynamodb.put(params).promise();
    console.log(`Produto ${product.title} gravado com sucesso.`);
  } catch (error) {
    console.error(`Erro ao gravar o produto ${product.title} no DynamoDB: ${error}`);
  }
});

await Promise.all(promises);

res.send(topProducts);
await browser.close();

      
      });
      
      module.exports = app;
