export const flattenObject = (oldObject: any) => {
  const newObject = {};

  flattenHelper(oldObject, newObject, '');

  return newObject;

  function flattenHelper(currentObject: any, newObject: any, previousKeyName: string) {
    for (const key in currentObject) {
      const value = currentObject[key];

      if (value.constructor !== Object) {
        if (previousKeyName == null || previousKeyName === '') {
          newObject[key] = value;
        } else {
          if (key == null || key === '') {
            newObject[previousKeyName] = value;
          } else {
            newObject[previousKeyName + '.' + key] = value;
          }
        }
      } else {
        if (previousKeyName == null || previousKeyName === '') {
          flattenHelper(value, newObject, key);
        } else {
          flattenHelper(value, newObject, previousKeyName + '.' + key);
        }
      }
    }
  }
};
