//...elements refers to: unknown #params
const extractPrice = (...elements: any) => {
  for (const element of elements) {
    const priceText = element.text().trim();
    //all non numeric or dots chars are removed
    if (priceText) return priceText.replace(/[^0-9.]/g, "");
  }
  return "";
};

export { extractPrice };
