<script setup lang="ts">
import { PropType } from "vue";
import { Coin, ChatDotRound } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import { formValidator, validateMoney } from "@/utils/form-util";
import { getStorage } from "@/apis";

const props = defineProps({
  record: {
    type: Object as PropType<IRecord>,
    required: true
  },
  currY: {
    type: String,
    required: true
  },
  currM: {
    type: String,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
});

const emits = defineEmits(["updated"]);

const dialog = ref(false);
const formInst = ref<FormInstance>();
const formRule = ref<FormRules>({
  cost: [{ validator: validateMoney, trigger: "change" }],
  text: [
    { required: true, message: "请输入收支备注", trigger: "blur" },
    { min: 1, max: 50, message: "长度在1~50个字符之间", trigger: "blur" }
  ]
});
const formData = ref<IItems>({
  ...props.record[props.currY][props.currM].items[props.index]
});
const storage = getStorage();

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
  props.record[props.currY][props.currM].items[props.index].cost = remark.cost;
}

function openUpdateDialog() {
  formData.value = { ...props.record[props.currY][props.currM].items[props.index] };
  dialog.value = !dialog.value;
}

function confirmSubmit() {
  formValidator(
    formInst.value,
    () => {
      dialog.value = !dialog.value;
      props.record[props.currY][props.currM].items[props.index] = {
        ...props.record[props.currY][props.currM].items[props.index],
        ...formData.value
      };
      emits("updated");
      ElMessage.success("修改成功！");
    },
    () => {
      ElMessage.error("修改失败！检查输入的值是否正确");
    }
  );
}
</script>

<template>
  <div>
    <el-button @click="openUpdateDialog" size="small" type="primary" text>编辑收支</el-button>
    <el-dialog append-to-body width="90%" v-model="dialog" title="修改支出项">
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
            placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="花费" prop="cost">
          <el-input type="number" :prefix-icon="Coin" v-model="formData.cost" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio v-for="item in ['支', '收']" :value="item">
              {{ item }}
            </el-radio>
          </el-radio-group>
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
