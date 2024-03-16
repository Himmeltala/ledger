<script setup lang="ts">
import { getStorageData } from "@/apis";

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
  },
  itemIndex: {
    type: Number,
    required: true
  }
});

const emits = defineEmits(["deleted"]);

const dialog = ref(false);
const stroage = getStorageData();

const formData = ref({
  ...props.record[props.currYear][props.currMonth].items[props.itemIndex],
  deletes: []
});

function deleteItemForDialog() {
  for (let del of formData.value.deletes) {
    const at = formData.value.sameat[del.index];
    stroage.value.record[props.currYear][at.value].items.splice(at.index, 1);
  }

  const newsameat = formData.value.sameat.filter(at => {
    return !formData.value.deletes.some(del => {
      return at.value == del.item.value;
    });
  });

  for (let ns of newsameat) {
    stroage.value.record[props.currYear][ns.value].items[ns.index].sameat = newsameat;
  }

  dialog.value = !dialog.value;
  emits("deleted");
}
</script>

<template>
  <div>
    <el-button @click="dialog = !dialog" size="small" type="danger" text>删除收支</el-button>
    <el-dialog append-to-body width="90%" v-model="dialog" title="删除收支提示">
      <el-form
        ref="formInst"
        :model="formData"
        status-icon
        hide-required-asterisk
        label-position="left">
        <el-form-item label="备注" prop="text">
          {{ formData.text }}
        </el-form-item>
        <el-form-item label="金额" prop="cost">
          {{ formData.cost }}
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio v-for="item in ['支', '收']" disabled :label="item" :value="item"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="连同" prop="sameat">
          <el-checkbox-group v-model="formData.deletes">
            <template v-for="(item, index) in record[currYear][currMonth].items[itemIndex].sameat">
              <el-checkbox
                v-if="item.value == currMonth"
                checked
                disabled
                :label="item.value + '月'"
                :value="{ item, index }" />
              <el-checkbox v-else :label="item.value + '月'" :value="{ item, index }" />
            </template>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item class="mt-10">
          <div class="f-c-c w-100%">
            <el-button class="mr-4" type="danger" plain round @click="deleteItemForDialog">
              <template #icon>
                <div class="i-tabler-trash"></div>
              </template>
            </el-button>
            <el-button plain round type="primary" @click="dialog = !dialog">
              <template #icon>
                <div class="i-tabler-x"></div>
              </template>
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss"></style>
