export function isError(err: unknown): err is Error {
  return (
    err !== null && typeof err === 'object' && Object.prototype.hasOwnProperty.call(err, 'message')
  );
}
