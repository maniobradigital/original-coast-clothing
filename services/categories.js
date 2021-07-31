/**
 * Copyright 2019-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger For Original Coast Clothing
 * https://developers.facebook.com/docs/messenger-platform/getting-started/sample-apps/original-coast-clothing
 */

"use strict";
const p = require('puppeteer');
const { shopUrl } = require('./config');

// Imports dependencies
const Response = require("./response"),
  config = require("./config"),
  i18n = require("../i18n.config");

module.exports = class Categories {
  constructor(user, webhookEvent) {
    this.user = user;
    this.webhookEvent = webhookEvent;
  }

   async handlePayload(payload) {
    let response;
    let outfit;

    switch (payload) {
      case "CATEGORIES":
        response = Response.genQuickReply(i18n.__("categories.prompt"), [
          {
            title: i18n.__("categories.computers"),
            payload: "CATEGORIES_COMPUTERS"
          },
          {
            title: i18n.__("categories.electronics"),
            payload: "CATEGORIES_ELECTRONICS"
          },
          {
            title: i18n.__("categories.apparel"),
            payload: "CATEGORIES_APPAREL"
          },
          {
            title: i18n.__("categories.digital_downloads"),
            payload: "CATEGORIES_DIGITALDOWNLOADS"
          },
          {
            title: i18n.__("categories.books"),
            payload: "CATEGORIES_BOOKS"
          },
          {
            title: i18n.__("categories.jewelry"),
            payload: "CATEGORIES_JEWELRY"
          },
          {
            title: i18n.__("categories.gift_cards"),
            payload: "CATEGORIES_GIFTCARDS"
          }
        ]);
        break;

      case "CATEGORIES_COMPUTERS":
        response = Response.genQuickReply(i18n.__("categories.subcategory"), [
          {
            title: i18n.__("subcategories.desktops.title"),
            payload: "CATEGORIES_COMPUTERS_DESKTOP"
          },
          {
            title: i18n.__("subcategories.notebooks.title"),
            payload: "SUBCATEGORY_NOTEBOOKS"
          },
          {
            title: i18n.__("subcategories.software.title"),
            payload: "SUBCATEGORY_SOFTWARE"
          }
        ]);
        break;

      case "CATEGORIES_COMPUTERS_DESKTOP":
        const result = await (async()=>{
          const browser = await p.launch({ headless:true });
          const page = await browser.newPage();
          await page.goto(`${shopUrl}desktops`, { waitUntil:'domcontentloaded' });
          // Categories
          const products = await page.evaluate(()=>{
              const elements = document.querySelectorAll('div.product-item');
              
              const objects = [];
              elements.forEach((element)=>{
                  const object = {}; 
                  object.title = element.querySelector('div.product-item div.details h2 a').text;
                  object.url = element.querySelector('div.product-item div.picture a').href;
                  object.price = element.querySelector('div.product-item div.details div.add-info div.prices span').innerText;
                  object.img = element.querySelector('div.product-item div.picture a img').src;
                  objects.push(object); 
              });
              return objects;
          });
          console.log(products[0].url);
          let buttons = [
            Response.genWebUrlButton(
              i18n.__("products.details"),
              products[0].url
            ),
            Response.genPostbackButton(
              i18n.__("curation.show"),
              "CURATION_OTHER_STYLE"
            ),
            Response.genPostbackButton(
              i18n.__("curation.sales"), 
              "CARE_SALES"
            )
          ];
          
          let model = Response.genGenericTemplate(
            products[0].img,
            products[0].price,
            products[0].title,
            buttons
          );
          browser.close();
          //console.log('model',model);
          return model;
        })();
        response = result;
        break;
    }
    console.log('categories.response', response);
    return response;
  }
};