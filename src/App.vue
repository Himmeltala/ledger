<script setup lang="ts"></script>

<template>
  <div class="p-4 bg-bg-page min-h-100vh">
    <RouterView v-slot="{ Component }">
      <template v-if="Component">
        <Suspense>
          <component :is="Component" />
        </Suspense>
      </template>
    </RouterView>
  </div>
</template>
