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
          @click="openCoachListModal"
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

      <!-- 教練列表區塊（僅 Founder 可見） -->
      <CoachDisplayList
        v-if="isFounder"
        :coaches="filteredCoaches"
        @view-trainees="handleViewTrainees"
      />
    </div>

    <!-- 教練列表 Modal -->
    <CoachListModal
      :is-open="isCoachListModalOpen"
      :coaches="filteredCoaches"
      @close="closeCoachListModal"
      @create="handleCreateCoach"
      @update="handleUpdateCoach"
    />

    <!-- 教練負責學員 Modal -->
    <CoachTraineesModal
      :is-open="isCoachTraineesModalOpen"
      :coach="selectedCoach"
      :trainees="trainees"
      @close="closeCoachTraineesModal"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useCoachStore } from "../stores/coach";
import TraineeList from "../components/TraineeList.vue";
import CoachDisplayList from "../components/CoachListView.vue";
import LoadingState from "../components/LoadingState.vue";
import CoachListModal from "../components/CoachListManage.vue";
import CoachTraineesModal from "../components/CoachTraineesView.vue";
import type { Trainee } from "../services/trainee";
import type { Coach, CreateCoach, UpdateCoach } from "../services/coach";

const router = useRouter();
const coachStore = useCoachStore();

// Modal 狀態
const isCoachListModalOpen = ref<boolean>(false);
const isCoachTraineesModalOpen = ref<boolean>(false);
const selectedCoach = ref<Coach | null>(null);

// 使用 store 的狀態，而不是本地 ref
const currentCoach = computed(() => coachStore.currentCoach);
const trainees = computed(() => coachStore.trainees);
const coaches = computed(() => coachStore.coaches);
const isLoading = computed(() => coachStore.loading);
const errorMessage = computed(() => coachStore.error);

// 檢查是否為 Founder
const isFounder = computed(() => currentCoach.value?.coachType === "Founder");

// 過濾掉當前教練自己的教練列表
const filteredCoaches = computed(() => {
  if (!currentCoach.value) return coaches.value;
  return coaches.value.filter((coach) => coach.id !== currentCoach.value?.id);
});

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
  try {
    const routeState = history.state;
    const coachId = Number(routeState?.id);

    if (!coachId || Number.isNaN(coachId)) {
      throw new Error("缺少有效的教練 ID");
    }

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
 * 開啟教練列表 Modal
 */
const openCoachListModal = async (): Promise<void> => {
  // 載入教練列表
  await coachStore.fetchCoaches();
  isCoachListModalOpen.value = true;
};

/**
 * 關閉教練列表 Modal
 */
const closeCoachListModal = (): void => {
  isCoachListModalOpen.value = false;
};

/**
 * 建立教練
 */
const handleCreateCoach = async (data: CreateCoach): Promise<void> => {
  const success = await coachStore.createCoach(data);
  if (success) {
    // 成功後不需要手動關閉 modal，CoachListModal 會自動處理
  }
};

/**
 * 更新教練
 */
const handleUpdateCoach = async (data: UpdateCoach): Promise<void> => {
  const success = await coachStore.updateCoach(data);
  if (success) {
    // 成功後不需要手動關閉 modal，CoachListModal 會自動處理
  }
};

/**
 * 查看教練負責的學員資訊
 */
const handleViewTrainees = (coach: Coach): void => {
  selectedCoach.value = coach;
  isCoachTraineesModalOpen.value = true;
};

/**
 * 關閉教練學員 Modal
 */
const closeCoachTraineesModal = (): void => {
  isCoachTraineesModalOpen.value = false;
  selectedCoach.value = null;
};
</script>
