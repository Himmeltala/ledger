<script lang="ts" setup>
import type { UploadProps } from "element-plus";

const database = await Database.create();
const config = await Database.get<IConfig>(database, Const.DB_CONFIG, Const.DB_KEY_CONFIG);

async function exportJson() {
  const records = await Database.get<IRecord[]>(database, Const.DB_RECORD);
  const comments = await Database.get(database, Const.DB_COMMENTS, Const.DB_KEY_COMMENTS);
  const config = await Database.get(database, Const.DB_CONFIG, Const.DB_KEY_CONFIG);

  const blob = new Blob([JSON.stringify([
    {
      records, comments, config
    }
  ])], { type: "text/json" });
  const a = document.createElement("a");
  const date = Utils.Dates.generateDate();
  a.download = `${date.y}-${date.m}-${date.d}${date.h}${date.minute}${date.second}.json`;
  a.href = URL.createObjectURL(blob);
  a.click();
}

const importJson: UploadProps["onChange"] = async file => {
  if (file.raw) {
    const reader = new FileReader();
    reader.readAsText(file.raw);
    reader.onload = () => {
      const result = JSON.parse(reader.result.toString());

      Database.clear(database, Const.DB_RECORD).then(() => {
        result[0].records.forEach((i: any) => {
          Database.leadIn(database, i, Const.DB_RECORD);
        });
      });
      Database.clear(database, Const.DB_COMMENTS).then(() => {
        Database.leadIn(database, result[0].comments, Const.DB_COMMENTS);
      });
      Database.clear(database, Const.DB_CONFIG).then(() => {
        Database.leadIn(database, result[0].config, Const.DB_CONFIG);
      });
    };
  }
};

async function delDatabase() {
  await Database.del(Const.DB_TALLYPAD);
}

const formData = reactive<IConfig>({ ...config });

watch(formData, (value, oldValue, onCleanup) => {
  Database.put(database, Const.DB_CONFIG, Utils.Objects.raw(value), Const.DB_KEY_CONFIG);
});
</script>

<template>
  <div>
    <div class="mb-4">
      <div class="mb-4">
        <div>设置</div>
        <div class="text-0.8rem text-text-secondary">一些设置和管理</div>
      </div>
      <div class="flex-wrap f-c-b">
        <div class="f-c-c flex-basis-33.33% max-w-33.33%">
          <el-button plain round type="primary" @click="exportJson">导出数据</el-button>
        </div>
        <el-upload :auto-upload="false" :limit="1" :on-change="importJson" :show-file-list="false"
                   accept="application/json" class="f-c-c flex-basis-33.33% max-w-33.33%">
          <el-button plain round type="success">导入数据</el-button>
        </el-upload>
        <div class="f-c-c flex-basis-33.33% max-w-33.33%">
          <el-popconfirm title="确定清除数据？" @confirm="delDatabase">
            <template #reference>
              <el-button plain round type="danger">清除数据</el-button>
            </template>
          </el-popconfirm>
        </div>
      </div>
    </div>
    <div>
      <div class="mb-4">
        <div>选项</div>
        <div class="text-0.8rem text-text-secondary">配置预算、图表</div>
      </div>
      <div>
        <el-form :model="formData" class="p-4" label-position="left" label-width="auto">
          <el-form-item label="总预算">
            <el-input v-model="formData.budget" size="small" type="number" />
          </el-form-item>
          <el-form-item :label="formData.isChart ? '开启图表' : '关闭图表'">
            <el-switch v-model="formData.isChart" />
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>