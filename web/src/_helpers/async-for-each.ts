type asyncFn<T, R> = (elem: T, index: number, array: T[]) => Promise<R>;

function noop<T>(result: T) {
  return result;
}

export async function asyncForEach<T, R>(arr: Array<T>, callback: asyncFn<T, R>) {
  return asyncMap(arr, callback).then(noop);
}

export async function asyncMap<T, R>(arr: Array<T>, callback: asyncFn<T, R>) {
  return Promise.all(arr.map(callback));
}