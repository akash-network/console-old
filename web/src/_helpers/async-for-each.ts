type asyncFn<T, R> = (elem: T, index: number, array: T[]) => Promise<R>;

export async function asyncForEach<T, R>(arr: Array<T>, callback: asyncFn<T, R>) {
  return asyncMap(arr, callback).then(() => { });
}

export async function asyncMap<T, R>(arr: Array<T>, callback: asyncFn<T, R>) {
  return Promise.all(arr.map(callback));
}