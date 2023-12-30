import { PriceHistoryItem, Product } from "@/types";

//...elements refers to: unknown #params
const extractPrice = (...elements: any) => {
  for (const element of elements) {
    const priceText = element.text().trim();
    //all non numeric or dots chars are removed
    if (priceText) return priceText.replace(/[^\d.]/g, "");
  }
  return "";
};

const extractCurrency = (element: any) => {
  const currencyText = element.text().trim().slice(0, 1);
  return currencyText ? currencyText : "";
};

const extractDescription = ($: any) => {
  // these are possible elements holding description of the product
  const selectors = [
    ".a-unordered-list .a-list-item",
    ".a-expander-content p",
    // Add more selectors here if needed
  ];

  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      const textContent = elements
        .map((_: any, element: any) => $(element).text().trim())
        .get()
        .join("\n");
      return textContent;
    }
  }

  // If no matching elements were found, return an empty string
  return "";
};

const getHighestPrice = (priceList: PriceHistoryItem[]) => {
  let highestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price > highestPrice.price) {
      highestPrice = priceList[i];
    }
  }

  return highestPrice.price;
};

const getLowestPrice = (priceList: PriceHistoryItem[]) => {
  let lowestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price < lowestPrice.price) {
      lowestPrice = priceList[i];
    }
  }

  return lowestPrice.price;
};

const getAveragePrice = (priceList: PriceHistoryItem[]) => {
  const sumOfPrices = priceList.reduce((acc, curr) => acc + curr.price, 0);
  const averagePrice = sumOfPrices / priceList.length || 0;

  return averagePrice;
};

const formatNumber = (num: number = 0) => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export {
  extractPrice,
  extractCurrency,
  extractDescription,
  getLowestPrice,
  getHighestPrice,
  getAveragePrice,
  formatNumber,
};
