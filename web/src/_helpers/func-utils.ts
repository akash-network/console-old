export const prop =
  <T>(name: keyof T) =>
  (x: T) =>
    x[name];
