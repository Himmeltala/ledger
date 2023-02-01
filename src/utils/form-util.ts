import type { FormInstance } from "element-plus";

export const formValidator = async (
  formEl: FormInstance | undefined,
  success?: Function,
  error?: Function
) => {
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      success && success();
    } else {
      error && error();
    }
  });
};

export const validateMoney = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error("请输入正确格式的金额！"));
  }
  setTimeout(() => {
    const numLen = value.toString().length;
    if (!(numLen >= 1 && numLen <= 20)) {
      callback(new Error("金额在 1~9 位数！"));
    } else {
      callback();
    }
  }, 20);
};
