<script lang="ts" setup>
import { PropType } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { Coin } from "@element-plus/icons-vue";

const props = defineProps({
  database: {
    type: Object as PropType<IDBDatabase>
  },
  data: {
    type: Object as PropType<IRecord>,
    required: true
  },
  currM: {
    type: String,
    required: true
  },
  currY: {
    type: String,
    required: true
  },
  mList: {
    type: Array,
    required: true
  }
});

const emits = defineEmits(["onCreated"]);

const config = await Database.get<IConfig>(props.database, Const.DB_CONFIG, Const.DB_KEY_CONFIG);
const dialog = ref(false);
const formData = reactive({
  year: props.currY,
  month: "1月",
  budget: config.budget
});
const formInst = ref<FormInstance>();
const formRule = ref<FormRules>();

function confirmSubmit() {
  Utils.Forms.formValidator(
    formInst.value,
    () => {
      const currM = formData.month.split("月")[0];

      if (formData.year != props.currY) {
        Database.get<IRecord>(props.database, Const.DB_RECORD, formData.year).then(r => {
          if (!r) {
            Database.add(props.database, Const.DB_RECORD, {
              id: formData.year,
              items: {
                [currM]: {
                  budget: formData.budget, surplus: 0, balance: []
                }
              }
            }).then(
              () => {
                dialog.value = !dialog.value;
                emits("onCreated", formData.year);
              }
            );
          } else {
            if (!Object.keys(r.items).includes(currM)) {
              r.items[currM] = { surplus: 0, budget: formData.budget, balance: [] };
              Database.put(props.database, Const.DB_RECORD, Utils.Objects.raw(r), props.currY).then(
                () => {
                  dialog.value = !dialog.value;
                  emits("onCreated", formData.year);
                }
              );
            } else ElMessage.error("已有该记录");
          }
        });
      } else {
        if (!props.mList.includes(currM)) {
          props.data.items[currM] = { surplus: 0, budget: formData.budget, balance: [] };
          Database.put(props.database, Const.DB_RECORD, Utils.Objects.raw(props.data), props.currY).then(
            () => {
              dialog.value = !dialog.value;
              emits("onCreated", formData.year);
            }
          );
        } else ElMessage.error("已有该记录");
      }
    },
    () => ElMessage.error("创建记录失败")
  );
}

const keys = Array.from({ length: 12 }, (_, i) => ({ value: `${i + 1}`, label: `${i + 1}` }));
</script>

<template>
  <div>
    <el-button plain round size="small" type="primary" @click="dialog = !dialog">创建记录</el-button>
    <el-dialog
      v-model="dialog"
      append-to-body
      title="创建记录"
      width="90%"
      @opened="formInst.resetFields()">
      <el-form
        ref="formInst"
        :model="formData"
        :rules="formRule"
        hide-required-asterisk
        label-position="left"
        status-icon>
        <el-form-item label="年份" prop="year">
          <el-date-picker
            v-model="formData.year"
            format="YYYY"
            placeholder="选择一个年份"
            style="width: 100%"
            type="year"
            value-format="YYYY"
          />
        </el-form-item>
        <el-form-item label="月份" prop="month">
          <el-select v-model="formData.month" class="w-100%">
            <el-option
              v-for="item in keys"
              :key="item.value"
              :label="item.label + '月'"
              :value="item.value" />
            <template #prefix>
              <div class="i-tabler-calendar"></div>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="预算" prop="budget">
          <el-input v-model="formData.budget" :prefix-icon="Coin" type="number" />
        </el-form-item>
        <el-form-item class="mt-10">
          <div class="f-c-c w-100%">
            <el-button class="mr-4" plain round @click="dialog = !dialog">
              <template #icon>
                <div class="i-tabler-x"></div>
              </template>
            </el-button>
            <el-button plain round type="primary" @click="confirmSubmit">
              <template #icon>
                <div class="i-tabler-check"></div>
              </template>
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
