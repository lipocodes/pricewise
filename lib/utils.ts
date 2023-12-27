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

export { extractPrice, extractCurrency, extractDescription };
