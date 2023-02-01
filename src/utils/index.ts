export function getCurrYear(date?: Date) {
  if (date) {
    return date.getFullYear().toString();
  } else {
    return new Date().getFullYear().toString();
  }
}

export function getCurrMonth(date?: Date) {
  if (date) {
    return (date.getMonth() + 1).toString();
  } else {
    return (new Date().getMonth() + 1).toString();
  }
}
