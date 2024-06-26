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

const emits = defineEmits(["onDeleted"]);

function handleDelete() {
  const nextM = Utils.deleteAndReturnNext(props.mList, props.currM);
  if (nextM) {
    delete props.data.items[props.currM];
    Database.put(props.database, Const.DB_RECORD, Utils.Objects.raw(props.data), props.currY).then(() => {
      Database.put(props.database, Const.DB_CONFIG, {
        id: Const.DB_KEY_CONFIG,
        Y: props.currY,
        M: nextM
      }, Const.DB_KEY_CONFIG);
      emits("onDeleted", nextM);
    });
  } else ElMessage.error("至少保留一条记录");
}
</script>

<template>
  <div>
    <el-popconfirm
      cancel-button-text="取消"
      confirm-button-text="确定"
      title="确定删除该记录？"
      @confirm="handleDelete">
      <template #reference>
        <div>
          <el-button plain round size="small" type="danger">删除记录</el-button>
        </div>
      </template>
    </el-popconfirm>
  </div>
</template>

<style lang="scss" scoped>

</style>