export function generateDate() {
  const date = new Date();
  return {
    y: String(date.getFullYear()),
    m: String(date.getMonth() + 1).padStart(2, "0"),
    d: String(date.getDate()).padStart(2, "0"),
    h: String(date.getHours()).padStart(2, "0"),
    minute: String(date.getMinutes()).padStart(2, "0"),
    second: String(date.getSeconds()).padStart(2, "0")
  };
}

export function getCurrY(date?: Date) {
  return (date ? date : new Date()).getFullYear().toString();
}

export function getCurrM(date?: Date) {
  const month = date ? date.getMonth() : new Date().getMonth();
  return (month + 1).toString();
}
