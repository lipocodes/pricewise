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

export { extractPrice, extractCurrency };
