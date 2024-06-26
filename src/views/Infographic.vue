<script lang="ts" setup>
import { useEcharts } from "@/hooks/use-echarts";

const database = await Database.create();
const config = await Database.get<IConfig>(database, Const.DB_CONFIG, Const.DB_KEY_CONFIG);
const data = ref(await Database.get<IRecord>(database, Const.DB_RECORD, config.Y));

function group(data: any) {
  const grouped: { [type: string]: { [text: string]: any[] } } = {};

  for (const key in data.items) {
    if (data.items.hasOwnProperty(key)) {
      const item = data.items[key];
      if (item.balance) {
        item.balance.forEach((entry: any) => {
          const { type, text } = entry;
          if (!grouped[type]) {
            grouped[type] = {};
          }
          if (!grouped[type][text]) {
            grouped[type][text] = [];
          }
          grouped[type][text].push(entry);
        });
      }
    }
  }

  return grouped;
}

const calcTotalCost = (obj: any) => computed(() => {
  function recursiveSum(o: any): number {
    let total = 0;
    for (let key in o) {
      if (Array.isArray(o[key])) {
        total += o[key].reduce((sum: number, item: IBalance) => {
          return sum + (item.hasOwnProperty("cost") ? Number(item.cost) : 0);
        }, 0);
      } else if (typeof o[key] === "object" && o[key] !== null) {
        total += recursiveSum(o[key]);
      }
    }
    return total;
  }

  return recursiveSum(obj);
});

function calcLength(obj: any): number {
  function recursiveCount(o: any): number {
    let total = 0;
    for (let key in o) {
      if (Array.isArray(o[key])) {
        total += o[key].length;
      } else if (typeof o[key] === "object" && o[key] !== null) {
        total += recursiveCount(o[key]);
      }
    }
    return total;
  }

  return recursiveCount(obj);
}

const calcTotalBudget = (items: IRecord["items"]) => computed(() => {
  let total = 0;
  for (let key in items) {
    if (items.hasOwnProperty(key)) {
      total += Number(items[key].budget);
    }
  }
  return total;
});

const grouped = group(data.value);

function calcCost(balances: IBalance[]) {
  if (!balances.length) return 0;
  let total = 0;
  balances.forEach(i => (total += Number(i.cost)));
  return total;
}

const calcTotalSurplus = (items: IRecord["items"]) => computed(() => {
  const budget = calcTotalBudget(items).value;
  const outcome = calcTotalCost(grouped["支"] || []).value;
  const income = calcTotalCost(grouped["收"] || []).value;
  return budget - outcome + income;
});

const outcomeChart = ref(null);
const incomeChart = ref(null);

function formatData(data: any, max = 36) {
  const result = [];
  const entries = Object.entries(data).slice(0, max);

  for (const [key, value] of entries) {
    result.push({
      value: calcCost(value as any),
      name: key
    });
  }

  return result;
}

onMounted(() => {
  if (!config.isChart) {
    return;
  }

  if (grouped["支"]) {
    useEcharts({
      dom: outcomeChart.value,
      options: {
        legend: {
          orient: "vertical",
          left: "left",
          textStyle: {
            color: "#E5EAF3"
          }
        },
        series: [
          {
            label: {
              show: false
            },
            center: ["65%", "50%"],
            type: "pie",
            radius: "50%",
            data: formatData(grouped["支"])
          }
        ]
      }
    });
  }

  if (grouped["收"]) {
    useEcharts({
      dom: incomeChart.value,
      options: {
        legend: {
          orient: "vertical",
          left: "left",
          textStyle: {
            color: "#E5EAF3"
          }
        },
        series: [
          {
            label: {
              show: false
            },
            center: ["65%", "50%"],
            type: "pie",
            radius: "50%",
            data: formatData(grouped["收"])
          }
        ]
      }
    });
  }
});
</script>

<template>
  <div>
    <div class="mb-4">
      <div>收支统计</div>
      <div class="text-0.8rem text-text-secondary">统计 {{ config.Y }} 全年的收支情况</div>
    </div>
    <div class="mb-4 f-c-b flex-wrap">
      <div class="flex-basis-33.33% max-w-33.33%">
        <div class="text-0.8rem f-c-s">
          <div class="i-tabler-coin mr-1"></div>
          预算 ({{ Object.keys(data.items).length }})
        </div>
        <div class="text-gray text-0.8rem">{{ calcTotalBudget(data.items).value.toFixed(2) }}</div>
      </div>
      <div class="flex-basis-33.33% max-w-33.33%">
        <div class="text-0.8rem f-c-s">
          <div class="i-tabler-minus mr-1"></div>
          支出 ({{ calcLength(grouped["支"] || []) }})
        </div>
        <div class="text-red text-0.8rem">{{ calcTotalCost(grouped["支"] || []).value.toFixed(2) }}</div>
      </div>
      <div class="flex-basis-33.33% max-w-33.33%">
        <div class="text-0.8rem f-c-s">
          <div class="i-tabler-plus-minus mr-1"></div>
          剩余
        </div>
        <div class="text-gray text-0.8rem">
          {{
            calcTotalSurplus(data.items).value.toFixed(2)
          }}
        </div>
      </div>
    </div>
    <template v-if="grouped['支']">
      <div class="mb-4">
        <div>支出</div>
        <div class="text-0.8rem text-text-secondary">本年一共有 {{ Object.keys(grouped['支']).length }} 条支出</div>
      </div>
      <div class="mb-2 f-c-b flex-wrap">
        <div v-for="(v, k) in grouped['支']" class="mb-2 flex-basis-50% max-w-50%">
          <div>
            <div class="text-0.8rem">{{ k + " (" + v.length + ")" }}</div>
            <div class="text-0.8rem">{{ calcCost(v).toFixed(2) }}</div>
          </div>
        </div>
      </div>
      <div ref="outcomeChart" style="width: 90vw; height: 50vh"></div>
    </template>
    <template v-if="grouped['收']">
      <div class="mb-4">
        <div>收入</div>
        <div class="text-0.8rem text-text-secondary">本年一共有 {{ Object.keys(grouped['收']).length }} 条收入</div>
      </div>
      <div class="mb-2 f-c-b flex-wrap">
        <div v-for="(v, k) in grouped['收']" class="mb-2 flex-basis-50% max-w-50%">
          <div>
            <div class="text-0.8rem">{{ k + " (" + v.length + ")" }}</div>
            <div class="text-0.8rem">{{ calcCost(v).toFixed(2) }}</div>
          </div>
        </div>
      </div>
      <div ref="incomeChart" style="width: 90vw; height: 50vh"></div>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
