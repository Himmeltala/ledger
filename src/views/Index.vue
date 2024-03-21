<script setup lang="ts">
import {
  getMs,
  getYs,
  getStorage,
  setViewdDate,
  safetyR,
  getSpendingOfM,
  getSurplusOfR,
  getSpendingIncreasesPercentage
} from "@/apis";
import { getCurrY, getCurrM, hasProperties } from "@/utils";

const storage = getStorage();
const drawer = ref(false);
const currY = ref(storage.value.viewdDate.year);
const currM = ref(storage.value.viewdDate.month);
const currMs = ref([]);
const yList = ref([]);

function deleteR() {
  if (currMs.value.length > 1) {
    Reflect.deleteProperty(storage.value.record[currY.value], currM.value);
    currMs.value = currMs.value.filter(i => i != currM.value);
    currM.value = currMs.value[0];
  } else {
    if (yList.value.length > 1) {
      Reflect.deleteProperty(storage.value.record, currY.value);
      yList.value = yList.value.filter(i => i !== currY.value);
      currY.value = yList.value[0];
      currMs.value = getMs(storage.value.record, currY.value);
      currM.value = currMs.value[0];
    } else {
      ElMessage.error("至少保留一个记录！");
    }
  }

  setViewdDate(storage.value, currY.value, currM.value);
  recountR();
}

function onCurrYChange() {
  currMs.value = getMs(storage.value.record, currY.value);
  currM.value = currMs.value[0];
  setViewdDate(storage.value, currY.value, currM.value);
  recountR();
}

function onCurrMChange() {
  currMs.value = getMs(storage.value.record, currY.value);
  setViewdDate(storage.value, currY.value, currM.value);
  recountR();
}

onBeforeMount(() => {
  const viewdDate = storage.value.viewdDate;
  if (!hasProperties(viewdDate)) {
    currY.value = getCurrY();
    currM.value = getCurrM();
    safetyR(storage.value.record, currY.value, currM.value);
  } else {
    currY.value = storage.value.viewdDate.year;
    currM.value = storage.value.viewdDate.month;
  }
  currMs.value = getMs(storage.value.record, currY.value);
  yList.value = getYs(storage.value.record);
});

function afterCreatedR() {
  currMs.value = getMs(storage.value.record, currY.value);
  yList.value = getYs(storage.value.record);
}

const percent = ref(0);

function recountR() {
  for (let i = 0; i < currMs.value.length; i++) {
    const surplus = getSurplusOfR(storage.value.record, currY.value, currMs.value[i]);
    storage.value.record[currY.value][currMs.value[i]].surplus = surplus;
  }
  percent.value = Number(
    getSpendingIncreasesPercentage(storage.value.record, currY.value, currM.value).toFixed(2)
  );
}
</script>

<template>
  <div class="main">
    <div class="f-c-b">
      <el-button size="small" plain round @click="drawer = !drawer">
        <template #icon>
          <div class="i-tabler-menu"></div>
        </template>
      </el-button>
      <el-button size="small" plain round @click="recountR">
        <template #icon>
          <div class="i-tabler-refresh"></div>
        </template>
      </el-button>
    </div>
    <div class="f-c-b mt-6">
      <el-select class="mr-4" @change="onCurrYChange" v-model="currY">
        <el-option v-for="item in yList" :key="item" :label="item + '年'" :value="item" />
      </el-select>
      <el-select @change="onCurrMChange" v-model="currM">
        <el-option v-for="item in currMs" :key="item + '月'" :label="item + '月'" :value="item" />
      </el-select>
    </div>
    <div class="f-c-s mt-4">
      <el-popconfirm
        @confirm="deleteR"
        confirm-button-text="确定"
        cancel-button-text="取消"
        title="确定删除该记录？">
        <template #reference>
          <el-button size="small" plain round type="danger">删除</el-button>
        </template>
      </el-popconfirm>
      <CreateRecord
        class="ml-4"
        @on-created="afterCreatedR"
        :record="storage.record"
        :curr-y="currY" />
      <UpdateRecord class="ml-4" :record="storage.record" :curr-y="currY" :curr-m="currM" />
    </div>
    <div class="mt-2">
      <div>
        <div class="f-c-b mb-4">
          <div class="f-c-e text-text-regular text-0.8rem">
            <div class="f-c-c mr-4">
              <div class="i-tabler-coin-yen text-text-secondary mr-1"></div>
              <span class="text-text-secondary mr-1">预算</span>
              <span>
                {{ storage.record[currY][currM]?.budget }}
              </span>
              <span class="text-text-secondary mr-1">，剩余</span>
              <span v-if="storage.record[currY][currM]?.surplus >= 0" class="text-green">
                {{ storage.record[currY][currM].surplus }}
              </span>
              <span v-else class="text-red">{{ storage.record[currY][currM]?.surplus }}</span>
            </div>
          </div>
          <AddItem :record="storage.record" :curr-y="currY" :curr-m="currM" @added="recountR" />
        </div>
        <div class="f-c-e text-0.8rem text-text-regular">
          <div class="f-c-c">
            <div class="i-tabler-map-south text-text-secondary mr-1"></div>
            <span class="text-text-secondary mr-1">支出</span>
            <span>
              {{ getSpendingOfM(storage.record, currY, currM) }}
            </span>
          </div>
          <span class="text-text-secondary mr-1">，比上月</span>
          <div class="f-c-c text-red" v-if="percent > 0">
            +{{ percent }}%
            <div class="i-tabler-caret-up"></div>
          </div>
          <div class="f-c-c text-green" v-else>
            {{ percent }}%
            <div class="i-tabler-caret-down"></div>
          </div>
        </div>
      </div>
      <div class="mt-4">
        <div
          class="mt-20"
          v-if="
            !(storage.record[currY][currM]?.items && storage.record[currY][currM]?.items.length)
          ">
          <el-result icon="info" title="提示">
            <template #sub-title>
              <p>没有收支记录</p>
            </template>
          </el-result>
        </div>
        <div
          v-for="(item, index) in storage.record[currY][currM]?.items"
          class="w-100% bg-bg-overlay p-4 rd-2 mt-2">
          <el-dropdown trigger="click" class="w-100%">
            <div class="w-100% f-c-b">
              <div class="f-c-s">
                <el-tag size="small" class="mr-4" :type="item.type === '支' ? 'danger' : 'success'">
                  {{ item.type }}
                </el-tag>
                {{ item.text }}
              </div>
              <div class="text-text-secondary">{{ item.cost }}</div>
            </div>
            <template #dropdown>
              <UpdateItem
                class="my-2"
                :record="storage.record"
                :index="index"
                :curr-y="currY"
                :curr-m="currM"
                @updated="recountR" />
              <DeleteItem
                class="my-2"
                :record="storage.record"
                :index="index"
                :curr-y="currY"
                :curr-m="currM"
                @deleted="recountR" />
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
  <el-drawer v-model="drawer" size="70%" direction="ltr" :with-header="false">
    <Drawer />
  </el-drawer>
</template>
