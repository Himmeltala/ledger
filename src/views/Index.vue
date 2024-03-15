<script setup lang="ts">
import {
  getCurrYKs,
  getStorageData,
  setLastViewdDate,
  ensureHasCurrR,
  getSpendingOfCurrM,
  getSurplusOfCurrR,
  getSpendingIncreasesPercentage
} from "@/apis";
import { getCurrYear, getCurrMonth } from "@/utils";

const stroage = getStorageData();
const currY = shallowRef(getCurrYear());
const currM = shallowRef(getCurrMonth());
const yOps = shallowRef<any[]>([]);
const mks = shallowRef([]);
const drawerDisabled = shallowRef(false);

function deleteRecord(month: string) {
  let keys = getCurrYKs(stroage.value.record, currY.value);
  if (keys.length > 1) {
    keys = keys.filter(i => i !== month);
    currM.value = keys[0];
    Reflect.deleteProperty(stroage.value.record[currY.value], month);
  } else {
    if (yOps.value.length > 1) {
      yOps.value = yOps.value.filter(i => i.value !== currY.value);
      Reflect.deleteProperty(stroage.value, currY.value);
      currY.value = yOps.value[0].value;
      currM.value = getCurrYKs(stroage.value.record, currY.value)[0];
    } else {
      ElMessage.error("至少保留一个记录！");
    }
  }

  setLastViewdDate(currY.value, currM.value);
  mks.value = updateMonthKeys(currY.value);
}

function updateMonthKeys(year: string) {
  return getCurrYKs(stroage.value.record, year).map(i => ({
    value: `${i}`,
    label: `${i}月`
  }));
}

function updateYearOptions() {
  return Object.keys(stroage.value.record).map(year => ({
    value: year,
    label: `${year} 年`
  }));
}

function changeCurrYear() {
  const months = getCurrYKs(stroage.value.record, currY.value);
  currM.value = months[0];
  mks.value = months.map(i => ({
    value: `${i}`,
    label: `${i}月`
  }));
  setLastViewdDate(currY.value, currM.value);
}

const onChangeCurrMonthComputed = computed({
  get() {
    return currM.value;
  },
  set(value) {
    currM.value = value;
    setLastViewdDate(currY.value, currM.value);
  }
});

onBeforeMount(() => {
  const viewdDate = getStorageData().value.viewdDate;

  if (Object.keys(viewdDate).length === 0) {
    ensureHasCurrR(stroage.value.record, currY.value, currM.value);
    setLastViewdDate(currY.value, currM.value);
  } else {
    currY.value = viewdDate.year;
    currM.value = viewdDate.month;
    ensureHasCurrR(stroage.value.record, viewdDate.year, viewdDate.month);
  }

  mks.value = updateMonthKeys(currY.value);
  yOps.value = updateYearOptions();
});

function afterCreatedBill() {
  mks.value = updateMonthKeys(currY.value);
  yOps.value = updateYearOptions();
}

function flushRecords() {
  const data = getStorageData().value;
  const keys = getCurrYKs(data.record, data.viewdDate.year);
  for (let i = 0; i < keys.length; i++) {
    const surplus = getSurplusOfCurrR(data.record, data.viewdDate.year, keys[i]);
    data.record[data.viewdDate.year][keys[i]].surplus = surplus;
  }
  ElMessage.success("已重新计算每月剩余");
}

const percent = ref(0);

watch(stroage, () => {
  mks.value = updateMonthKeys(currY.value);
  percent.value = Number(
    getSpendingIncreasesPercentage(stroage.value.record, currY.value, currM.value).toFixed(2)
  );
});
</script>

<template>
  <div class="main">
    <div class="f-c-b">
      <el-button size="small" plain round @click="drawerDisabled = !drawerDisabled">
        <template #icon>
          <div class="i-tabler-menu"></div>
        </template>
      </el-button>
      <el-button size="small" plain round @click="flushRecords">
        <template #icon>
          <div class="i-tabler-refresh"></div>
        </template>
      </el-button>
    </div>
    <div class="f-c-b mt-6">
      <el-select class="mr-4" @change="changeCurrYear" v-model="currY">
        <el-option v-for="item in yOps" :key="item.label" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="onChangeCurrMonthComputed">
        <el-option v-for="item in mks" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
    <div class="f-c-s mt-4">
      <el-popconfirm
        @confirm="() => deleteRecord(currM)"
        confirm-button-text="确定"
        cancel-button-text="取消"
        title="确定删除该记录？">
        <template #reference>
          <el-button size="small" plain round type="danger">删除</el-button>
        </template>
      </el-popconfirm>
      <CreateRecord
        class="ml-4"
        @on-created="afterCreatedBill"
        :record="stroage.record"
        :curr-year="currY" />
      <UpdateRecord class="ml-4" :record="stroage.record" :curr-year="currY" :curr-month="currM" />
    </div>
    <div class="mt-2">
      <div>
        <div class="f-c-b mb-4">
          <div class="f-c-e text-text-regular text-0.8rem">
            <div class="f-c-c mr-4">
              <div class="i-tabler-coin-yen text-text-secondary"></div>
              <span class="text-text-secondary mr-1">预算</span>
              <span>
                {{ stroage.record[currY][currM].budget }}
              </span>
              <span class="text-text-secondary mr-1">，剩余</span>
              <span>
                {{ getSurplusOfCurrR(stroage.record, currY, currM) }}
              </span>
            </div>
          </div>
          <AddItem :record="stroage.record" :curr-year="currY" :curr-month="currM" />
        </div>
        <div class="f-c-e text-0.8rem text-text-regular">
          <div class="f-c-c">
            <div class="i-tabler-map-south text-text-secondary"></div>
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
                :curr-month="currM" />
              <DeleteItem
                class="my-2"
                :record="stroage.record"
                :item-index="index"
                :curr-year="currY"
                :curr-month="currM" />
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
  <el-drawer v-model="drawerDisabled" size="70%" direction="ltr" :with-header="false">
    <Drawer />
  </el-drawer>
</template>
