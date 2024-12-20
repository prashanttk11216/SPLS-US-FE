// Utility to truncate text
export const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

export const filterObjectKeys = <T, K extends keyof T>(data: Partial<T>, keys: K[]) => {
    return Object.fromEntries(
      keys.map((key) => [key, data[key]])
    ) as Pick<T, K>;
};