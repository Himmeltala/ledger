<script setup lang="ts">
import {
  getCurrYMs,
  getStorageData,
  setLastViewdDate,
  ensureHasCurrR,
  getSpendingOfCurrM,
  getSurplusOfCurrR,
  getSpendingIncreasesPercentage
} from "@/apis";
import { getCurrYear, getCurrMonth } from "@/utils";

const stroage = getStorageData();
const drawer = ref(false);
const currY = ref(getCurrYear());
const currM = ref(getCurrMonth());
const currYMs = ref([]);
const allY = ref([]);

function deleteR() {
  if (currYMs.value.length > 1) {
    currYMs.value = currYMs.value.filter(i => i != currM.value);
    currM.value = currYMs.value[0];
    Reflect.deleteProperty(stroage.value.record[currY.value], currM.value);
  } else {
    if (allY.value.length > 1) {
      allY.value = allY.value.filter(i => i.value !== currY.value);
      Reflect.deleteProperty(stroage.value, currY.value);
      currY.value = allY.value[0].value;
      currM.value = getCurrYMs(stroage.value.record, currY.value)[0];
    } else {
      ElMessage.error("至少保留一个记录！");
    }
  }

  currYMs.value = getCurrYMs(stroage.value.record, currY.value);
  setLastViewdDate(currY.value, currM.value);
  loadR();
}

function loadYoptions() {
  return Object.keys(stroage.value.record).map(year => ({
    value: year,
    label: `${year} 年`
  }));
}

function changeCurrY() {
  currYMs.value = getCurrYMs(stroage.value.record, currY.value);
  currM.value = currYMs.value[0];
  setLastViewdDate(currY.value, currM.value);
  loadR();
}

function changeCurrM() {
  currYMs.value = getCurrYMs(stroage.value.record, currY.value);
  setLastViewdDate(currY.value, currM.value);
  loadR();
}

onBeforeMount(() => {
  const viewdDate = stroage.value.viewdDate;
  currYMs.value = getCurrYMs(stroage.value.record, currY.value);

  if (Object.keys(viewdDate).length == 0) {
    ensureHasCurrR(stroage.value.record, currY.value, currM.value);
    setLastViewdDate(currY.value, currM.value);
  } else {
    currY.value = viewdDate.year;
    currM.value = viewdDate.month;
    ensureHasCurrR(stroage.value.record, viewdDate.year, viewdDate.month);
  }

  allY.value = loadYoptions();
});

function afterCreatedR() {
  currYMs.value = getCurrYMs(stroage.value.record, currY.value);
  allY.value = loadYoptions();
}

const percent = ref(0);

function loadR() {
  for (let i = 0; i < currYMs.value.length; i++) {
    const surplus = getSurplusOfCurrR(stroage.value.record, currY.value, currYMs.value[i]);
    stroage.value.record[currY.value][currYMs.value[i]].surplus = surplus;
  }
  percent.value = Number(
    getSpendingIncreasesPercentage(stroage.value.record, currY.value, currM.value).toFixed(2)
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
      <el-button size="small" plain round @click="loadR">
        <template #icon>
          <div class="i-tabler-refresh"></div>
        </template>
      </el-button>
    </div>
    <div class="f-c-b mt-6">
      <el-select class="mr-4" @change="changeCurrY" v-model="currY">
        <el-option v-for="item in allY" :key="item.label" :label="item.label" :value="item.value" />
      </el-select>
      <el-select @change="changeCurrM" v-model="currM">
        <el-option v-for="item in currYMs" :key="item + '月'" :label="item + '月'" :value="item" />
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
        :record="stroage.record"
        :curr-year="currY" />
      <UpdateRecord class="ml-4" :record="stroage.record" :curr-year="currY" :curr-month="currM" />
    </div>
    <div class="mt-2">
      <div>
        <div class="f-c-b mb-4">
          <div class="f-c-e text-text-regular text-0.8rem">
            <div class="f-c-c mr-4">
              <div class="i-tabler-coin-yen text-text-secondary mr-1"></div>
              <span class="text-text-secondary mr-1">预算</span>
              <span>
                {{ stroage.record[currY][currM].budget }}
              </span>
              <span class="text-text-secondary mr-1">，剩余</span>
              <span v-if="stroage.record[currY][currM].surplus >= 0" class="text-green">
                {{ stroage.record[currY][currM].surplus }}
              </span>
              <span v-else class="text-red">{{ stroage.record[currY][currM].surplus }}</span>
            </div>
          </div>
          <AddItem :record="stroage.record" :curr-year="currY" :curr-month="currM" @added="loadR" />
        </div>
        <div class="f-c-e text-0.8rem text-text-regular">
          <div class="f-c-c">
            <div class="i-tabler-map-south text-text-secondary mr-1"></div>
            <span class="text-text-secondary mr-1">支出</span>
            <span>
              {{ getSpendingOfCurrM(stroage.record, currY, currM) }}
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
          v-if="!(stroage.record[currY][currM].items && stroage.record[currY][currM].items.length)">
          <el-result icon="info" title="提示">
            <template #sub-title>
              <p>没有收支记录</p>
            </template>
          </el-result>
        </div>
        <div
          v-for="(item, index) in stroage.record[currY][currM].items"
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
                :record="stroage.record"
                :item-index="index"
                :curr-year="currY"
                :curr-month="currM"
                @updated="loadR" />
              <DeleteItem
                class="my-2"
                :record="stroage.record"
                :item-index="index"
                :curr-year="currY"
                :curr-month="currM"
                @deleted="loadR" />
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
