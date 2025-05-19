<script setup lang="ts">
import { onMounted } from "vue";
import { ThemeService } from "./services/theme.service";

onMounted(() => {
  ThemeService.getInstance();
});
</script>

<template>
  <div class="min-h-screen w-full" :class="{ 'bg-gray-100': true }">
    <header class="bg-primary text-white py-4 w-full">
      <div class="container mx-auto px-4 lg:px-8">
        <h1 class="text-2xl font-bold">管理資訊平台</h1>
      </div>
    </header>

    <main class="py-6 w-full">
      <div class="container mx-auto px-4 lg:px-8">
        <router-view />
      </div>
    </main>

    <footer
      class="py-4 mt-8 w-full"
      :class="{ 'bg-gray-200': true, 'text-gray-600': true }"
    >
      <div class="container mx-auto px-4 lg:px-8 text-center">
        <p>&copy; {{ new Date().getFullYear() }} 管理資訊平台</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  max-width: 100%;
}

@media (min-width: 1024px) {
  .container {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
