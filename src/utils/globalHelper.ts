import { VALIDATION_MESSAGES } from "../constants/messages";

// Utility to truncate text
export const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

export const filterObjectKeys = <T, K extends keyof T>(data: Partial<T>, keys: K[]) => {
    return Object.fromEntries(
      keys.map((key) => [key, data[key]])
    ) as Pick<T, K>;
};


// helpers/getInitials.ts
export const getInitials = ({
  firstName = "",
  lastName = "",
  email = "",
}: {
  firstName?: string;
  lastName?: string;
  email?: string;
}): string => {
  // Trim and ensure proper casing
  const cleanFirstName = firstName.trim();
  const cleanLastName = lastName.trim();
  const cleanEmail = email.trim();

  if (cleanFirstName && cleanLastName) {
    return `${cleanFirstName[0]}${cleanLastName[0]}`.toUpperCase();
  } else if (cleanFirstName) {
    return cleanFirstName[0].toUpperCase();
  } else if (cleanEmail) {
    return cleanEmail[0].toUpperCase();
  }

  return "";
};


export const calculatePercentage = (value: number, percentage: number) => (percentage / 100) * value;
export const calculatePercentageByUnit = (value: number, percentage: number, unit: number) => (percentage / 100) * (value * unit);

export const downloadFile = (
  blob: Blob,
  fileName: string = 'downloaded-file'
): void => {
  try {
    // Create a URL for the Blob
    const urlBlob = window.URL.createObjectURL(blob);

    // Create and trigger a temporary anchor element
    const anchor = document.createElement('a');
    anchor.href = urlBlob;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();

    // Cleanup
    anchor.remove();
    window.URL.revokeObjectURL(urlBlob);
  } catch (error) {
    console.error('Error during file download:', error);
  }
};



export const getEnumValue = <T extends Record<string, string | number>>(
  enumObj: T,
  key: string | undefined
): string => {
  if (key && (key in enumObj)) {
    const value = enumObj[key as keyof T];
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
  }
  return "N/A";
};



export const dateTimeOptions ={
  showTimeSelectOnly: true,
  timeCaption: "Time",
  showTimeSelect: true,
  dateFormat: "h:mm aa",
  timeIntervals: 15,
}


export const validateLocation = (value: any): boolean | string => {
  return value?.str && value?.lat && value?.lng 
    ? true 
    : VALIDATION_MESSAGES.locationInvalid;
};
