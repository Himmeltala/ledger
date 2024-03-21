<script setup lang="ts">
import { PropType } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { Coin } from "@element-plus/icons-vue";
import { formValidator } from "@/utils";
import { setR } from "@/apis";

const props = defineProps({
  currY: {
    type: String,
    required: true
  },
  record: {
    type: Object as PropType<IRecord>,
    required: true
  }
});

const emits = defineEmits(["onCreated"]);

const dialog = ref(false);
const formData = ref({
  year: props.currY,
  month: "1月",
  budget: 5000
});
const formInst = ref<FormInstance>();
const formRule = ref<FormRules>();

function confirmSubmit() {
  formValidator(
    formInst.value,
    () => {
      setR(props.record, formData.value.year, formData.value.month.split("月")[0], {
        budget: formData.value.budget,
        surplus: 0,
        items: []
      })
        .then(() => {
          ElMessage.success("创建记录成功！");
          dialog.value = !dialog.value;
          emits("onCreated");
        })
        .catch(() => {
          ElMessage.error("已有该月记录！");
        });
    },
    () => {
      ElMessage.error("创建记录失败！");
    }
  );
}

const keys = <{ value: string; label: string }[]>[];
for (let i = 0; i < 12; i++) {
  keys.push({ value: `${i + 1}`, label: `${i + 1}` });
}
</script>

<template>
  <div>
    <el-button size="small" type="primary" text @click="dialog = !dialog">创建记录</el-button>
    <el-dialog
      append-to-body
      width="90%"
      v-model="dialog"
      title="创建记录"
      @opened="formInst.resetFields()">
      <el-form
        ref="formInst"
        :model="formData"
        :rules="formRule"
        status-icon
        hide-required-asterisk
        label-position="left">
        <el-form-item label="年份" prop="year">
          <el-date-picker
            v-model="formData.year"
            type="year"
            format="YYYY"
            value-format="YYYY"
            style="width: 100%"
            placeholder="选择一个年份" />
        </el-form-item>
        <el-form-item label="月份" prop="month">
          <el-select v-model="formData.month" class="w-100%">
            <el-option
              v-for="item in keys"
              :key="item.value"
              :label="item.label + '月'"
              :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="预算" prop="budget">
          <el-input type="number" :prefix-icon="Coin" v-model="formData.budget" />
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

<style scoped lang="scss"></style>
