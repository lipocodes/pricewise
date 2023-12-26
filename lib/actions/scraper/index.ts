//npm install axios cheerio
import { extractPrice } from "@/lib/utils";
import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeAmazonProduct(url: string) {
  if (!url) return;
  //Brightdata proxy configuration
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;
  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: "brd.superproxy.io",
    port,
    rejectUnauthorized: false,
  };

  try {
    //Fetch the product page
    const response = await axios.get(url, options);
    //using cheerio var
    const $ = cheerio.load(response.data);
    //extract product title
    const title = $("#productTitle").text().trim();
    const currentPrice = extractPrice(
      $(".priceToPay span.a-price-whole"),
      $("a.size.base.a-color-price"),
      $(".a-button-selected .a-color-base"),
      $(".a-price.a-text-price") //element whose class is both a-price & a-text-price
    );

    const originalPrice = extractPrice(
      $("#priceBlock_ourprice"),
      $(".a-price.a-text-price span.a-offscreen"),
      $("#listPrice"),
      $("#priceblock_dealprice"),
      $(".a-size-base.a-color-price")
    );

    console.log({ title, currentPrice, originalPrice });
  } catch (err: any) {
    throw new Error(`Can't scrape product: ${err}`);
  }
}
