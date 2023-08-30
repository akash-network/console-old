type AsyncFunction = (...params: any[]) => Promise<any>;
type AsyncMapFunction<T, R> = (elem: T, index: number, array: T[]) => Promise<R>;
type ErrorHandler = (e: any) => void;

function noop<T>(result: T) {
  return result;
}

export async function asyncForEach<T, R>(arr: Array<T>, callback: AsyncMapFunction<T, R>) {
  return asyncMap(arr, callback).then(noop);
}

export async function asyncMap<T, R>(arr: Array<T>, callback: AsyncMapFunction<T, R>) {
  return Promise.all(arr.map(callback));
}

/**
 * Wrapper for setTimeout that returns a promise.
 * 
 * @param timeout The delay in milliseconds
 * @param action The function to call after the delay
 * 
 * @returns Promise that resolves after the delay
 */
export function schedule<TFn extends AsyncFunction>(timeout: number, action: TFn) {
  return new Promise<ReturnType<TFn>>((resolve, reject) => {
    const fire = () => action().then(resolve, reject);
    setTimeout(fire, timeout);
  });
}

/**
 * Returns a function that will accept an error, call the notify function
 * with that error, and then schedule a retry using the provided function.
 * 
 * @param fn The function to call after the delay
 * @param delay The delay between catch the error and retrying
 * @param notify A function to pass the captured error too
 * 
 * @returns A function suitable for use as an error handler
 */
function retryHandler(fn: any, delay: number, notify: ErrorHandler) {
  const attempt = () => fn();

  return (e: any) => {
    notify(e);
    return schedule(delay, attempt);
  };
}

/**
 * Schedule retries for a function that returns a promise.
 * 
 * @param attempt Function that returns a promise
 * @param delays Array of delays between retries
 * @param notify Function to call with the error (optional)
 * 
 * @returns New that will only fail if all retries fail
 */
export function retry(attempt: any, delays: number[], notify = noop) {
  const addRetry = (promise: Promise<any>, delay: number) => (
    promise.catch(retryHandler(attempt, delay, notify))
  );

  return delays.reduce(addRetry, attempt());
}
