export function generateDate() {
  const date = new Date();
  return {
    year: date.getFullYear().toString(),
    month: (date.getMonth() + 1).toString(),
    day: date.getDate().toString(),
    hour: date.getHours().toString(),
    minute: date.getMinutes().toString(),
    second: date.getSeconds().toString()
  };
}

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
