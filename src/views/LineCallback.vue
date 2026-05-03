<template>
  <!-- 全螢幕居中容器 -->
  <div class="w-full min-h-screen flex items-center justify-center">
    <!-- 登入狀態卡片 -->
    <div
      class="card shadow-xl max-w-md w-full mx-4"
      :style="{
        backgroundColor: 'var(--color-card-bg)',
        color: 'var(--color-text)',
      }"
    >
      <div class="card-body text-center">
        <!-- 載入狀態組件：顯示載入中或錯誤訊息 -->
        <LoadingState :loading="isLoading" :error="errorMessage || ''" />

        <!-- 登入成功狀態：當載入完成且無錯誤時顯示 -->
        <div v-if="!isLoading && !errorMessage" class="space-y-4">
          <div class="text-6xl">✅</div>
          <h2 class="text-xl font-bold">LINE登入成功</h2>
          <p class="text-sm opacity-75">正在為您跳轉...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { createLineLoginService } from "../services/line-login";
import LoadingState from "../components/LoadingState.vue";
import {
  LINE_AUTH_MESSAGE_TYPE,
  processLineAuthCode,
  type LineAuthMessage,
} from "../services/line-auth-flow";

const lineLoginService = createLineLoginService();

const isLoading = ref<boolean>(true);
const errorMessage = ref<string | null>(null);

const isInPopup = (): boolean => {
  try {
    return !!window.opener && window.opener !== window && !window.opener.closed;
  } catch {
    return false;
  }
};

const postResultToOpener = (): void => {
  try {
    const params = new URLSearchParams(window.location.search);
    const message: LineAuthMessage = {
      type: LINE_AUTH_MESSAGE_TYPE,
      code: params.get("code") ?? undefined,
      state: params.get("state") ?? undefined,
      error:
        params.get("error_description") ?? params.get("error") ?? undefined,
    };
    window.opener?.postMessage(message, window.location.origin);
  } catch {
    // 無法 postMessage 時仍嘗試關閉視窗
  }
  window.close();
};

const handleLineCallback = async (): Promise<void> => {
  // 在彈窗內 → 把結果丟回主視窗後關閉，主視窗會接手後續流程
  if (isInPopup()) {
    postResultToOpener();
    return;
  }

  // 整頁 fallback：popup 被擋掉或從非彈窗環境進入時走這條路徑
  try {
    if (lineLoginService.hasError()) {
      throw new Error(
        lineLoginService.getErrorMessage() || "LINE登入過程中發生錯誤"
      );
    }

    const code = lineLoginService.extractAuthorizationCode();
    if (!code) {
      throw new Error("未收到LINE授權碼");
    }

    await processLineAuthCode(code, lineLoginService.extractState());
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "LINE登入失敗，請稍後再試";
  } finally {
    isLoading.value = false;
  }
};

onMounted(handleLineCallback);
</script>
