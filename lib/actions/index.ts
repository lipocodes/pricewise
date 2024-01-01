"use server";

import { User } from "@/types";
import Product from "../models/product.model";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { connectToDB } from "./mongoose";
import { scrapeAmazonProduct } from "./scraper";
//redirect path
import { revalidatePath } from "next/cache";
import { generateEmailBody } from "../nodemailer";
import { sendEmail } from "./../nodemailer/index";

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

const addUserEmailToProduct = async (productId: string, userEmail: string) => {
  try {
    //send our first email
    const product = await Product.findById(productId);
    if (!product) return;
    const userExists = product.users.some(
      (user: User) => user.email === userEmail
    );
    if (!userExists) {
      product.users.push(userEmail);
      product.save();
      {
        /* in lib/nodemailer.index.ts  */
      }
      const emailContent = await generateEmailBody(product, "WELCOME");
      await sendEmail(emailContent, [userEmail]);
    }
  } catch (err) {
    console.log("eeeeeeeeeeee=" + err);
  }
};

export {
  scrapeAndStoreProduct,
  getProductById,
  getAllProducts,
  getSimilarProducts,
  addUserEmailToProduct,
  sendEmail,
};
