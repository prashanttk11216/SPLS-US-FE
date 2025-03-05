import { PhoneNumberUtil } from "google-libphonenumber";

const phoneUtil = PhoneNumberUtil.getInstance();

export const validatePhoneNumber = (phone: string) => {
  try {
    const number = phoneUtil.parse(phone, "US");
    return phoneUtil.isValidNumber(number) || "Invalid phone number";
  } catch (error) {
    console.error("Phone parsing error:", error);
    return "Invalid phone number";
  }
};
