export function isError(err: unknown): err is Error {
  return err !== null
    && typeof err === 'object'
    && err.hasOwnProperty('message');
}