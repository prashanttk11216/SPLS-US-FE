export const formatNumber = (
  value: number | string,
  locale: string = "en-US",
  numberFormatOptions: Intl.NumberFormatOptions = {}
): string => {
  if (value === undefined || value === null || value === "") return "";

  const number =
    typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;

  if (isNaN(number)) return value.toString();

  return new Intl.NumberFormat(locale, numberFormatOptions).format(number);
};
