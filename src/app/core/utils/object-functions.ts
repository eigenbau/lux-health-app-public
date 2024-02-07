export const isObject = <T>(object: unknown): object is T =>
  typeof object === 'object' && !Array.isArray(object) && object !== null
    ? true
    : false;

export const objectHasKeys = <T = { [key: string]: unknown }>(
  object: T | undefined,
  keys: string[],
): object is T => {
  if (!isObject(object)) {
    return false;
  }
  const o = object as object;
  return keys.every((key) => Object.keys(o).includes(key));
};

export const sortByString = <T extends unknown[]>(
  array: T,
  sortByPath: (string | number)[],
): T => {
  const sortedArray = [...array];
  return sortedArray.sort((a, b) => {
    const valueA = objectProperty(sortByPath, a);
    const valueB = objectProperty(sortByPath, b);

    if (typeof valueA === 'string' && typeof valueB == 'string') {
      return valueA.toLowerCase() < valueB.toLowerCase()
        ? -1
        : valueA.toLowerCase() > valueB.toLowerCase()
          ? 1
          : 0;
    }
    throw new Error(`value at path is not a string in "sortByString"`);
  }) as T;
};

export const sortByInt = <T extends unknown[]>(
  array: T,
  sortByPath: (string | number)[],
): T => {
  if (!array || array.length === 0 || !sortByPath || sortByPath.length === 0) {
    return array;
  }
  const sortedArray = [...array];
  return sortedArray.sort(
    (a, b) =>
      +objectProperty<number | string>(sortByPath, a) -
      +objectProperty<number | string>(sortByPath, b),
  ) as T;
};

export const updateObjectValue = <T extends { [key: string]: unknown }>(
  object: T,
  value: string | number,
  propPath: (string | number)[],
): T => {
  const mutatedObject = { ...object };
  updateObjectValueRecursion(mutatedObject, value, propPath);
  return mutatedObject;
};

export const filterByString = <T extends object>(
  arr: T[],
  propPath: (string | number)[],
  filter: string | null | undefined,
): T[] => {
  const filterString = filter ?? '';
  return arr.filter((item) => {
    const value = objectProperty<any>(propPath, item).toString();
    return value.toUpperCase().indexOf(filterString.toUpperCase()) > -1;
  });
};

export const filterByArray = <T extends { [key: string]: unknown }>(
  arr: T[],
  propPath: (string | number)[],
  filterArray: string[],
): T[] => {
  const filterString = filterArray.join().toUpperCase();
  return arr.filter((item) => {
    const value = objectProperty<[]>(propPath, item).toString().toUpperCase();
    return filterString.indexOf(value) > -1;
  });
};

export const objectProperty = <T>(
  path: (string | number)[],
  object: unknown,
): T => {
  if (!arrayHasValue(path)) {
    return object as T;
  }
  return path.reduce(
    (xs: any, x) => (xs && x in xs ? xs[x] : null),
    object,
  ) as T;
};

export const arrayHasValue = <T>(
  arr: T[] | undefined[] | undefined | null,
): arr is T[] =>
  Array.isArray(arr) &&
  arr.length > 0 &&
  !arr.some((item) => item === undefined);

export const arrayHasIndex = <T extends unknown[]>(
  arr: T | undefined[] | undefined | null,
  index: number,
): arr is T => {
  if (!arrayHasValue(arr)) {
    return false;
  }
  return arr[index] === undefined ? false : true;
};

export const reduceToUniqueArray = <T extends object>(
  array: T[],
  propPath: (string | number)[],
): T[] => {
  if (!arrayHasValue(array)) {
    [];
  }

  const filteredArray: T[] = array.reduce(
    (uniqueEntries: T[], newEntry) =>
      uniqueEntries.some(
        (entry) =>
          objectProperty(propPath, entry) ===
          objectProperty(propPath, newEntry),
      )
        ? uniqueEntries
        : [...uniqueEntries, newEntry],
    [],
  );

  return filteredArray;
};

// Private functions
const updateObjectValueRecursion = (
  object: { [key: string]: any },
  value: string | number,
  propPath: (string | number)[],
): void => {
  const [head, ...rest] = propPath;

  if (!rest.length) {
    object[head] = value;
    return;
  }
  updateObjectValueRecursion(object[head], value, rest);
};
