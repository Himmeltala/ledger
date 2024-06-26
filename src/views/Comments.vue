<script lang="ts" setup>
import { ChatDotRound, Coin } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";

const database = await Database.create();
const data = ref(await Database.get<{ items: IComment[] }>(database, Const.DB_COMMENTS, Const.DB_KEY_COMMENTS));
const editCommentsRow = ref<IComment>();
const delCommentsDialog = ref(false);
const commentsEditType = ref<"新增" | "更新">("新增");
const commentsEditDialog = ref(false);

const formInst = ref<FormInstance>();
const formRule = ref<FormRules>({
  text: [
    { required: true, message: "输入备注！", trigger: "change" },
    { required: true, message: "输入备注！", trigger: "blur" }
  ],
  cost: [
    { required: true, validator: Utils.Forms.validateMoney, trigger: "change" },
    { required: true, validator: Utils.Forms.validateMoney, trigger: "blur" }
  ],
  type: [
    { required: true, message: "输入收支类型！", trigger: "change" },
    { required: true, message: "输入收支类型！", trigger: "blur" }
  ]
});
const formData = ref<IComment>({
  text: "",
  cost: 100,
  type: "支"
});

function addComments() {
  Utils.Forms.formValidator(
    formInst.value,
    () => {
      const hasTextInComments = data.value.items.filter(Utils.createFilter(formData.value.text));

      if (!hasTextInComments || (hasTextInComments.length == 0 && formData.value.text)) {
        data.value.items.push({
          value: formData.value.text,
          cost: formData.value.cost,
          type: formData.value.type
        });
        Database.put(database, Const.DB_COMMENTS, Utils.Objects.raw(data.value), Const.DB_KEY_COMMENTS);
        commentsEditDialog.value = !commentsEditDialog.value;
      } else {
        ElMessage.error("重复添加！");
      }
    },
    () => {
      ElMessage.error("检查输入的值是否正确");
    }
  );
}

function updateComments() {
  const index = data.value.items?.findIndex(item => item.value === editCommentsRow.value.value);
  if (index >= 0) {
    Utils.Forms.formValidator(
      formInst.value,
      () => {
        data.value.items[index] = {
          value: formData.value.text,
          cost: formData.value.cost,
          type: formData.value.type
        };
        Database.put(database, Const.DB_COMMENTS, Utils.Objects.raw(data.value), Const.DB_KEY_COMMENTS);
        commentsEditDialog.value = !commentsEditDialog.value;
        formData.value.value = "";
        formData.value.cost = 100;
        formData.value.type = "支";
      },
      () => {
        ElMessage.error("检查输入的值是否正确");
      }
    );
  } else {
    ElMessage.error("更新失败");
  }
}

function confirmDelComments() {
  const index = data.value.items?.findIndex(item => item.value === editCommentsRow.value.value);
  if (index >= 0) {
    data.value.items.splice(index, 1);
    Database.put(database, Const.DB_COMMENTS, Utils.Objects.raw(data.value), Const.DB_KEY_COMMENTS);
    delCommentsDialog.value = !delCommentsDialog.value;
  } else {
    ElMessage.error("删除失败");
  }
}

const filterType = (value: string, row: any) => {
  return row.type === value;
};

function beforeCloseComments(scope: IComment) {
  editCommentsRow.value = scope;
  delCommentsDialog.value = !delCommentsDialog.value;
}

function beforeUpdateComments(scope: IComment) {
  commentsEditType.value = "更新";
  editCommentsRow.value = scope;
  formData.value.text = scope.value;
  formData.value.cost = scope.cost;
  formData.value.type = scope.type;
  commentsEditDialog.value = !commentsEditDialog.value;
}

function beforeCreateRemark() {
  commentsEditType.value = "新增";
  formData.value.text = "";
  formData.value.cost = 100;
  formData.value.type = "支";
  commentsEditDialog.value = !commentsEditDialog.value;
}
</script>

<template>
  <div>
    <div class="mb-4">
      <div>我的备注</div>
      <div class="text-0.8rem text-text-secondary">备注便于添加收入或者支出。红色支出；绿色收入。</div>
    </div>
    <div class="mb-4 f-c-e">
      <el-button plain round size="small" type="primary" @click="beforeCreateRemark">
        <template #icon>
          <div class="i-tabler-plus"></div>
        </template>
      </el-button>
    </div>
    <div class="f-c-b flex-gap-1 flex-wrap">
      <el-table :data="data.items" border stripe>
        <el-table-column fixed="left" label="备注" prop="value" width="95" />
        <el-table-column
          :filter-method="filterType"
          :filters="[
            { text: '支', value: '支' },
            { text: '收', value: '收' }
          ]"
          label="类型"
          prop="type" />
        <el-table-column label="金额" prop="cost" sortable />
        <el-table-column fixed="right" label="操作" width="80">
          <template #default="scope">
            <el-button
              link
              size="small"
              type="danger"
              @click.prevent="beforeCloseComments(scope.row)">
              <template #icon>
                <div class="i-tabler-trash"></div>
              </template>
            </el-button>
            <el-button
              link
              size="small"
              type="success"
              @click.prevent="beforeUpdateComments(scope.row)">
              <template #icon>
                <div class="i-tabler-edit"></div>
              </template>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog v-model="delCommentsDialog" append-to-body title="消息提示" width="90%">
      <div>
        是否要删除 <span class="text-red">{{ editCommentsRow.value }}</span> 备注？
      </div>
      <template #footer>
        <div class="f-c-c">
          <el-button class="mr-4" plain round type="danger" @click="confirmDelComments">
            <template #icon>
              <div class="i-tabler-trash"></div>
            </template>
          </el-button>
          <el-button plain round type="primary" @click="delCommentsDialog = false">
            <template #icon>
              <div class="i-tabler-x"></div>
            </template>
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      v-model="commentsEditDialog"
      :title="commentsEditType == '新增' ? '新建备注' : '修改备注'"
      width="90%">
      <el-form
        ref="formInst"
        :model="formData"
        :rules="formRule"
        hide-required-asterisk
        label-position="left"
        status-icon>
        <el-form-item label="备注" prop="text">
          <el-input
            v-model="formData.text"
            :prefix-icon="ChatDotRound"
            placeholder="请输入收支备注" />
        </el-form-item>
        <el-form-item label="金额" prop="cost">
          <el-input v-model="formData.cost" :prefix-icon="Coin" placeholder="请输入收支金额" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio v-for="item in ['支', '收']" :value="item">
              {{ item }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="f-c-c">
          <el-button class="mr-4" plain round @click="commentsEditDialog = false">
            <template #icon>
              <div class="i-tabler-x"></div>
            </template>
          </el-button>
          <el-button
            plain
            round
            type="primary"
            @click="commentsEditType == '新增' ? addComments() : updateComments()">
            <template #icon>
              <div class="i-tabler-check"></div>
            </template>
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
