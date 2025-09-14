<script setup lang="ts">
import { onMounted } from "vue";
import { ThemeService } from "./services/theme.service";

onMounted(() => {
  ThemeService.getInstance();
});
</script>

<template>
  <div
    class="min-h-screen w-full"
    :style="{
      backgroundColor: 'var(--color-background)',
      color: 'var(--color-text)',
    }"
  >
    <header
      :style="{ backgroundColor: 'var(--color-primary)', color: '#fff' }"
      class="py-4 w-full"
    >
      <div class="container mx-auto px-1 lg:px-2">
        <h1 class="text-xl sm:text-2xl font-bold">好！來健身 管理資訊平台</h1>
      </div>
    </header>
    <main class="py-6 w-full">
      <div class="container mx-auto px-1 lg:px-2">
        <router-view />
      </div>
    </main>
    <footer
      class="py-4 mt-8 w-full"
      :style="{
        backgroundColor: 'var(--color-card-bg)',
        color: 'var(--color-text-secondary)',
      }"
    >
      <div class="container mx-auto px-1 lg:px-2 text-center">
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

/* 針對 6.3 吋手機螢幕 (約 375px-414px) 優化 */
@media (min-width: 375px) and (max-width: 414px) {
  .container {
    padding-left: 0.25rem;
    padding-right: 0.25rem;
  }
}

/* 針對較大的手機螢幕 (414px-768px) */
@media (min-width: 414px) and (max-width: 768px) {
  .container {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}

/* 針對桌面螢幕 */
@media (min-width: 1024px) {
  .container {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
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
