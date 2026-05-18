export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const validateEnum = <T extends string>(
  value: string,
  enumValues: T[]
): boolean => {
  return enumValues.includes(value as T);
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};