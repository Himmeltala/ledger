<script setup lang="ts">
import { useEcharts } from "@/hooks/use-echarts";
import { getStorageData, getCurrYMs } from "@/apis";
import { getCurrYear } from "@/utils";

const storage = getStorageData();
const currYear = ref(getCurrYear());
const recordChartRef = shallowRef();

function init() {
  const viewdDate = getStorageData().value.viewdDate;
  currYear.value = viewdDate.year;

  const currRecord = storage.value.record[currYear.value];
  const seriesData = [];
  for (let key in currRecord) {
    let costs = 0;

    currRecord[key].items?.map(i => {
      if (i.type === "支") {
        costs += Number(i.cost);
      }
    });

    seriesData.push(costs);
  }

  const xAxisData = getCurrYMs(storage.value.record, currYear.value);

  useEcharts({
    dom: recordChartRef.value,
    options: {
      dataZoom: [
        {
          type: "slider", // 使用滑动条型式
          show: true, // 显示滑动条
          start: 0, // 开始位置（百分比）
          end: 50, // 结束位置（百分比）
          filterMode: "empty", // 设置数据过滤方式
          xAxisIndex: 0 // 控制 x 轴
        }
      ],
      textStyle: { color: "#c5c5c5" },
      xAxis: [
        {
          type: "category",
          data: xAxisData
        }
      ],
      yAxis: [
        {
          type: "value",
          axisLabel: {
            formatter: function (value: any) {
              if (value >= 10000) {
                return (value / 10000).toFixed(1) + "w";
              } else if (value >= 1000) {
                return (value / 1000).toFixed(1) + "k";
              }
              return value.toString();
            }
          }
        }
      ],
      series: [
        {
          data: seriesData,
          type: "line"
        }
      ]
    }
  });
}

onMounted(() => {
  init();
});
</script>

<template>
  <div>
    <div class="f-c-s">
      <div class="i-tabler-arrow-left" @click="$router.push('/')"></div>
    </div>
    <div class="my-5">
      <div>图表统计</div>
      <div class="text-0.8rem text-text-secondary">统计每月支出走势情况</div>
    </div>
    <div ref="recordChartRef" class="w-100% h-50vh"></div>
  </div>
</template>

<style scoped lang="scss"></style>
