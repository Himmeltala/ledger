<script lang="ts" setup>
import { PropType } from "vue";

const props = defineProps({
  database: {
    type: Object as PropType<IDBDatabase>
  },
  data: {
    type: Object as PropType<IRecord>,
    required: true
  },
  value: {
    type: Object,
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

const isShowDialog = ref(false);

async function confirmSubmit() {
  props.data.items[props.currM].balance.splice(props.index, 1);
  await Database.put(props.database, Const.DB_RECORD, Utils.Objects.raw(props.data), props.currY);
  isShowDialog.value = !isShowDialog.value;
}
</script>

<template>
  <div>
    <el-button size="small" text type="danger" @click="isShowDialog = !isShowDialog">
      删除收支
    </el-button>
    <el-dialog v-model="isShowDialog" append-to-body title="删除收支提示" width="90%">
      <el-form ref="formInst" hide-required-asterisk label-position="left" status-icon>
        <el-form-item label="备注" prop="text">
          {{ data.items[currM].balance[index].text }}
        </el-form-item>
        <el-form-item label="金额" prop="cost">
          {{ data.items[currM].balance[index].cost }}
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="data.items[currM].balance[index].type">
            <el-radio v-for="i in ['支', '收']" :label="i" :value="i" disabled></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item class="mt-10">
          <div class="f-c-c w-100%">
            <el-button class="mr-4" plain round type="danger" @click="confirmSubmit">
              <template #icon>
                <div class="i-tabler-trash"></div>
              </template>
            </el-button>
            <el-button plain round type="primary" @click="isShowDialog = !isShowDialog">
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

<style lang="scss" scoped></style>
