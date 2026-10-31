export function isClientError(statusCode?: number): boolean {
  return !!statusCode && statusCode >= 400 && statusCode < 500;
}
