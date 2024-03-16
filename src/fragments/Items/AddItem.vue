<script setup lang="ts">
import { PropType } from "vue";
import { Coin, ChatDotRound } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import { formValidator, validateMoney } from "@/utils/form-util";
import { getCurrYMs, getStorageData } from "@/apis";

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

const emits = defineEmits(["added"]);

const storage = getStorageData();
const dialog = ref(false);
const formData = ref<IItems & { sameness: string[] }>({
  cost: 100,
  text: "",
  type: "支",
  sameness: []
});
const formInst = ref<FormInstance>();
const formRule = ref<FormRules>({
  cost: [{ validator: validateMoney, trigger: "change" }],
  text: [
    { required: true, message: "请输入收支备注", trigger: "blur" },
    { min: 1, max: 50, message: "长度在1~50个字符之间", trigger: "blur" }
  ]
});

function storeRecord(lastIndx: ISameat) {
  for (let i = 0; i < lastIndx.length; i++) {
    const month = props.record[props.currYear][lastIndx[i].value];
    if (!month.items) month.items = [];
    month.items.push({
      cost: formData.value.cost,
      text: formData.value.text,
      type: formData.value.type,
      sameat: lastIndx
    });
  }
}

function confirmSubmit() {
  formValidator(
    formInst.value,
    () => {
      const lastIndx: ISameat = [];
      for (let i = 0; i < formData.value.sameness.length; i++) {
        const items = props.record[props.currYear][formData.value.sameness[i]].items;
        if (!items) lastIndx.push({ value: formData.value.sameness[i], index: 0 });
        else lastIndx.push({ value: formData.value.sameness[i], index: items.length });
      }
      storeRecord(lastIndx);
      dialog.value = !dialog.value;
      ElMessage.success("添加成功！");
      emits("added");
    },
    () => {
      ElMessage.error("检查输入的值是否正确！");
    }
  );
}

const findFromComments = (target: any, callback: any) => {
  const remark = target
    ? storage.value.comments.filter(createFilter(target))
    : storage.value.comments;
  callback(remark);
};

const createFilter = (target: any) => {
  return (source: any) => {
    return source.value.includes(target);
  };
};

function onAutocompleteSelected(remark: IComments) {
  formData.value.text = remark.value;
  formData.value.cost = remark.cost;
  formData.value.type = remark.type;
}

const sameatOps = ref([]);

function openAddDialog() {
  sameatOps.value = [];
  formData.value.sameness = [storage.value.viewdDate.month];
  getCurrYMs(props.record, props.currYear).forEach(value => {
    sameatOps.value.push(value);
  });
  dialog.value = !dialog.value;
}
</script>

<template>
  <div>
    <el-button @click="openAddDialog" size="small" plain round type="success">
      <template #icon>
        <div class="i-tabler-pencil-plus"></div>
      </template>
    </el-button>
    <el-dialog
      append-to-body
      width="90%"
      v-model="dialog"
      title="添加收支"
      @opened="formInst.resetFields()">
      <el-form
        ref="formInst"
        :model="formData"
        :rules="formRule"
        status-icon
        hide-required-asterisk
        label-position="left">
        <el-form-item label="备注" prop="text">
          <el-autocomplete
            class="w-100%"
            v-model="formData.text"
            :prefix-icon="ChatDotRound"
            :fetch-suggestions="findFromComments"
            @select="onAutocompleteSelected"
            placeholder="请输入收支备注" />
        </el-form-item>
        <el-form-item label="花费" prop="cost">
          <el-input
            type="number"
            :prefix-icon="Coin"
            placeholder="请输入收支金额"
            v-model="formData.cost" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio v-for="item in ['支', '收']" :label="item" :value="item"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="连同">
          <el-checkbox-group v-model="formData.sameness">
            <template v-for="item in sameatOps">
              <el-checkbox
                v-if="item == currMonth"
                checked
                disabled
                :label="item + '月'"
                :value="item" />
              <el-checkbox v-else :label="item + '月'" :value="item" />
            </template>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item class="mt-10">
          <div class="f-c-c w-100%">
            <el-button class="mr-4" plain round @click="dialog = !dialog">
              <template #icon>
                <div class="i-tabler-x"></div>
              </template>
            </el-button>
            <el-button type="primary" plain round @click="confirmSubmit">
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
