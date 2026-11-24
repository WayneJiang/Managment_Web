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
        <div
          v-if="!isLoading && !errorMessage && !popupStuck"
          class="space-y-4"
        >
          <div class="text-6xl">✅</div>
          <h2 class="text-xl font-bold">LINE登入成功</h2>
          <p class="text-sm opacity-75">正在為您跳轉...</p>
        </div>

        <!-- 彈窗無法自行關閉：停止轉圈，提示並提供按鈕 -->
        <div v-if="popupStuck" class="space-y-4">
          <p class="text-sm">請關閉此視窗，回到原本的頁面繼續。</p>
          <button class="btn btn-primary" @click="closeOrReturn">
            關閉視窗
          </button>
        </div>

        <!-- 整頁流程發生錯誤或取消時，提供返回按鈕 -->
        <a
          v-if="!isLoading && errorMessage"
          :href="returnTarget"
          class="btn btn-primary mt-4"
        >
          返回
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import {
  clearPendingIfStateMatches,
  clearPendingLineLogin,
  peekPendingPurpose,
} from "../utils/line-state";
import { LOGIN_FAILED_MESSAGE } from "../services/line-login";
import LoadingState from "../components/LoadingState.vue";
import {
  LINE_AUTH_MESSAGE_TYPE,
  LINE_LOGIN_POPUP_NAME,
  processLineAuthCode,
  resolveLineAuthError,
  type LineAuthMessage,
} from "../services/line-auth-flow";

const isLoading = ref<boolean>(true);
const errorMessage = ref<string | null>(null);

const returnTarget = ref<string>("/");
const popupStuck = ref<boolean>(false);

const POPUP_POST_FAILED_MESSAGE =
  "無法將登入結果傳回原頁面，請回到原頁面重新操作";
const ORPHAN_POPUP_MESSAGE = "原本的登入頁面已關閉，請回到原頁面重新操作";

const isInPopup = (): boolean => {
  try {
    return (
      !!window.opener &&
      window.opener !== window &&
      !window.opener.closed &&
      // 跨來源的 opener 讀取 location 會丟例外 → 視為非彈窗
      window.opener.location.origin === window.location.origin
    );
  } catch {
    return false;
  }
};

interface CallbackParams {
  code: string | null;
  state: string | null;
  error: string | null;
}

const readCallbackParams = (): CallbackParams => {
  const params = new URLSearchParams(window.location.search);
  return {
    code: params.get("code"),
    state: params.get("state"),
    // 只取 error 代碼；絕不讀取或顯示 error_description 等 URL 文字
    error: params.get("error"),
  };
};

const timers: number[] = [];
const later = (fn: () => void, ms: number): void => {
  timers.push(window.setTimeout(fn, ms));
};
onBeforeUnmount(() => timers.forEach((t) => window.clearTimeout(t)));

const postResultToOpener = (params: CallbackParams): void => {
  try {
    const message: LineAuthMessage = {
      type: LINE_AUTH_MESSAGE_TYPE,
      code: params.code ?? undefined,
      state: params.state ?? undefined,
      error: params.error ?? undefined,
    };
    window.opener?.postMessage(message, window.location.origin);
  } catch {
    // 結果沒送回主視窗：不要顯示「請關閉視窗」的成功提示，改顯示錯誤
    errorMessage.value = POPUP_POST_FAILED_MESSAGE;
    isLoading.value = false;
    return;
  }
  window.close();
  // window.close() 可能被瀏覽器擋下：稍後仍在的話就停止轉圈並提示
  later(() => {
    popupStuck.value = true;
    isLoading.value = false;
  }, 500);
};

const closeOrReturn = (): void => {
  window.close();
  later(() => window.location.replace("/"), 300);
};

/** 依 pending 的 purpose 決定整頁流程失敗或取消時的返回目標 */
const resolveReturnTarget = (): string => {
  const pending = peekPendingPurpose();
  const coachId = Number(pending?.data?.coachId);
  if (pending?.purpose === "bind-coach" && Number.isFinite(coachId) && coachId > 0) {
    return `/bind?coachId=${encodeURIComponent(String(coachId))}`;
  }
  return "/";
};

const handleLineCallback = async (): Promise<void> => {
  // 先讀取參數，再立即清除網址上的 code / state / error
  const params = readCallbackParams();
  window.history.replaceState(
    window.history.state,
    "",
    window.location.pathname
  );

  // 彈窗視窗但 opener 已關閉或為跨來源：不退回整頁流程，清除 pending 並停止
  if (window.name === LINE_LOGIN_POPUP_NAME && !isInPopup()) {
    clearPendingLineLogin();
    errorMessage.value = ORPHAN_POPUP_MESSAGE;
    isLoading.value = false;
    return;
  }

  // 在彈窗內 → 把結果丟回主視窗後關閉，主視窗會接手後續流程
  if (isInPopup()) {
    postResultToOpener(params);
    return;
  }

  // 整頁 fallback：popup 被擋掉或從非彈窗環境進入時走這條路徑
  returnTarget.value = resolveReturnTarget();
  try {
    if (params.error !== null) {
      throw new Error(resolveLineAuthError(params.error, params.state));
    }

    if (!params.code) {
      clearPendingIfStateMatches(params.state);
      throw new Error("未收到LINE授權碼");
    }

    await processLineAuthCode(params.code, params.state);
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : LOGIN_FAILED_MESSAGE;
  } finally {
    isLoading.value = false;
  }
};

onMounted(handleLineCallback);
</script>
