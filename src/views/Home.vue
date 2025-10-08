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
        <LoadingState :loading="isLoading" :error="errorMessage || ''" />
        <p
          v-if="!isLoading && !errorMessage && viewerStore.socialId"
          class="mt-4"
        >
          正在檢查身份...
        </p>
        <div
          v-if="!isLoading && !errorMessage && !viewerStore.socialId"
          class="mt-6 space-y-4"
        >
          <p :style="{ color: 'var(--color-error)' }" class="mb-4">
            請選擇登入方式
          </p>

          <!-- LINE LOGIN 按鈕 -->
          <button
            @click="handleLineLogin"
            class="btn btn-primary w-full flex items-center justify-center gap-3"
            :disabled="isLineLoginLoading"
          >
            <div
              v-if="isLineLoginLoading"
              class="loading loading-spinner loading-sm"
            ></div>
            <svg v-else class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"
              />
            </svg>
            <span>{{ isLineLoginLoading ? "登入中..." : "使用LINE登入" }}</span>
          </button>

          <!-- 分隔線 -->
          <div class="divider">或</div>

          <!-- 原有方式提示 -->
          <p class="text-sm opacity-75">您也可以透過LINE連結訪問本頁面</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useViewerStore } from "../stores/viewer";
import { createLineLoginService } from "../services/line-login";
import LoadingState from "../components/LoadingState.vue";
import type { Router } from "vue-router";

const router: Router = useRouter();
const viewerStore = useViewerStore();
const lineLoginService = createLineLoginService();

// 使用 store 的狀態
const isLoading = computed(() => viewerStore.loading);
const errorMessage = computed(() => viewerStore.error);

// LINE登入相關狀態
const isLineLoginLoading = ref<boolean>(false);

/**
 * 清理 URL 參數，避免顯示 socialId
 */
const cleanUrlParameters = (): void => {
  const url = new URL(window.location.href);
  if (url.searchParams.has("socialId")) {
    url.searchParams.delete("socialId");
    window.history.replaceState({}, document.title, url.toString());
  }
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
          id: viewerStore.socialId,
          coach: false,
          register: true,
        },
      });
    }
  } catch (error) {
    // 導航失敗，靜默處理
  }
};

/**
 * 初始化使用者身份檢查
 */
const initializeUserCheck = async (): Promise<void> => {
  // 如果 store 中已經有 socialId，直接進行身份檢查
  if (viewerStore.socialId) {
    try {
      const userId = await viewerStore.fetchBySocialId(viewerStore.socialId);
      navigateBasedOnRole(userId);
    } catch (err: unknown) {
      // Store 會自動處理錯誤狀態
    }
    return;
  }

  // 檢查 URL 參數中是否有 socialId（來自 LINE 回調）
  const urlParams = new URLSearchParams(window.location.search);
  const extractedSocialId = urlParams.get("socialId");

  if (!extractedSocialId) {
    // 沒有 socialId，顯示登入選項
    return;
  }

  // 清理 URL 參數
  cleanUrlParameters();

  try {
    const userId = await viewerStore.fetchBySocialId(extractedSocialId);
    navigateBasedOnRole(userId);
  } catch (err: unknown) {
    // Store 會自動處理錯誤狀態
  }
};

/**
 * 處理LINE登入
 */
const handleLineLogin = (): void => {
  try {
    isLineLoginLoading.value = true;

    // 生成LINE登入URL並跳轉
    const loginUrl = lineLoginService.generateLoginUrl();
    window.location.href = loginUrl;
  } catch (error) {
    isLineLoginLoading.value = false;
  }
};

onMounted(initializeUserCheck);
</script>
