<template>
  <div class="w-full">
    <div class="flex flex-col md:flex-row justify-between items-center mb-4">
      <h1 class="text-3xl font-bold">教練管理介面</h1>
      <div class="flex items-center gap-4 mt-2 md:mt-0">
        <div v-if="currentCoach" class="badge badge-primary badge-lg">
          {{ currentCoach.name }}
        </div>
        <!-- 只有 Founder 可以使用管理教練功能 -->
        <button
          v-if="isFounder"
          @click="navigateToCoachManage"
          class="btn btn-outline btn-sm"
        >
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            ></path>
          </svg>
          管理教練
        </button>
        <!-- 只有 Founder 可以使用管理團體課程功能 -->
        <button
          v-if="isFounder"
          @click="navigateToOpeningCourse"
          class="btn btn-outline btn-sm"
        >
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
          管理團體課程
        </button>
      </div>
    </div>

    <LoadingState :loading="isLoading" :error="errorMessage || ''" />

    <div v-if="!isLoading && !errorMessage" class="w-full">
      <TraineeList
        :trainees="filteredTrainees"
        :can-manage-plan="isFounder"
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

// 檢查是否為 Founder
const isFounder = computed(() => currentCoach.value?.coachType === "Founder");

// 根據教練類型過濾學員列表
const filteredTrainees = computed(() => {
  if (!currentCoach.value) return trainees.value;

  // Founder 可以看到所有學員
  if (isFounder.value) {
    return trainees.value;
  }

  // 非 Founder 只能看到自己負責的學員
  return trainees.value.filter((trainee) => {
    // 檢查學員的訓練計畫中是否有任何一個計畫的教練是當前教練
    return trainee.trainingPlan.some(
      (plan) => plan.coach?.id === currentCoach.value?.id
    );
  });
});

/**
 * 初始化教練和學員資料
 */
const initializeData = async (): Promise<void> => {
  const routeState = history.state;
  const coachId = Number(routeState?.id);

  // 檢查必要參數，如果沒有則重定向回首頁
  if (!coachId || Number.isNaN(coachId)) {
    router.replace("/");
    return;
  }

  try {
    // 並行載入教練和學員資料
    await Promise.all([
      coachStore.fetchCoachById(coachId),
      coachStore.fetchAll(),
      coachStore.fetchCoaches(),
    ]);

    if (!currentCoach.value) {
      throw new Error("無法獲取教練資料");
    }
  } catch (err: unknown) {
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
        coachId: currentCoach.value?.id || -1, // 傳遞教練 ID
        register: false,
        showRecords: true,
        showPlans: false,
      },
    });
  } catch (error) {
    // 導航失敗，靜默處理
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
        showRecords: false,
        showPlans: true,
      },
    });
  } catch (error) {
    // 導航失敗，靜默處理
  }
};

/**
 * 導航到團體課程頁面
 */
const navigateToOpeningCourse = (): void => {
  try {
    router.push({
      path: "/opening-course",
    });
  } catch (error) {
    // 導航失敗，靜默處理
  }
};

/**
 * 導航到教練管理頁面
 */
const navigateToCoachManage = (): void => {
  router.push({ path: "/coach/manage" });
};

</script>
