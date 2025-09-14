<template>
  <div class="w-full">
    <div
      class="card shadow-xl"
      :style="{
        backgroundColor: 'var(--color-card-bg)',
        color: 'var(--color-text)',
      }"
    >
      <div class="card-body text-center">
        <h1
          class="text-3xl font-bold"
          :style="{ color: 'var(--color-primary)' }"
        >
          管理資訊平台
        </h1>
        <LoadingState :loading="isLoading" :error="errorMessage || ''" />
        <p v-if="!isLoading && !errorMessage && socialId" class="mt-4">
          正在檢查身份...
        </p>
        <p
          v-if="!isLoading && !errorMessage && !socialId"
          :style="{ color: 'var(--color-error)' }"
          class="mt-4"
        >
          請透過LINE連結訪問本頁面
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useViewerStore } from "../stores/viewer";
import LoadingState from "../components/LoadingState.vue";
import type { Router } from "vue-router";

const router: Router = useRouter();
const viewerStore = useViewerStore();

// 使用 store 的狀態，而不是本地 ref
const isLoading = computed(() => viewerStore.loading);
const errorMessage = computed(() => viewerStore.error);

// 保留 socialId 作為本地狀態，因為它來自 URL 參數
const socialId = ref<string>("");

/**
 * 從 URL 參數中提取 socialId
 */
const extractSocialIdFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("socialId");
};

/**
 * 根據使用者身份導航到相應頁面
 */
const navigateBasedOnRole = (userId: number | null): void => {
  try {
    if (viewerStore.isTrainee) {
      router.push({
        path: "/trainee/info",
        state: {
          id: userId,
          coach: false,
          register: false,
        },
      });
    } else if (viewerStore.isCoach) {
      router.push({
        path: "/coach",
        state: {
          id: userId,
          coach: true,
        },
      });
    } else {
      // 新使用者，導航到註冊頁面
      router.push({
        path: "/trainee/info",
        state: {
          id: socialId.value,
          coach: false,
          register: true,
        },
      });
    }
  } catch (error) {
    console.error("Failed to navigate based on role:", error);
  }
};

/**
 * 初始化使用者身份檢查
 */
const initializeUserCheck = async (): Promise<void> => {
  const extractedSocialId = extractSocialIdFromUrl();

  if (!extractedSocialId) {
    console.warn("No socialId found in URL parameters");
    return;
  }

  socialId.value = extractedSocialId;

  try {
    const userId = await viewerStore.fetchBySocialId(extractedSocialId);
    navigateBasedOnRole(userId);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "發生錯誤，請稍後再試";
    console.error("Failed to initialize user check:", err);
    // Store 會自動處理錯誤狀態
  }
};

onMounted(initializeUserCheck);
</script>
