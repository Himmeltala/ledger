export function generateDate() {
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString();
  const day = date.getDate().toString();
  const hour = date.getHours().toString();
  const minute = date.getMinutes().toString();
  const second = date.getSeconds().toString();
  return {
    year,
    month,
    day,
    hour,
    minute,
    second
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
