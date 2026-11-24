<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200">
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body items-center text-center">
        <h2 class="card-title text-2xl mb-2">綁定教練帳號</h2>
        <p class="text-sm opacity-75 mb-6">請使用 LINE 登入以綁定您的教練帳號</p>

        <LoadingState :loading="isLoading" :error="errorMessage || ''" />

        <!-- LINE 登入按鈕 -->
        <div v-if="!isLoading && !errorMessage && !isBinding" class="w-full">
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
            <span>{{ isLineLoginLoading ? "登入中..." : "使用 LINE 綁定" }}</span>
          </button>
        </div>

        <!-- 正在綁定狀態 -->
        <div v-if="isBinding" class="space-y-4">
          <div class="loading loading-spinner loading-lg"></div>
          <p class="text-sm opacity-75">正在綁定帳號...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import {
  createLineLoginService,
  LOGIN_FAILED_MESSAGE,
} from "../services/line-login";
import {
  beginLineLogin,
  clearPendingIfStateMatches,
  clearPendingLineLogin,
  SessionStorageUnavailableError,
  STORAGE_BLOCKED_MESSAGE,
} from "../utils/line-state";
import LoadingState from "../components/LoadingState.vue";
import {
  LINE_AUTH_MESSAGE_TYPE,
  openLineLoginPopup,
  POPUP_CLOSED_GRACE_MS,
  processLineAuthCode,
  resolveLineAuthError,
  type LineAuthMessage,
} from "../services/line-auth-flow";

const lineLoginService = createLineLoginService();

const isLineLoginLoading = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const errorMessage = ref<string | null>(null);
const isBinding = ref<boolean>(false);

/**
 * 從 URL 或 state 獲取教練 ID
 */
const route = useRoute();

const getCoachId = (): number | null => {
  const coachIdParam = route.query.coachId as string;
  const coachId = Number(coachIdParam);
  return Number.isInteger(coachId) && coachId > 0 ? coachId : null;
};

// 目前進行中的登入監聽（開始新登入前與元件卸載時要先清掉，避免 listener / timer 外洩）
let activeCleanup: (() => void) | null = null;
// 已開啟但尚未收到結果的 popup；收到訊息（開始交換）或 popup 已關閉後會設為 null
let activePopup: Window | null = null;

/** 中止進行中的登入：清掉監聽，並關閉仍開著的 popup 與尚未使用的 pending */
const abortActiveLogin = (): void => {
  activeCleanup?.();
  if (activePopup) {
    try {
      activePopup.close();
    } catch {
      // 無法關閉時忽略
    }
    clearPendingLineLogin();
    activePopup = null;
  }
};

/**
 * 處理 LINE 登入：在彈窗中開啟授權頁，主頁面 history 不會被汙染
 */
const handleLineLogin = (): void => {
  abortActiveLogin();

  try {
    isLineLoginLoading.value = true;

    const coachId = getCoachId();
    if (!coachId) {
      errorMessage.value = "未找到教練 ID，請重新操作";
      isLineLoginLoading.value = false;
      return;
    }

    // 先寫入 pending（state / nonce / coachId），再開啟視窗
    let loginUrl: string;
    let expectedState: string;
    try {
      const { state, nonce } = beginLineLogin("bind-coach", { coachId });
      expectedState = state;
      loginUrl = lineLoginService.generateLoginUrl(state, nonce);
    } catch (err) {
      errorMessage.value =
        err instanceof SessionStorageUnavailableError
          ? STORAGE_BLOCKED_MESSAGE
          : LOGIN_FAILED_MESSAGE;
      isLineLoginLoading.value = false;
      return;
    }

    const popup = openLineLoginPopup(loginUrl);
    if (!popup) {
      window.location.replace(loginUrl);
      return;
    }

    activePopup = popup;

    let closedPoller: number | null = null;
    let graceTimer: number | null = null;

    const cleanup = (): void => {
      window.removeEventListener("message", handleMessage);
      if (closedPoller !== null) {
        window.clearInterval(closedPoller);
        closedPoller = null;
      }
      if (graceTimer !== null) {
        window.clearTimeout(graceTimer);
        graceTimer = null;
      }
      if (activeCleanup === cleanup) activeCleanup = null;
    };
    activeCleanup = cleanup;

    const handleMessage = async (event: MessageEvent): Promise<void> => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== popup) return;
      const data = event.data as LineAuthMessage | undefined;
      if (!data || data.type !== LINE_AUTH_MESSAGE_TYPE) return;
      // 忽略 state 不符的訊息（例如重複使用的 popup 送來的舊訊息），不影響目前流程
      if (data.state !== expectedState) return;

      // 在任何 await 之前同步 cleanup，避免與 closedPoller 競態
      cleanup();
      activePopup = null;

      if (data.error !== undefined) {
        // 只依 error 代碼顯示固定訊息；state 相符才清除 pending
        errorMessage.value = resolveLineAuthError(data.error, data.state);
        isLineLoginLoading.value = false;
        return;
      }
      if (!data.code) {
        clearPendingIfStateMatches(data.state ?? null);
        errorMessage.value = "未收到LINE授權碼";
        isLineLoginLoading.value = false;
        return;
      }

      try {
        isBinding.value = true;
        await processLineAuthCode(data.code, data.state ?? null);
      } catch (err) {
        errorMessage.value =
          err instanceof Error ? err.message : "綁定失敗，請稍後再試";
        isLineLoginLoading.value = false;
        isBinding.value = false;
      }
    };

    window.addEventListener("message", handleMessage);

    // 使用者手動關閉彈窗：先停止 poller，寬限一段時間再 cleanup，
    // 讓已排入佇列的 message 事件仍能被處理（不清除 pending，交給 TTL 與下一次登入覆蓋）
    closedPoller = window.setInterval(() => {
      if (popup.closed) {
        if (closedPoller !== null) {
          window.clearInterval(closedPoller);
          closedPoller = null;
        }
        graceTimer = window.setTimeout(() => {
          cleanup();
          activePopup = null;
          isLineLoginLoading.value = false;
        }, POPUP_CLOSED_GRACE_MS);
      }
    }, 500);
  } catch (error) {
    isLineLoginLoading.value = false;
    errorMessage.value = LOGIN_FAILED_MESSAGE;
    console.error("LINE login error:", error);
  }
};

onBeforeUnmount(abortActiveLogin);

/**
 * 初始化頁面
 */
const initializePage = (): void => {
  // 檢查是否有教練 ID
  const coachId = getCoachId();
  if (!coachId) {
    errorMessage.value = "缺少教練 ID，請從正確的頁面進入";
  }
};

onMounted(initializePage);
</script>
