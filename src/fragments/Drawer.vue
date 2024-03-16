<script setup lang="ts">
import type { UploadProps } from "element-plus";
import { generateDate } from "@/utils/date-util";
import { getStorageData } from "@/apis";

function exportJson() {
  const blob = new Blob([JSON.stringify(getStorageData().value)], { type: "text/json" });
  const a = document.createElement("a");
  const date = generateDate();
  a.download = `${date.year}-${date.month}-${date.day}${date.hour}${date.minute}${date.second}.json`;
  a.href = URL.createObjectURL(blob);
  a.click();
}

const importJson: UploadProps["onChange"] = async file => {
  if (file.raw) {
    const reader = new FileReader();
    reader.readAsText(file.raw);
    reader.onload = () => {
      const result = JSON.parse(reader.result.toString());
      getStorageData().value = result;
    };
  }
};
</script>

<template>
  <div class="mb-5">
    <div class="text-1.2rem mb-5">数据管理</div>
    <el-button class="mb-5" plain round type="primary" @click="exportJson">导出数据</el-button>
    <el-upload class="mb-5" :limit="1" :auto-upload="false" :on-change="importJson">
      <el-button plain round type="success">导入数据</el-button>
    </el-upload>
    <el-button plain round type="warning" @click="$router.push('/comments')"> 管理备注 </el-button>
  </div>
  <div class="mb-5">
    <div class="text-1.2rem mb-5">其他</div>
    <div>
      <el-button plain round @click="$router.push('/charts')">图表统计</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
