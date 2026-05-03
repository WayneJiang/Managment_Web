<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ThemeService } from "./services/theme.service";

const route = useRoute();
const router = useRouter();

const hideBackButton = computed(() =>
  ["Home", "LineCallback", "CoachInfo"].includes(
    String(route.name ?? "")
  )
);

const goBack = (): void => {
  if (window.history.state?.back) {
    router.back();
  } else {
    router.push("/");
  }
};

onMounted(() => {
  ThemeService.getInstance();
});
</script>

<template>
  <div
    class="min-h-screen w-full liquid-glass-bg"
    :style="{ color: 'var(--color-text)' }"
  >
    <header class="glass-header py-4 w-full sticky top-0 z-50">
      <div class="container mx-auto px-1 lg:px-2 flex items-center gap-3">
        <button
          v-if="!hideBackButton"
          @click="goBack"
          class="btn btn-ghost btn-sm text-white gap-1 px-2 back-btn"
          aria-label="返回上一頁"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span class="hidden sm:inline">返回</span>
        </button>
        <h1 class="text-lg sm:text-xl font-bold text-white">好！來健身</h1>
      </div>
    </header>
    <main class="py-6 w-full">
      <div class="container mx-auto px-1 lg:px-2">
        <router-view v-slot="{ Component }">
          <keep-alive :include="['CoachInfo']">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </main>
    <footer class="glass-footer py-4 mt-8 w-full"
      :style="{ color: 'var(--color-text-secondary)' }"
    >
      <div class="container mx-auto px-1 lg:px-2 text-center">
        <p>&copy; 好！來健身 版權所有</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  max-width: 100%;
}

.back-btn,
.back-btn:hover,
.back-btn:focus,
.back-btn:focus-visible,
.back-btn:active,
.back-btn.btn-active {
  background-color: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
  outline: none !important;
  color: #fff !important;
  transform: none !important;
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
