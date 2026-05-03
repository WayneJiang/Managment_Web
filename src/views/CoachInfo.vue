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
        <!-- 開發 / 預覽用：以學員 ID = 1 視角檢視 -->
        <button
          v-if="canImpersonateTrainee"
          @click="impersonateTrainee"
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
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            ></path>
          </svg>
          學員視角
        </button>
      </div>
    </div>

    <LoadingState :loading="isLoading" :error="errorMessage || ''" />

    <div v-if="!isLoading && !errorMessage" class="w-full">
      <!-- 年度統計卡片 -->
      <div v-if="currentCoach" class="card shadow-xl w-full">
        <div class="card-body">
          <h2 class="card-title text-2xl">年度統計</h2>

          <div v-if="isLoadingYearlySummary" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg"></span>
          </div>

          <div
            v-else-if="yearlySummary.personal.length === 0 && yearlySummary.sequential.length === 0"
            class="text-center py-8 text-gray-500"
          >
            目前沒有年度統計資料
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <!-- 個人課程年度統計 -->
            <div v-if="yearlySummary.personal.length > 0">
              <h3 class="font-bold text-lg mb-2">個人課程</h3>
              <div class="overflow-x-auto">
                <table class="table table-sm w-full">
                  <thead>
                    <tr>
                      <th>年度</th>
                      <th>上課人數</th>
                      <th>上課堂數</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in yearlySummary.personal" :key="row.year">
                      <td class="font-medium">{{ row.year }}</td>
                      <td>{{ row.totalAttendees }} 人</td>
                      <td>{{ row.totalSessions }} 堂</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 團體課程年度統計 -->
            <div v-if="yearlySummary.sequential.length > 0">
              <h3 class="font-bold text-lg mb-2">團體課程</h3>
              <div class="overflow-x-auto">
                <table class="table table-sm w-full">
                  <thead>
                    <tr>
                      <th>年度</th>
                      <th>上課人數</th>
                      <th>開課次數</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in yearlySummary.sequential" :key="row.year">
                      <td class="font-medium">{{ row.year }}</td>
                      <td>{{ row.totalAttendees }} 人</td>
                      <td>{{ row.totalSessions }} 次</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 課程紀錄卡片 -->
      <div v-if="currentCoach" class="card shadow-xl w-full mt-4">
        <div class="card-body">
          <h2 class="card-title text-2xl">課程紀錄</h2>

          <div v-if="isLoadingRecords" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg"></span>
          </div>

          <div v-else-if="coachRecords.length === 0" class="text-center py-8 text-gray-500">
            目前沒有課程紀錄
          </div>

          <div v-else class="overflow-x-auto mt-2">
            <table class="table w-full">
              <thead>
                <tr>
                  <th class="w-1/4">時間</th>
                  <th class="w-1/4">學員</th>
                  <th class="w-1/4">類型</th>
                  <th class="w-1/4">課程</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(dayRecords, date) in pagedGroupedRecords" :key="date">
                  <tr>
                    <td colspan="4" class="bg-base-200 font-bold">
                      {{ date }}
                      <span class="badge badge-sm ml-2">{{ dayRecords.length }} 堂</span>
                    </td>
                  </tr>
                  <tr v-for="record in dayRecords" :key="record.id">
                    <td>{{ formatTime(record.createdDate) }}</td>
                    <td>{{ record.trainee?.name || '未知學員' }}</td>
                    <td>
                      <span
                        class="badge badge-sm"
                        :class="{
                          'badge-primary': record.trainingPlan?.planType === 'Personal',
                          'badge-success': record.trainingPlan?.planType === 'FlexiblePersonal',
                          'badge-warning': record.trainingPlan?.planType === 'Sequential',
                        }"
                      >
                        {{ getPlanTypeLabel(record.trainingPlan?.planType) }}
                      </span>
                    </td>
                    <td>{{ record.openingCourse?.name || '-' }}</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <!-- 分頁 -->
          <div v-if="!isLoadingRecords && totalPages > 1" class="flex justify-center items-center gap-2 mt-4">
            <button
              class="btn btn-sm"
              :disabled="currentPage <= 1"
              @click="currentPage--"
            >
              上一頁
            </button>
            <span>{{ currentPage }} / {{ totalPages }}</span>
            <button
              class="btn btn-sm"
              :disabled="currentPage >= totalPages"
              @click="currentPage++"
            >
              下一頁
            </button>
          </div>
        </div>
      </div>

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
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useCoachStore } from "../stores/coach";
import { useNavigationStore } from "../stores/navigation";
import TraineeList from "../components/TraineeList.vue";
import LoadingState from "../components/LoadingState.vue";
import { api } from "../services/api";
import type { Trainee } from "../services/trainee";
import type { Coach } from "../services/coach";
import type { TrainingRecord } from "../services/training-record";

