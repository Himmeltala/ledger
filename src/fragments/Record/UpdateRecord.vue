<script setup lang="ts">
import { PropType } from "vue";
import { Coin } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import { formValidator, validateMoney } from "@/utils/form-util";

const props = defineProps({
  record: {
    type: Object as PropType<IRecord>,
    required: true
  },
  currYear: {
    type: String,
    required: true
  },
  currMonth: {
    type: String,
    required: true
  }
});

const dialog = ref(false);
const formInst = ref<FormInstance>();
const formRule = ref<FormRules>({
  budget: [{ validator: validateMoney, trigger: "change" }]
});
const formData = ref<IMonth>({ ...props.record[props.currYear][props.currMonth] });

function openUpdateDialog() {
  formData.value = { ...props.record[props.currYear][props.currMonth] };
  dialog.value = !dialog.value;
}

function confirmSubmit() {
  formValidator(
    formInst.value,
    () => {
      dialog.value = !dialog.value;
      props.record[props.currYear][props.currMonth] = {
        ...props.record[props.currYear][props.currMonth],
        ...formData.value
      };
      ElMessage.success("更新成功！");
    },
    () => {
      ElMessage.error("更新失败，检查输入的值是否正确！");
    }
  );
}
</script>

<template>
  <div>
    <el-button plain round type="info" size="small" @click="openUpdateDialog">修改</el-button>
    <el-dialog append-to-body width="90%" v-model="dialog" title="修改记录">
      <el-form
        ref="formInst"
        :model="formData"
        :rules="formRule"
        status-icon
        hide-required-asterisk
        label-position="left">
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
