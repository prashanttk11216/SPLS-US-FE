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
