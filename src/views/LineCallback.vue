<!--
  LINE登入回調頁面組件
  
  此組件負責處理LINE OAuth登入流程的回調處理：
  1. 接收LINE授權碼
  2. 交換access token
  3. 獲取用戶資料
  4. 更新用戶狀態並跳轉到主頁面
  
  @author Management Web Team
  @version 1.0.0
-->
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
// Vue 3 Composition API 相關匯入
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import type { Router } from "vue-router";

// 業務邏輯相關匯入
import { useViewerStore } from "../stores/viewer";
import { createLineLoginService } from "../services/line-login";
import { lineApi } from "../services/api-line";

// 組件相關匯入
import LoadingState from "../components/LoadingState.vue";

// 初始化 Vue Router 實例
const router: Router = useRouter();

// 初始化用戶狀態管理 store
const viewerStore = useViewerStore();

// 初始化 LINE 登入服務
const lineLoginService = createLineLoginService();

// 響應式狀態變數
const isLoading = ref<boolean>(true); // 載入狀態
const errorMessage = ref<string | null>(null); // 錯誤訊息

/**
 * 處理LINE登入回調流程
 *
 * 此函數負責完整的LINE OAuth登入流程：
 * 1. 檢查URL參數中是否有錯誤
 * 2. 提取授權碼
 * 3. 使用授權碼交換access token
 * 4. 使用access token獲取用戶資料
 * 5. 更新用戶狀態並跳轉到主頁面
 *
 * @throws {Error} 當登入流程中任何步驟失敗時拋出錯誤
 */
const handleLineCallback = async (): Promise<void> => {
  try {
    // 步驟1：檢查URL參數中是否有錯誤訊息
    if (lineLoginService.hasError()) {
      const error = lineLoginService.getErrorMessage();
      throw new Error(error || "LINE登入過程中發生錯誤");
    }

    // 步驟2：從URL參數中提取LINE授權碼
    const code = lineLoginService.extractAuthorizationCode();
    if (!code) {
      throw new Error("未收到LINE授權碼");
    }

    // 步驟3：使用授權碼向LINE API交換access token
    const redirectUri = `${window.location.origin}/line-callback`;
    const tokenResponse = await lineApi.exchangeLineCodeForToken(
      code,
      redirectUri
    );

    // 步驟4：使用access token獲取LINE用戶資料
    const userProfile = await lineApi.getLineUserInfo(
      tokenResponse.access_token
    );

    // 步驟5：更新用戶狀態並導航到主頁面
    await navigateToMainPage(userProfile.sub);
  } catch (error) {
    // 錯誤處理：將錯誤訊息顯示給用戶
    errorMessage.value =
      error instanceof Error ? error.message : "LINE登入失敗，請稍後再試";
  } finally {
    // 無論成功或失敗，都要結束載入狀態
    isLoading.value = false;
  }
};

/**
 * 導航到主頁面
 *
 * 此函數負責處理登入成功後的用戶狀態更新和頁面跳轉：
 * 1. 將LINE用戶的social ID儲存到store
 * 2. 根據social ID獲取系統中的用戶資料
 * 3. 驗證用戶是否已註冊
 * 4. 跳轉到主頁面
 *
 * @param socialId - LINE用戶的唯一識別碼
 * @throws {Error} 當用戶未註冊或獲取用戶資料失敗時拋出錯誤
 */
const navigateToMainPage = async (socialId: string): Promise<void> => {
  try {
    // 步驟1：將LINE用戶的social ID儲存到viewer store
    viewerStore.setSocialId(socialId);

    // 步驟2：根據social ID從後端獲取用戶資料
    const userId = await viewerStore.fetchBySocialId(socialId);

    // 步驟3：驗證用戶是否已在系統中註冊
    if (userId === null) {
      throw new Error("無法獲取用戶資料，請確認您已註冊");
    }

    // 步驟4：跳轉到應用程式主頁面
    router.push(`/`);
  } catch (error) {
    // 重新拋出錯誤，讓上層函數處理
    throw new Error(error instanceof Error ? error.message : "頁面跳轉失敗");
  }
};

// 組件掛載時自動執行LINE登入回調處理
onMounted(handleLineCallback);
</script>
