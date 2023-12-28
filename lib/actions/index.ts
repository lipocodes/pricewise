"use server";

import Product from "../models/product.model";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { connectToDB } from "./mongoose";
import { scrapeAmazonProduct } from "./scraper";
//redirect path
import { revalidatePath } from "next/cache";

const scrapeAndStoreProduct = (productUrl: string) => {
  if (!productUrl) return;

  try {
    connectToDB();

    const scrapedProduct = await scrapeAmazonProduct(productUrl);
    if (!scrapedProduct) return;

    let product = scrapedProduct;
    const existingProduct = await Product.findOne({ url: productUrl });
    if (existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice },
      ];

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: productUrl },
      product,
      { upsert: true, new: true } //id non-existent, create one
    );

    //redirect path
    revalidatePath(`/products/${newProduct._id}`);
  } catch (err: any) {
    throw new Error(`Failed to create/update product: ${err}`);
  }
};

const getProductById = async (productId: string) => {
  try {
    connectToDB();
    const product = await Product.findOne({ _id: productId });
    if (!product) return null;
    return product;
  } catch (error) {
    console.log("eeeeeeeeeeeee=" + error);
  }
};

export { scrapeAndStoreProduct, getProductById };
