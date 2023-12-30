"use server";

import Product from "../models/product.model";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { connectToDB } from "./mongoose";
import { scrapeAmazonProduct } from "./scraper";
//redirect path
import { revalidatePath } from "next/cache";

const scrapeAndStoreProduct = async (productUrl: string) => {
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

const getAllProducts = async () => {
  try {
    connectToDB();
    const products = await Product.find();
    return products;
  } catch (err: any) {
    console.log("eeeeeeeeee getAllProducts()" + err.toString);
  }
};

const getSimilarProducts = async (productId: string) => {
  try {
    connectToDB();
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) return;
    const similarProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(3);
    return similarProducts;
  } catch (err: any) {
    console.log("eeeeeeeeee getAllProducts()" + err.toString);
  }
};

export {
  scrapeAndStoreProduct,
  getProductById,
  getAllProducts,
  getSimilarProducts,
};
