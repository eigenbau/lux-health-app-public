import {
  format,
  formatDistanceToNow,
  formatISO,
  getHours,
  getMinutes,
  isToday,
  isYesterday,
  parseISO,
  setHours,
  setMinutes,
} from 'date-fns';

export const numberSequence = (
  start: number = 0,
  difference: number,
  finalTerm: number
): number[] => {
  const sequence: number[] = [];
  for (let i = start; i <= finalTerm; i += difference) {
    sequence.push(i);
  }
  return sequence;
};

export const distanceToNow = (dateISOString: string): string => {
  // set minutes and hours to now, so that time of day is rendered irrelevant when calculating distance to now
  const minutes = getMinutes(new Date());
  const hours = getHours(new Date());
  const date = setMinutes(setHours(parseISO(dateISOString), hours), minutes);
  if (isToday(date)) {
    return 'today';
  }
  if (isYesterday(date)) {
    return 'yesterday';
  }
  const distanceToNowString = formatDistanceToNow(date, {
    addSuffix: true,
  });

  return distanceToNowString
    .replace(/(about|almost) /, '~')
    .replace(/(over) /, '>')
    .replace(/(day)s?/, 'd')
    .replace(/(week)s?/, 'w')
    .replace(/(month)s?/, 'm')
    .replace(/(year)s?/, 'y');
};

export const doubleDigit = (n: number) => (n < 10 ? '0' + n : '' + n);

export const formatDate = (
  dateParam: Date | string,
  formatString: string
): string => {
  const date = typeof dateParam === 'string' ? dateParam : formatISO(dateParam);
  return date ? format(parseISO(date), formatString) : '';
};
