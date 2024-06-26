<script lang="ts" setup>
import { PropType } from "vue";
import { Coin } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";

const props = defineProps({
  database: {
    type: Object as PropType<IDBDatabase>,
    required: true
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
  }
});

const dialog = ref(false);
const formInst = ref<FormInstance>();
const formRule = ref<FormRules>({
  budget: [{ validator: Utils.Forms.validateMoney, trigger: "change" }]
});
const formData = reactive<IMonth>({
  budget: props.data?.items[props.currM]?.budget || 0
});

function openUpdateDialog() {
  formData.budget = props.data?.items[props.currM]?.budget || 0;
  dialog.value = !dialog.value;
}

function confirmSubmit() {
  Utils.Forms.formValidator(
    formInst.value,
    async () => {
      props.data.items[props.currM].budget = Number(formData.budget);
      await Database.put(props.database, Const.DB_RECORD, Utils.Objects.raw(props.data), props.currY);
      dialog.value = !dialog.value;
    },
    () => {
      ElMessage.error("检查输入的值是否正确");
    }
  );
}
</script>

<template>
  <div>
    <el-button plain round size="small" type="info" @click="openUpdateDialog">修改记录</el-button>
    <el-dialog v-model="dialog" append-to-body title="修改记录" width="90%">
      <el-form
        ref="formInst"
        :model="formData"
        :rules="formRule"
        hide-required-asterisk
        label-position="left"
        status-icon>
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
