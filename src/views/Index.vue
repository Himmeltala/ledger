<script lang="ts" setup>
import { DataBase } from "@/database";
import { Utils } from "@/utils";

const database = await DataBase.create();
const datetime = await DataBase.get<{ Y: string; M: string }>(database, Const.VIEW_DATE, "0");
const currY = ref(datetime.Y);
const currM = ref(datetime.M);
const data = ref(await DataBase.get<IRecord>(database, Const.RECORD, currY.value));
const MList = ref(Object.keys(data.value.items));
const YList = ref<any[]>(await DataBase.keys(database, Const.RECORD));

const isDrawer = ref(false);

function calcCurrMBalance() {
  if (!data?.value.items[currM.value]) return 0;

  let totalCost = 0;
  data.value.items[currM.value].items.forEach((item) => totalCost += Number(item.cost));
  data.value.items[currM.value].surplus = (data.value.items[currM.value].budget - totalCost);
  DataBase.put(database, Const.RECORD, Utils.Objects.raw(data.value), currY.value).then(() => calcRisingRate());

  return data.value.items[currM.value].surplus;
}

const risingRate = ref(0);

function calcRisingRate() {
  if (!data?.value.items[currM.value]) return 0;

  let lastMCost = 0, currMCost = 0;
  const keys = MList.value.sort((a, b) => Number(a) - Number(b));
  const index = keys.findIndex(item => item === currM.value);
  const isFirst = index === 0;

  if (index !== -1) {
    if (!isFirst) {
      data.value.items[keys[index - 1]].items.forEach(item => lastMCost += item.cost);
      data.value.items[keys[index]].items.forEach(item => currMCost += item.cost);
    }

    const hasNonZeroLastCost = lastMCost !== 0;
    risingRate.value = hasNonZeroLastCost ? Math.round(((currMCost - lastMCost) / lastMCost * 100) * 10) / 10 : 0;
  } else {
    risingRate.value = 0;
  }

  return risingRate.value;
}

function calcOutcome() {
  if (!data?.value.items[currM.value]) return 0;

  let totalCost = 0;
  data.value.items[currM.value].items.forEach((item) => totalCost += Number(item.cost));

  return totalCost;
}

async function onCurrYChange() {
  data.value = await DataBase.get(database, Const.RECORD, currY.value);
  MList.value = Object.keys(data.value.items);
  currM.value = MList.value[0];
}

function onCurrMChange() {
}

async function onCreatedR() {
  data.value = await DataBase.get(database, Const.RECORD, currY.value);
  MList.value = Object.keys(data.value.items);
}

async function onDeletedR() {
  const nextM = Utils.deleteAndReturnNext(MList.value, currM.value);
  if (nextM) {
    delete data.value.items[currM.value];
    await DataBase.put(database, Const.RECORD, Utils.Objects.raw(data.value), currY.value);
    currM.value = String(nextM);
    await DataBase.put(database, Const.VIEW_DATE, { id: "0", Y: currY.value, M: currM.value }, "0");
  } else {
    ElMessage.error("至少保留一条记录");
  }
}
</script>

<template>
  <div class="main">
    <div class="f-c-b">
      <el-button plain round size="small" @click="isDrawer = !isDrawer">
        <template #icon>
          <div class="i-tabler-menu"></div>
        </template>
      </el-button>
    </div>
    <div class="f-c-b mt-6">
      <el-select v-model="currY" class="mr-4" @change="onCurrYChange">
        <el-option v-for="item in YList" :key="item" :label="item + '年'" :value="item" />
      </el-select>
      <el-select v-model="currM" @change="onCurrMChange">
        <el-option v-for="item in MList" :key="item + '月'" :label="item + '月'" :value="item" />
      </el-select>
    </div>
    <div class="f-c-e mt-4">
      <el-dropdown trigger="click">
        <el-button plain round size="small">
          <template #icon>
            <div class="i-tabler-dots"></div>
          </template>
        </el-button>
        <template #dropdown>
          <div class="m-2">
            <el-popconfirm
              cancel-button-text="取消"
              confirm-button-text="确定"
              title="确定删除该记录？"
              @confirm="onDeletedR">
              <template #reference>
                <el-button class="mb-2" size="small" text type="danger">删除记录</el-button>
              </template>
            </el-popconfirm>
            <CreateRecord
              :curr-m="currM"
              :curr-y="currY"
              :data="data"
              :database="database"
              :m-list="MList"
              class="mb-2"
              @on-created="onCreatedR" />
            <UpdateRecord
              :curr-m="currM"
              :curr-y="currY"
              :data="data"
              :database="database"
              class="mb-2" />
            <AddItem :curr-m="currM" :curr-y="currY" :data="data" :database="database" />
          </div>
        </template>
      </el-dropdown>
    </div>
    <div class="mt-2">
      <div>
        <div class="f-c-s text-text-regular text-0.8rem">
          <div class="f-c-c">
            <div class="i-tabler-coin-yen text-text-secondary mr-1"></div>
            <span class="text-text-secondary mr-1">预算</span>
            <span>
              {{ data?.items[currM]?.budget }}
            </span>
            <span class="text-text-secondary mr-1">，剩余</span>
            <span v-show="data?.items[currM]?.surplus >= 0" class="text-green">
              {{ calcCurrMBalance() }}
            </span>
            <span v-show="data?.items[currM]?.surplus < 0" class="text-red">{{ calcCurrMBalance() }}</span>
          </div>
        </div>
        <div class="f-c-e text-text-regular text-0.8rem">
          <div class="f-c-c">
            <div class="i-tabler-map-south text-text-secondary mr-1"></div>
            <span class="text-text-secondary mr-1">支出</span>
            <span>
               {{ calcOutcome() }}
            </span>
          </div>
          <span class="text-text-secondary mr-1">，增长</span>
          <div v-show="risingRate > 0" class="f-c-c text-red">
            +{{ risingRate }}%
            <div class="i-tabler-caret-up"></div>
          </div>
          <div v-show="risingRate <= 0" class="f-c-c text-green">
            {{ risingRate }}%
            <div class="i-tabler-caret-down"></div>
          </div>
        </div>
      </div>
      <div class="mt-4">
        <el-result v-if="!data?.items[currM]?.items?.length" class="mt-20" icon="info" title="提示">
          <template #sub-title>
            <p>没有收支记录</p>
          </template>
        </el-result>
        <el-dropdown
          v-for="(value, index) in data?.items[currM]?.items"
          v-else
          class="w-100% bg-bg-overlay p-4 rd-2 mt-2"
          trigger="click">
          <div class="w-100% f-c-b">
            <div class="f-c-s">
              <el-tag :type="value.type == '支' ? 'danger' : 'success'" class="mr-4" size="small">
                {{ value.type }}
              </el-tag>
              <div>
                {{ value.text }}
              </div>
            </div>
            <div class="text-text-secondary">{{ value.cost }}</div>
          </div>
          <template #dropdown>
            <div class="m-2">
              <UpdateItem
                :curr-m="currM"
                :curr-y="currY"
                :data="data"
                :database="database"
                :index="index"
                :value="value"
                class="mb-2" />
              <DeleteItem
                :curr-m="currM"
                :curr-y="currY"
                :data="data"
                :database="database"
                :index="index"
                :value="value" />
            </div>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
  <el-drawer v-model="isDrawer" :with-header="false" direction="ltr" size="70%">
    <Drawer />
  </el-drawer>
</template>