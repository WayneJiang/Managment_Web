<template>
  <div class="w-full">
    <div class="flex flex-col md:flex-row justify-between items-center mb-4">
      <h1 class="text-xl font-bold">教練儀表板</h1>
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
import { useNavigationStore } from "../stores/navigation";
import TraineeList from "../components/TraineeList.vue";
import LoadingState from "../components/LoadingState.vue";
import type { Trainee } from "../services/trainee";

const router = useRouter();
const coachStore = useCoachStore();

const currentCoach = computed(() => coachStore.currentCoach);
const trainees = computed(() => coachStore.trainees);
const isLoading = computed(() => coachStore.loading);
const errorMessage = computed(() => coachStore.error);
const isFounder = computed(() => currentCoach.value?.coachType === "Founder");

const filteredTrainees = computed(() => {
  if (!currentCoach.value) return trainees.value;
  if (isFounder.value) return trainees.value;
  return trainees.value.filter((trainee) =>
    trainee.trainingPlan.some((plan) => plan.coach?.id === currentCoach.value?.id)
  );
});

const initializeData = async (): Promise<void> => {
  const coachId = Number(navStore.targetId);

  if (!coachId || Number.isNaN(coachId)) {
    router.replace("/");
    return;
  }

  try {
    await Promise.all([
      coachStore.fetchCoachById(coachId),
      coachStore.fetchAll(),
      coachStore.fetchCoaches(),
    ]);

    if (!currentCoach.value) {
      throw new Error("無法獲取教練資料");
    }
  } catch (err: unknown) {
    // Store 會自動處理錯誤狀態
  }
};

onMounted(initializeData);

const navStore = useNavigationStore();

const navigateToUpdate = (trainee: Trainee): void => {
  navStore.setTraineeNav(trainee.id, {
    coach: true,
    coachId: currentCoach.value?.id || -1,
    register: false,
    showRecords: true,
    showPlans: false,
  });
  router.push("/trainee/info");
};

const navigateToAdjust = (trainee: Trainee): void => {
  if (!currentCoach.value) return;
  navStore.setPlanNav(trainee.id, {
    editor: currentCoach.value.id,
    showRecords: false,
    showPlans: true,
  });
  router.push("/plan");
};

const navigateToOpeningCourse = (): void => {
  router.push({ path: "/opening-course" });
};

const navigateToCoachManage = (): void => {
  router.push({ path: "/coach/manage" });
};
</script>
