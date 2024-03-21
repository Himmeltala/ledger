<script setup lang="ts">
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

const emits = defineEmits(["deleted"]);

const dialog = ref(false);

function deleteItemForDialog() {
  props.record[props.currY][props.currM].items.splice(props.index, 1);
  dialog.value = !dialog.value;
  emits("deleted");
}
</script>

<template>
  <div>
    <el-button @click="dialog = !dialog" size="small" type="danger" text>删除收支</el-button>
    <el-dialog append-to-body width="90%" v-model="dialog" title="删除收支提示">
      <el-form ref="formInst" status-icon hide-required-asterisk label-position="left">
        <el-form-item label="备注" prop="text">
          {{ record[currY][currM].items[index].text }}
        </el-form-item>
        <el-form-item label="金额" prop="cost">
          {{ record[currY][currM].items[index].cost }}
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="record[currY][currM].items[index].type">
            <el-radio v-for="i in ['支', '收']" disabled :label="i" :value="i"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="连同" prop="sameat">
          <template v-for="i in record[currY][currM].items[index].sameat">
            <el-checkbox v-if="i == currM" checked disabled :label="i + '月'" :value="i" />
            <el-checkbox v-else disabled :label="i + '月'" :value="i" />
          </template>
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
