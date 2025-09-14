<template>
  <div class="w-full">
    <div class="flex flex-col md:flex-row justify-between items-center mb-4">
      <h1 class="text-3xl font-bold">教練管理介面</h1>
      <div class="flex items-center gap-4 mt-2 md:mt-0">
        <div v-if="currentCoach" class="badge badge-primary badge-lg">
          {{ currentCoach.name }}
        </div>
        <button @click="navigateToOpeningCourse" class="btn btn-outline btn-sm">
          <svg
            class="h-4 w-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
          開放團體課程
        </button>
      </div>
    </div>

    <LoadingState :loading="isLoading" :error="errorMessage || ''" />

    <div v-if="!isLoading && !errorMessage" class="w-full">
      <TraineeList
        :trainees="trainees"
        @update="navigateToUpdate"
        @adjust="navigateToAdjust"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCoachStore } from "../stores/coach";
import TraineeList from "../components/TraineeList.vue";
import LoadingState from "../components/LoadingState.vue";
import type { Trainee } from "../services/trainee";

const router = useRouter();
const coachStore = useCoachStore();

// 使用 store 的狀態，而不是本地 ref
const currentCoach = computed(() => coachStore.currentCoach);
const trainees = computed(() => coachStore.trainees);
const isLoading = computed(() => coachStore.loading);
const errorMessage = computed(() => coachStore.error);

/**
 * 初始化教練和學員資料
 */
const initializeData = async (): Promise<void> => {
  try {
    const routeState = history.state;
    const coachId = Number(routeState?.id);

    if (!coachId || Number.isNaN(coachId)) {
      throw new Error("缺少有效的教練 ID");
    }

    // 並行載入教練和學員資料
    await Promise.all([coachStore.fetchById(coachId), coachStore.fetchAll()]);

    if (!currentCoach.value) {
      throw new Error("無法獲取教練資料");
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "發生錯誤，請稍後再試";
    console.error("Failed to initialize coach data:", err);
    // Store 會自動處理錯誤狀態，這裡不需要額外處理
  }
};

onMounted(initializeData);

/**
 * 導航到學員更新頁面
 */
const navigateToUpdate = (trainee: Trainee): void => {
  try {
    router.push({
      path: "/trainee/info",
      state: {
        id: trainee.id,
        coach: true,
        register: false,
      },
    });
  } catch (error) {
    console.error("Failed to navigate to trainee update:", error);
  }
};

/**
 * 導航到訓練計畫調整頁面
 */
const navigateToAdjust = (trainee: Trainee): void => {
  if (!currentCoach.value) {
    console.warn("No current coach available for navigation");
    return;
  }

  try {
    router.push({
      path: "/plan",
      state: {
        editor: currentCoach.value.id,
        id: trainee.id,
      },
    });
  } catch (error) {
    console.error("Failed to navigate to training plan:", error);
  }
};

/**
 * 導航到公開課程頁面
 */
const navigateToOpeningCourse = (): void => {
  try {
    router.push({
      path: "/opening-course",
    });
  } catch (error) {
    console.error("Failed to navigate to opening course:", error);
  }
};
</script>
