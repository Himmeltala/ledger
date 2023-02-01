<script setup lang="ts">
import { Coin, ChatDotRound } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import { formValidator, validateMoney } from "@/utils/form-util";
import { getStorageData } from "@/apis";

const storage = getStorageData();
const editCommentsRow = ref<IComments>();
const delCommentsDialog = ref(false);
const commentsEditType = ref<"新增" | "更新">("新增");
const commentsEditDialog = ref(false);

const createFilter = (target: any) => {
  return (source: any) => {
    return source.value.includes(target);
  };
};

const formInst = ref<FormInstance>();
const formRule = ref<FormRules>({
  text: [
    { required: true, message: "输入备注！", trigger: "change" },
    { required: true, message: "输入备注！", trigger: "blur" }
  ],
  cost: [
    { required: true, validator: validateMoney, trigger: "change" },
    { required: true, validator: validateMoney, trigger: "blur" }
  ],
  type: [
    { required: true, message: "输入收支类型！", trigger: "change" },
    { required: true, message: "输入收支类型！", trigger: "blur" }
  ]
});
const formData = ref<IComments>({
  text: "",
  cost: 100,
  type: "支"
});

function addComments() {
  formValidator(
    formInst.value,
    () => {
      const hasTextInComments = storage.value.comments?.filter(createFilter(formData.value.text));

      if (!hasTextInComments || (hasTextInComments.length == 0 && formData.value.text)) {
        if (!hasTextInComments) {
          storage.value["comments"] = [
            {
              value: formData.value.text,
              cost: formData.value.cost,
              type: formData.value.type
            }
          ];
        } else {
          storage.value.comments.push({
            value: formData.value.text,
            cost: formData.value.cost,
            type: formData.value.type
          });
        }
        ElMessage.success("添加成功！");
        commentsEditDialog.value = !commentsEditDialog.value;
      } else {
        ElMessage.error("重复添加！");
      }
    },
    () => {
      ElMessage.error("检查值是否正确！");
    }
  );
}

function updateComments() {
  const index = storage.value.comments?.findIndex(
    item => item.value === editCommentsRow.value.value
  );
  if (index >= 0) {
    formValidator(
      formInst.value,
      () => {
        storage.value.comments[index] = {
          value: formData.value.text,
          cost: formData.value.cost,
          type: formData.value.type
        };
        commentsEditDialog.value = !commentsEditDialog.value;
        formData.value.value = "";
        formData.value.cost = 100;
        formData.value.type = "支";
        ElMessage.success("更新成功！");
      },
      () => {
        ElMessage.error("检查值是否正确！");
      }
    );
  } else {
    ElMessage.error("更新失败！");
  }
}

function confirmDelComments() {
  const index = storage.value.comments?.findIndex(
    item => item.value === editCommentsRow.value.value
  );
  if (index >= 0) {
    storage.value.comments.splice(index, 1);
    ElMessage.success("删除成功！");
    delCommentsDialog.value = !delCommentsDialog.value;
  } else {
    ElMessage.error("删除失败！");
  }
}

const filterType = (value: string, row: any) => {
  return row.type === value;
};

function beforeCloseComments(scope: IComments) {
  editCommentsRow.value = scope;
  delCommentsDialog.value = !delCommentsDialog.value;
}

function beforeUpdateComments(scope: IComments) {
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
    <div class="f-c-s">
      <div class="i-tabler-arrow-left" @click="$router.push('/')"></div>
    </div>
    <div class="my-5">
      <div>我的备注</div>
      <div class="text-0.8rem text-text-secondary">红色代表支出，绿色代表收入</div>
    </div>
    <div class="mb-5 f-c-e">
      <el-button plain round type="primary" size="small" @click="beforeCreateRemark">
        <template #icon>
          <div class="i-tabler-plus"></div>
        </template>
      </el-button>
    </div>
    <div class="f-c-b flex-gap-1 flex-wrap">
      <el-table stripe border :data="storage.comments">
        <el-table-column fixed="left" prop="value" label="备注" width="95" />
        <el-table-column
          prop="type"
          label="类型"
          :filters="[
            { text: '支', value: '支' },
            { text: '收', value: '收' }
          ]"
          :filter-method="filterType" />
        <el-table-column prop="cost" sortable label="金额" />
        <el-table-column fixed="right" label="操作" width="80">
          <template #default="scope">
            <el-button
              link
              type="danger"
              size="small"
              @click.prevent="beforeCloseComments(scope.row)">
              <template #icon>
                <div class="i-tabler-trash"></div>
              </template>
            </el-button>
            <el-button
              link
              type="success"
              size="small"
              @click.prevent="beforeUpdateComments(scope.row)">
              <template #icon>
                <div class="i-tabler-edit"></div>
              </template>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog append-to-body width="90%" v-model="delCommentsDialog" title="消息提示">
      <div>
        是否要删除 <span class="text-red">{{ editCommentsRow.value }}</span> 备注？
      </div>
      <template #footer>
        <div class="f-c-c">
          <el-button class="mr-4" plain round type="danger" @click="confirmDelComments">
            <template #icon>
              <div class="i-tabler-check"></div>
            </template>
          </el-button>
          <el-button plain round @click="delCommentsDialog = false">
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
        status-icon
        hide-required-asterisk
        label-position="left">
        <el-form-item label="备注" prop="text">
          <el-input
            :prefix-icon="ChatDotRound"
            placeholder="请输入收支备注"
            v-model="formData.text" />
        </el-form-item>
        <el-form-item label="金额" prop="cost">
          <el-input :prefix-icon="Coin" placeholder="请输入收支金额" v-model="formData.cost" />
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
            type="primary"
            plain
            round
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

<style scoped lang="scss"></style>
