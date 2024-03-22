import { getCurrM, getCurrY } from "@/utils";

export function getStorage() {
  return useStorage<IStorageData>("ledger-data", { comments: [], record: {}, viewdDate: {} });
}

/**
 * 安全获取记录，若不存在该记录就创建该记录，通常在第一次进入应用没有存储数据的时候使用该函数。
 */
export function safetyR(record: IRecord, currY: string | number, currM: string) {
  try {
    record[currY][currM];
  } catch (e) {
    record[currY] = {
      [currM]: {
        budget: 0,
        surplus: 0,
        items: []
      }
    };
  }
}

/**
 * 获取去年最后一个月的结余，若没有则返回 0。
 */
export function getPrevYEndRSurplus(record: IRecord, currY: string) {
  const prevY = Number(currY) - 1;
  const prevMs = record[prevY] ? Object.keys(record[prevY]) : [];

  if (prevMs.length > 0) {
    const prevYEndM = prevMs[prevMs.length - 1];
    const prevYEndR = getR(record, prevY, prevYEndM);
    return prevYEndR.surplus;
  } else {
    return 0;
  }
}

/**
 * 若没有去年最后一个月，返回0，否则返回最后一个月
 */
export function getPrevYEndR(record: IRecord, currY: string) {
  const prevY = Number(currY) - 1;
  const prevYMs = record[prevY] ? Object.keys(record[prevY]) : [];

  if (prevYMs.length > 0) {
    const prevYEndM = prevYMs[prevYMs.length - 1];
    const prevYEndR = getR(record, prevY, prevYEndM);
    return prevYEndR;
  } else {
    return null;
  }
}

/**
 * 获取指定年、指定月的账单
 */
export function getR(record: IRecord, currY: string | number, currM: string) {
  safetyR(record, currY, currM);
  return record[currY][currM];
}

/**
 * 获取当月的支出
 */
export function getOutcome(record: IRecord, currY: string, currM: string) {
  return (
    getR(record, currY, currM)
      ?.items?.filter(i => i.type === "支")
      ?.reduce((accumulator, currentValue) => accumulator + Number(currentValue.cost), 0) || 0
  );
}

/**
 * 获取上个月的支出
 */
export function getPrevOutcome(record: IRecord, currY: string, currM: string, MList: string[]) {
  return (
    getPrevR(record, currY, MList, currM)
      ?.items?.filter(i => i.type === "支")
      ?.reduce((accumulator, currentValue) => accumulator + Number(currentValue.cost), 0) || 0
  );
}

/**
 * 获取当月的收入
 */
export function getIncome(record: IRecord, currY: string, currM: string) {
  return (
    getR(record, currY, currM)
      ?.items?.filter(i => i.type === "收")
      ?.reduce((accumulator, currentValue) => accumulator + Number(currentValue.cost), 0) || 0
  );
}

/**
 * 获取指定年所有月的索引
 */
export function getMs(record: IRecord, currY: string | number) {
  return record[currY] ? Object.keys(record[currY]) : [getCurrM()];
}

/**
 * 获取所有年的索引
 */
export function getYs(record: IRecord) {
  return record ? Object.keys(record) : [getCurrY()];
}

/**
 * 判断指定月是不是第一个月
 */
export function isHeadM(mList: string[], currM: string) {
  return mList.indexOf(currM) === 0;
}

/**
 * 获取指定月的上一个月的账单
 */
export function getPrevR(record: IRecord, currY: string, MList: string[], currM: string) {
  const isCurrName = MList.findIndex(m => m == currM);
  if (isCurrName != -1) {
    return record[currY][MList[isCurrName - 1]];
  } else return null;
}

/**
 * 获取当年当月的剩余金额（包括上月结余）
 * @returns 返回计算的当年当月的剩余金额（+上月结余）
 */
export function getSurplusOfR(record: IRecord, currY: string, currK: string) {
  let surplus = 0;
  const currYMs = getMs(record, currY);
  const currR = getR(record, currY, currK);
  const currOutcome = getOutcome(record, currY, currK);
  const currIncome = getIncome(record, currY, currK);

  if (isHeadM(currYMs, currK)) {
    surplus = Number(currR.budget) - currOutcome + currIncome + getPrevYEndRSurplus(record, currY);
  } else {
    const prevR = getPrevR(record, currY, currYMs, currK);
    if (prevR && currR) {
      surplus = Number(currR.budget) - currOutcome + currIncome + Number(prevR.surplus);
    }
  }

  return Number(surplus.toFixed(2));
}

/**
 * 计算本月较与上月的支出占比，体现出本月支出上升多少或下降多少的百分比
 *
 * @TODO 需要考虑好本年第一个月和去年最后一个月的计算
 */
export function getSpendingIncreasesPercentage(record: IRecord, currY: string, currK: string) {
  const currMs = getMs(record, currY);
  let currROutcome = 0,
    prevROutcome = 0;
  currROutcome = getOutcome(record, currY, currK);

  if (isHeadM(currMs, currK)) {
    const has = getPrevYEndR(record, currY);
    if (has) {
      let total = 0;
      has.items?.forEach(i => {
        if (i.type === "支") {
          total += Number(i.cost);
        }
      });
      return total;
    } else {
      prevROutcome = 0;
    }
  } else {
    prevROutcome = getPrevOutcome(record, currY, currK, currMs);
  }
  return prevROutcome ? ((currROutcome - prevROutcome) / prevROutcome) * 100 : 0;
}

/**
 * 当前的月是否已经存在于所有月份中
 */
export function isIn(ms: string[], m: string) {
  return ms?.includes(m) || false;
}

/**
 * 设置月账单
 */
export async function setR(record: IRecord, currY: string, currM: string, data: IMonth) {
  if (record[currY]) {
    const currMs = getMs(record, currY);
    if (!isIn(currMs, currM)) {
      record[currY][currM] = data;
      return;
    } else {
      throw new Error("已有该月记录！");
    }
  } else {
    record[currY] = {
      [currM]: data
    };
    return;
  }
}

/**
 * 设置上一次预览日期
 */
export function setViewdDate(storage: IStorageData, currY: string, currM: string) {
  storage.viewdDate = { year: currY, month: currM };
}
