<template>
  <div class="w-full">
    <!-- 載入中狀態 -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div
        class="loading loading-spinner"
        :class="getLoadingSizeClass()"
        :style="{ color: getLoadingColor() }"
      ></div>
      <div class="ml-2" :style="{ color: 'var(--color-text)' }">
        {{ loadingText }}
      </div>
    </div>

    <!-- 錯誤狀態 -->
    <div v-if="error" class="alert mt-4" :style="getErrorAlertStyle()">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- 空狀態 -->
    <div v-if="isEmpty" class="flex flex-col justify-center items-center py-8">
      <svg
        class="w-16 h-16 mx-auto opacity-50 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        :style="{ color: 'var(--color-text)' }"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        ></path>
      </svg>
      <p class="text-lg opacity-70" :style="{ color: 'var(--color-text)' }">
        {{ emptyText }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  loading: boolean;
  error: string;
  isEmpty?: boolean;
  loadingText?: string;
  emptyText?: string;
  loadingSize?: "sm" | "md" | "lg";
  loadingColor?: string;
  errorType?: "error" | "warning" | "info";
}

const props = withDefaults(defineProps<Props>(), {
  isEmpty: false,
  loadingText: "載入中...",
  emptyText: "目前沒有資料",
  loadingSize: "lg",
  loadingColor: "var(--color-primary)",
  errorType: "error",
});

/**
 * 獲取載入動畫的大小類別
 */
const getLoadingSizeClass = (): string => {
  const sizeMap: Record<string, string> = {
    sm: "loading-sm",
    md: "loading-md",
    lg: "loading-lg",
  };

  return sizeMap[props.loadingSize] || "loading-lg";
};

/**
 * 獲取載入動畫的顏色
 */
const getLoadingColor = (): string => {
  return props.loadingColor;
};

/**
 * 獲取錯誤提示的樣式
 */
const getErrorAlertStyle = () => {
  const colorMap: Record<string, string> = {
    error: "var(--color-error)",
    warning: "var(--color-warning)",
    info: "var(--color-info)",
  };

  const backgroundColor = colorMap[props.errorType] || "var(--color-error)";

  return {
    backgroundColor,
    color: "#fff",
  };
};
</script>
