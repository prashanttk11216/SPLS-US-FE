import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";
const phoneUtil = PhoneNumberUtil.getInstance();


export const formatPhoneNumber = (phoneNumber: string | undefined): string => {
  if (!phoneNumber) return "N/A";
  try {
    const number = phoneUtil.parse(phoneNumber, "US");
    const nationalFormat = phoneUtil.format(number, PhoneNumberFormat.NATIONAL); // Format as national
    const countryCode = `+${number.getCountryCode()}`; // Add the country code manually
    return `${countryCode} ${nationalFormat}`;
  } catch {
    return phoneNumber; // Return original if parsing fails
  }
};

export const validatePhoneNumber = (phone: string) => {
  try {
    const number = phoneUtil.parse(phone, "US");
    return phoneUtil.isValidNumber(number) || "Invalid phone number";
  } catch (error) {
    console.error("Phone parsing error:", error);
    return "Invalid phone number";
  }
};
