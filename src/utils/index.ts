export function getCurrY(date?: Date) {
  if (date) {
    return date.getFullYear().toString();
  } else {
    return new Date().getFullYear().toString();
  }
}

export function getCurrM(date?: Date) {
  if (date) {
    return (date.getMonth() + 1).toString();
  } else {
    return (new Date().getMonth() + 1).toString();
  }
}
