export function hasProperties(obj: any): boolean {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return true;
    }
  }

  return false;
}
