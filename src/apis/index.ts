export function getStorageData() {
  return useStorage<IStorageData>("ledger-data", { comments: [], record: {}, viewdDate: {} });
}

/**
 * 确保存在当月记录
 */
export function ensureHasCurrR(record: IRecord, currY: string, currM: string) {
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
 * 若没有去年最后一个月的结余，返回0，否则返回实际结余
 */
export function ensureHasPrevYLastRSurplus(record: IRecord, currY: string) {
  const prevY = Number(currY) - 1 + "";
  const prevYMs = getCurrYMs(record, prevY);

  if (prevYMs && prevYMs.length) {
    const prevYEndName = prevYMs[prevYMs.length - 1];
    const prevYEndR = getR(record, prevY, prevYEndName);
    return prevYEndR.surplus;
  } else {
    return 0;
  }
}

/**
 * 若没有去年最后一个月，返回0，否则返回最后一个月
 */
export function ensureHasPrevYLastR(record: IRecord, currY: string) {
  const prevY = Number(currY) - 1 + "";
  const prevYMs = getCurrYMs(record, prevY);

  if (prevYMs && prevYMs.length) {
    const prevYEndName = prevYMs[prevYMs.length - 1];
    const prevYEndR = getR(record, prevY, prevYEndName);
    return prevYEndR;
  } else {
    return null;
  }
}

export function ensureHasPrevYLastROutcome(record: IRecord, currY: string) {
  const prevY = Number(currY) - 1 + "";
  const prevYMs = getCurrYMs(record, prevY);

  if (prevYMs && prevYMs.length) {
  } else {
    return 0;
  }
}

/**
 * 获取指定年、指定月的账单
 */
export function getR(record: IRecord, currY: string, currM: string) {
  ensureHasCurrR(record, currY, currM);
  return record[currY][currM];
}

/**
 * 获取当月的总支出
 */
export function getOutcome(record: IRecord, currY: string, currM: string) {
  let total = 0;

  getR(record, currY, currM)?.items?.forEach(i => {
    if (i.type === "支") {
      total += Number(i.cost);
    }
  });

  return total;
}

/**
 * 获取当月的总收入
 */
export function getIncome(record: IRecord, currY: string, currM: string) {
  let total = 0;

  getR(record, currY, currM)?.items?.forEach(i => {
    if (i.type === "收") {
      total += Number(i.cost);
    }
  });

  return total;
}

export function getPrevOutcome(record: IRecord, currY: string, currK: string, allK: string[]) {
  let total = 0;

  getPrevR(record, currY, allK, currK)?.items?.forEach(i => {
    if (i.type === "支") {
      total += Number(i.cost);
    }
  });

  return total;
}

/**
 * 获取指定年所有月的索引值
 */
export function getCurrYMs(record: IRecord, currY: string) {
  return Object.keys(record[currY] || []);
}

/**
 * 判断指定月是不是第一个月
 */
export function isHeadM(keys: string[], names: string) {
  let isFirst = false;

  keys.forEach((i, idx) => {
    if (names == i && idx == 0) {
      isFirst = true;
    }
  });

  return isFirst;
}

/**
 * 获取指定月的上一个月的账单
 */
export function getPrevR(
  record: IRecord,
  currY: string,
  allK: string[],
  currK: string
): IMonth | null {
  const isCurrName = allK.findIndex(name => name == currK);
  if (isCurrName != -1) {
    return record[currY][allK[isCurrName - 1]];
  } else return null;
}

/**
 * 获取当年当月的剩余金额（包括上月结余）
 * @returns 返回计算的当年当月的剩余金额（+上月结余）
 */
export function getSurplusOfCurrR(record: IRecord, currY: string, currK: string) {
  let surplus = 0;
  const currYMs = getCurrYMs(record, currY);
  const currR = getR(record, currY, currK);
  const currOutcome = getOutcome(record, currY, currK);
  const currIncome = getIncome(record, currY, currK);

  if (isHeadM(currYMs, currK)) {
    surplus =
      Number(currR.budget) - currOutcome + currIncome + ensureHasPrevYLastRSurplus(record, currY);
  } else {
    const prevR = getPrevR(record, currY, currYMs, currK);
    if (prevR && currR) {
      surplus = Number(currR.budget) - currOutcome + currIncome + Number(prevR.surplus);
    }
  }

  surplus = Number(surplus.toFixed(2));
  currR.surplus = surplus;

  return surplus;
}

export function getSpendingIncreasesPercentage(record: IRecord, currY: string, currK: string) {
  const currYMs = getCurrYMs(record, currY);
  let currROutcome = 0,
    prevROutcome = 0;
  currROutcome = getOutcome(record, currY, currK);

  if (isHeadM(currYMs, currK)) {
    const has = ensureHasPrevYLastR(record, currY);
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
    prevROutcome = getPrevOutcome(record, currY, currK, currYMs);
  }
  return prevROutcome ? ((currROutcome - prevROutcome) / prevROutcome) * 100 : 0;
}

/**
 * 当前的月是否已经存在于所有月份中
 */
export function hasExistInK(keys: string[], names: string): boolean {
  let isExist = false;

  keys?.forEach(n => {
    if (names == n) {
      isExist = true;
    }
  });

  return isExist;
}

/**
 * 设置月账单
 */
export function setR(record: IRecord, currY: string, currM: string, data: IMonth) {
  return new Promise((resolve, reject) => {
    if (record[currY]) {
      const currYMs = getCurrYMs(record, currY);
      if (!hasExistInK(currYMs, currM)) {
        record[currY][currM] = data;
        resolve("");
      } else {
        reject("");
      }
    } else {
      record[currY] = {
        [currM]: data
      };
      resolve("");
    }
  });
}

/**
 * 设置上一次预览的月账单
 */
export function setLastViewdDate(currY: string, currM: string) {
  getStorageData().value.viewdDate = {
    year: currY,
    month: currM
  };
}

export function getSpendingOfCurrM(record: IRecord, currY: string, currM: string) {
  const m = record[currY][currM];
  let costs = 0;

  if (m?.items) {
    m.items.map(i => {
      if (i.type === "支") {
        costs += Number(i.cost);
      }
    });
  }

  return costs;
}
