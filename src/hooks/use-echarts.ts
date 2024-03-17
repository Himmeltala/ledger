import * as echarts from "echarts/core";
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
} from "echarts/components";
import { RadarChart, PieChart, LineChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  RadarChart,
  CanvasRenderer,
  PieChart,
  LineChart
]);

/**
 * 正常渲染图形
 */
function rendering(dom: HTMLElement, options: any) {
  const theChart = echarts.init(dom, options.mode || "light");
  theChart.setOption(options);
}

/**
 * 渲染图表
 */
export function useEcharts(config: { dom: HTMLElement; options?: any }) {
  const options = {
    tooltip: {
      trigger: "item"
    }
  };

  rendering(config.dom, { ...options, ...config.options });
}
