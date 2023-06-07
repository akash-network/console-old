import React from 'react';

export function update<T>(transform: (input: string) => T) {
  return (callback: (input: T) => void) =>
    <E extends { value: string }>(event: React.ChangeEvent<E>) =>
      callback(transform((event.target as E).value));
}

export const updateInt = update(parseInt);
export const updateStr = update((x) => x);
