import { connectToDB } from "@/lib/actions/mongoose";
import { scrapeAmazonProduct } from "@/lib/actions/scraper";
import Product from "@/lib/models/product.model";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import {
  getAveragePrice,
  getEmailNotifType,
  getHighestPrice,
  getLowestPrice,
} from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    connectToDB();

    const products = await Product.find({});
    if (!products) throw new Error("No products found");

    //Scrape latest  product info & update DB
    //promise.all means: run the loops of map in parallel
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);
        if (!scrapedProduct) throw new Error("No product found");
        const updatedPriceHistory = [
          ...currentProduct.priceHistory,
          {
            price: scrapedProduct.currentPrice,
          },
        ];

        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        // Update Products in DB
        const updatedProduct = await Product.findOneAndUpdate(
          {
            url: currentProduct.url,
          },
          product
        );

        //Check product status & send email
        const emailNotificationType = getEmailNotifType(
          scrapedProduct,
          currentProduct
        );

        if (emailNotificationType && updatedProduct.users.length > 0) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
          };

          const emailContent = await generateEmailBody(
            productInfo.title,
            productInfo.url
          );
          const userEmails = updatedProduct.users.map(
            (user: any) => user.email
          );
          await sendEmail(emailContent, userEmails);
        }
        return updatedProduct;
      })
    );

    return NextResponse.json({
      message: "ok",
      data: updatedProducts,
    });
  } catch (error) {
    throw new Error(`Error in GET: ${error}`);
  }
}
