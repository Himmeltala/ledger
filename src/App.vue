<script lang="ts" setup>
</script>

<template>
  <div class="px-4 pt-4 bg-bg-page min-h-93vh overflow-auto pb-9vh">
    <RouterView v-slot="{ Component }">
      <template v-if="Component">
        <Suspense>
          <component :is="Component" />
        </Suspense>
      </template>
    </RouterView>
  </div>
  <div class="min-h-7vh bg-bg-overlay f-c-b px-4 fixed left-0 bottom-0 w-100%">
    <div :class="{ 'text-current': $route.name === '首页' }" class="w-4rem" @click="$router.push('/')">
      <div class="f-c-c text-1.1rem">
        <div class="i-tabler-home"></div>
      </div>
      <div class="text-center text-0.6rem">首页</div>
    </div>
    <div :class="{ 'text-current': $route.name === '备注' }" class="w-4rem" @click="$router.push('/comments')">
      <div class="f-c-c text-1.1rem">
        <div class=" i-tabler-bookmark"></div>
      </div>
      <div class="text-center text-0.6rem">备注</div>
    </div>
    <div :class="{ 'text-current': $route.name === '统计' }" class="w-4rem" @click="$router.push('/infographic')">
      <div class="f-c-c text-1.1rem">
        <div class="i-tabler-chart-infographic"></div>
      </div>
      <div class="text-center text-0.6rem">统计</div>
    </div>
    <div :class="{ 'text-current': $route.name === '设置' }" class="w-4rem" @click="$router.push('/settings')">
      <div class="f-c-c text-1.1rem">
        <div class="i-tabler-settings"></div>
      </div>
      <div class="text-center text-0.6rem">设置</div>
    </div>
  </div>
</template>

<style scoped>
.text-current {
  color: var(--el-color-primary); /* Replace with your desired color */
}
</style>