defineOptions({ name: "CoachInfo" });

const router = useRouter();
const coachStore = useCoachStore();

const currentCoach = computed(() => coachStore.currentCoach);
const trainees = computed(() => coachStore.trainees);
const isLoading = computed(() => coachStore.loading);
const errorMessage = computed(() => coachStore.error);
const isFounder = computed(() => currentCoach.value?.coachType === "Founder");
const canImpersonateTrainee = computed(() => {
  const id = currentCoach.value?.id;
  return id === 1 || id === 2;
});

const coachRecords = ref<TrainingRecord[]>([]);
const isLoadingRecords = ref<boolean>(false);
const isLoadingYearlySummary = ref<boolean>(false);
const yearlySummary = ref<{
  personal: { year: string; totalAttendees: number; totalSessions: number }[];
  sequential: { year: string; totalAttendees: number; totalSessions: number }[];
}>({ personal: [], sequential: [] });
const currentPage = ref<number>(1);
const pageSize = 20;

const filteredTrainees = computed(() => {
  if (!currentCoach.value) return trainees.value;
  if (isFounder.value) return trainees.value;
  return trainees.value.filter((trainee) =>
    trainee.trainingPlan.some((plan) => plan.coach?.id === currentCoach.value?.id)
  );
});

const initializeData = async (): Promise<void> => {
  const coachId = Number(navStore.viewerId || navStore.targetId);

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

    await loadCoachInsights(currentCoach.value);
  } catch (err: unknown) {
    // Store 會自動處理錯誤狀態
  }
};

onMounted(initializeData);

const loadCoachInsights = async (coach: Coach): Promise<void> => {
  coachRecords.value = [];
  yearlySummary.value = { personal: [], sequential: [] };
  currentPage.value = 1;
  isLoadingRecords.value = true;
  isLoadingYearlySummary.value = true;

  api
    .getCoachYearlySummary(coach.id)
    .then((data) => {
      yearlySummary.value = data;
    })
    .catch((error) => {
      console.error("Failed to fetch yearly summary:", error);
    })
    .finally(() => {
      isLoadingYearlySummary.value = false;
    });

  try {
    const traineeIds = new Set<number>();
    for (const trainee of trainees.value) {
      for (const plan of trainee.trainingPlan || []) {
        if (plan.coach?.id === coach.id) {
          traineeIds.add(trainee.id);
          break;
        }
      }
    }

    const traineeNameMap = new Map<number, string>();
    for (const trainee of trainees.value) {
      traineeNameMap.set(trainee.id, trainee.name);
    }

    const allRecords: TrainingRecord[] = [];
    const fetchPromises = Array.from(traineeIds).map(async (traineeId) => {
      let page = 1;
      let totalPagesLocal = 1;
      while (page <= totalPagesLocal) {
        const result = await api.getByTrainingRecord(traineeId, page);
        for (const record of result.data) {
          if (record.trainingPlan?.coach?.id === coach.id) {
            if (!record.trainee?.name) {
              const name = traineeNameMap.get(traineeId);
              if (name) {
                record.trainee = { ...record.trainee, id: traineeId, name } as any;
              }
            }
            allRecords.push(record);
          }
        }
        totalPagesLocal = result.totalPages;
        page++;
      }
    });

    await Promise.all(fetchPromises);

    allRecords.sort(
      (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );
    coachRecords.value = allRecords;
  } catch (error) {
    console.error("Failed to fetch coach records:", error);
  } finally {
    isLoadingRecords.value = false;
  }
};

const totalPages = computed(() => Math.ceil(coachRecords.value.length / pageSize));

const pagedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return coachRecords.value.slice(start, start + pageSize);
});

const pagedGroupedRecords = computed(() => {
  const groups: Record<string, TrainingRecord[]> = {};
  for (const record of pagedRecords.value) {
    const date = new Date(record.createdDate).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
  }
  return groups;
});

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getPlanTypeLabel = (planType?: string): string => {
  const labels: Record<string, string> = {
    Personal: "個人教練",
    FlexiblePersonal: "個人彈性",
    Sequential: "團體課程",
  };
  return planType ? labels[planType] || planType : "未知";
};

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

const impersonateTrainee = (): void => {
  navStore.setTraineeNav(1, {
    coach: false,
    register: false,
    preview: true,
    coachId: -1,
    showRecords: true,
    showPlans: true,
  });
  router.push("/trainee/info");
};

const navigateToOpeningCourse = (): void => {
  router.push({ path: "/opening-course" });
};

const navigateToCoachManage = (): void => {
  router.push({ path: "/coach/manage" });
};
</script>
