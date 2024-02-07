export const toCamelCase = (text: string) =>
  text
    .replace(/(^[A-Z])/g, (v) => v.toLowerCase()) // first letter to lower case
    .replace(/-\w/g, clearAndUpper);

export const toPascalCase = (text: string) =>
  text.replace(/(^\w|-\w)/g, clearAndUpper);

export const clearAndUpper = (text: string) =>
  text.replace(/-/, '').toUpperCase();

export const capitalize = (s: string) => {
  if (typeof s !== 'string') {
    return '';
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const acronym = (str: string) => {
  const matches = str.match(/\b(\w)/g);
  return !matches ? '' : matches.join('').toUpperCase();
};

export const capitalizeAllWords = (s: string): string => {
  const words = s.split(' ');
  return words.map((word) => capitalize(word)).join(' ');
};

export const toDashed = (s: string): string =>
  s.replace(/\B[A-Z]/g, (m) => '-' + m).toLowerCase();

export const isNonEmptyString = (input: unknown): input is string =>
  typeof input === 'string' && input.trim().length > 0;
