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
          <h2 class="card-title text-2xl">
            年度統計
            <!-- 全域檢視的統計範圍與一般教練不同，用 tooltip 說明 -->
            <span
              v-if="canViewAllRecords"
              class="tooltip tooltip-bottom font-normal"
              data-tip="此處為全體教練的年度統計，涵蓋所有學員的簽到紀錄"
            >
              <button
                type="button"
                class="btn btn-ghost btn-xs btn-circle"
                aria-label="年度統計說明"
              >
                <svg
                  class="h-5 w-5 opacity-60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </button>
            </span>
          </h2>

          <div v-if="isLoadingYearlySummary" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg"></span>
          </div>

          <div
            v-else-if="yearlySummary.privateTraining.length === 0 && yearlySummary.groupFitness.length === 0"
            class="text-center py-8 text-gray-500"
          >
            目前沒有年度統計資料
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <!-- 個人課程年度統計 -->
            <div v-if="yearlySummary.privateTraining.length > 0">
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
                    <tr v-for="row in yearlySummary.privateTraining" :key="row.year">
                      <td class="font-medium">{{ row.year }}</td>
                      <td>{{ row.totalAttendees }} 人</td>
                      <td>{{ row.totalSessions }} 堂</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 團體課程年度統計 -->
            <div v-if="yearlySummary.groupFitness.length > 0">
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
                    <tr v-for="row in yearlySummary.groupFitness" :key="row.year">
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
          <h2 class="card-title text-2xl">
            課程紀錄
            <!-- 靠右後改用 tooltip-left，往下展開會超出卡片右緣 -->
            <span class="tooltip tooltip-left font-normal ml-auto" data-tip="重新載入最新資料">
              <button
                type="button"
                class="btn btn-ghost btn-xs btn-circle"
                :disabled="isLoadingRecords"
                aria-label="重新載入課程紀錄"
                @click="refreshInsights"
              >
                <svg
                  class="h-5 w-5 opacity-60"
                  :class="{ 'animate-spin': isLoadingRecords }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  ></path>
                </svg>
              </button>
            </span>
          </h2>

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
                  <th :class="recordColumnClass">時間</th>
                  <th :class="recordColumnClass">學員</th>
                  <th v-if="canViewAllRecords" :class="recordColumnClass">教練</th>
                  <th :class="recordColumnClass">類型</th>
                  <th :class="recordColumnClass">課程</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(dayRecords, date) in pagedGroupedRecords" :key="date">
                  <tr>
                    <td :colspan="canViewAllRecords ? 5 : 4" class="bg-base-200 font-bold">
                      {{ date }}
                      <span class="badge badge-sm ml-2">{{ dayRecords.length }} 堂</span>
                    </td>
                  </tr>
                  <tr v-for="record in dayRecords" :key="record.id">
                    <td>{{ formatTime(record.createdDate) }}</td>
                    <td>
                      <!-- 沒有學員 id 就無從跳頁，維持純文字 -->
                      <button
                        v-if="record.trainee?.id"
                        type="button"
                        class="link link-hover font-medium trainee-link"
                        @click="navigateToTraineeFromRecord(record)"
                      >
                        {{ record.trainee?.name || '未知學員' }}
                      </button>
                      <span v-else>未知學員</span>
                    </td>
                    <td v-if="canViewAllRecords">{{ getRecordCoachName(record) }}</td>
                    <td>
                      <span
                        class="badge badge-sm"
                        :class="{
                          'badge-primary': record.trainingPlan?.planType === 'PrivateTraining',
                          'badge-success': record.trainingPlan?.planType === 'FlexPrivate',
                          'badge-info': record.trainingPlan?.planType === 'SemiPrivate',
                          'badge-warning': record.trainingPlan?.planType === 'GroupFitness',
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
// 教練 ID 1、2 具備全域檢視權限：可看到所有學員與所有簽到紀錄
const canViewAllRecords = computed(() => {
  const id = currentCoach.value?.id;
  return id === 1 || id === 2;
});
const canImpersonateTrainee = canViewAllRecords;

const coachRecords = ref<TrainingRecord[]>([]);
const isLoadingRecords = ref<boolean>(false);
const isLoadingYearlySummary = ref<boolean>(false);
const yearlySummary = ref<{
  privateTraining: { year: string; totalAttendees: number; totalSessions: number }[];
  groupFitness: { year: string; totalAttendees: number; totalSessions: number }[];
}>({ privateTraining: [], groupFitness: [] });
const currentPage = ref<number>(1);
const pageSize = 20;

const filteredTrainees = computed(() => {
  if (!currentCoach.value) return trainees.value;
  if (isFounder.value || canViewAllRecords.value) return trainees.value;
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

// 後端年度統計把這三種計畫歸類為「個人課程」
const PRIVATE_PLAN_TYPES = ["PrivateTraining", "FlexPrivate", "SemiPrivate"];

/**
 * 以台北時區取得 YYYY-MM-DD，對齊後端 SQL 的 AT TIME ZONE 'Asia/Taipei'
 */
const getTaipeiDateKey = (dateStr: string): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(dateStr));

/**
 * 全域檢視時自行彙總年度統計，口徑對齊後端 getCoachYearlySummary：
 * 個人課程 = 不重複學員數 / 簽到筆數；團體課程 = 不重複學員數 / 不重複的「日期 + 開課」
 */
const buildYearlySummaryFromRecords = (
  records: TrainingRecord[]
): typeof yearlySummary.value => {
  const privateByYear = new Map<string, { trainees: Set<number>; sessions: number }>();
  const groupByYear = new Map<string, { trainees: Set<number>; sessions: Set<string> }>();

  for (const record of records) {
    const planType = record.trainingPlan?.planType;
    if (!planType || !record.createdDate) continue;

    const dateKey = getTaipeiDateKey(record.createdDate);
    const year = dateKey.slice(0, 4);
    const traineeId = record.trainee?.id;

    if (PRIVATE_PLAN_TYPES.includes(planType)) {
      const entry = privateByYear.get(year) || { trainees: new Set<number>(), sessions: 0 };
      if (traineeId) entry.trainees.add(traineeId);
      entry.sessions += 1;
      privateByYear.set(year, entry);
      continue;
    }

    // 後端的團體課程統計是 INNER JOIN OpeningCourse，沒掛開課的紀錄不列入
    if (planType === "GroupFitness" && record.openingCourse) {
      const entry =
        groupByYear.get(year) || { trainees: new Set<number>(), sessions: new Set<string>() };
      if (traineeId) entry.trainees.add(traineeId);
      entry.sessions.add(`${dateKey}-${record.openingCourse.id}`);
      groupByYear.set(year, entry);
    }
  }

  return {
    privateTraining: Array.from(privateByYear, ([year, entry]) => ({
      year,
      totalAttendees: entry.trainees.size,
      totalSessions: entry.sessions,
    })).sort((a, b) => b.year.localeCompare(a.year)),
    groupFitness: Array.from(groupByYear, ([year, entry]) => ({
      year,
      totalAttendees: entry.trainees.size,
      totalSessions: entry.sessions.size,
    })).sort((a, b) => b.year.localeCompare(a.year)),
  };
};

const loadCoachInsights = async (coach: Coach): Promise<void> => {
  coachRecords.value = [];
  yearlySummary.value = { privateTraining: [], groupFitness: [] };
  currentPage.value = 1;
  isLoadingRecords.value = true;
  isLoadingYearlySummary.value = true;

  // 具全域檢視權限時不做任何過濾，直接看所有學員的所有簽到紀錄
  const viewAll = canViewAllRecords.value;

  // 後端的年度統計 API 只算單一教練，全域檢視時改用下面抓到的全部紀錄自行彙總
  if (!viewAll) {
    api
      .getCoachYearlySummary(coach.id)
      .then((data) => {
        // 後端若回傳非預期結構，仍要保住兩個陣列欄位，避免樣板讀 .length 爆掉
        yearlySummary.value = {
          privateTraining: data?.privateTraining ?? [],
          groupFitness: data?.groupFitness ?? [],
        };
      })
      .catch((error) => {
        console.error("Failed to fetch yearly summary:", error);
      })
      .finally(() => {
        isLoadingYearlySummary.value = false;
      });
  }

  try {
    // 團體課程的紀錄可能掛在其他教練的計畫下，所以有團體課程計畫的學員也要納入
    const traineeIds = new Set<number>();
    for (const trainee of trainees.value) {
      if (viewAll) {
        traineeIds.add(trainee.id);
        continue;
      }

      for (const plan of trainee.trainingPlan || []) {
        if (plan.coach?.id === coach.id || plan.planType === "GroupFitness") {
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
          // 團體課程以開課教練為準，其餘以訓練計畫教練為準
          const isCoachRecord =
            viewAll ||
            (record.trainingPlan?.planType === "GroupFitness" && record.openingCourse
              ? record.openingCourse.coach?.id === coach.id
              : record.trainingPlan?.coach?.id === coach.id);
          if (isCoachRecord) {
            // 後端沒有帶回 trainee 關聯，補上目前迴圈的學員（年度統計要靠 id 去重）
            record.trainee = {
              ...record.trainee,
              id: record.trainee?.id ?? traineeId,
              name: record.trainee?.name || traineeNameMap.get(traineeId) || "",
            } as any;
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

    if (viewAll) {
      yearlySummary.value = buildYearlySummaryFromRecords(allRecords);
    }
  } catch (error) {
    console.error("Failed to fetch coach records:", error);
  } finally {
    isLoadingRecords.value = false;
    if (viewAll) {
      isLoadingYearlySummary.value = false;
    }
  }
};

/**
 * 手動重新載入課程紀錄與年度統計
 * 不走 coachStore.fetchAll()，避免它的 loading 旗標把整頁內容切回載入畫面
 */
const refreshInsights = async (): Promise<void> => {
  if (!currentCoach.value || isLoadingRecords.value) return;

  // 先擋住按鈕，否則抓學員清單的這段空窗期還能重複點擊
  isLoadingRecords.value = true;

  try {
    // 學員清單決定要抓哪些人的紀錄，先更新才看得到新學員的簽到
    coachStore.trainees = await api.getTrainees();
  } catch (error) {
    // 學員清單抓失敗不影響紀錄重載，沿用現有清單即可
    console.error("Failed to refresh trainees:", error);
  }

  await loadCoachInsights(currentCoach.value);
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

const recordColumnClass = computed(() =>
  canViewAllRecords.value ? "w-1/5" : "w-1/4"
);

/**
 * 取得該筆紀錄的授課教練：團體課程以開課教練為準，其餘以訓練計畫教練為準
 */
const getRecordCoachName = (record: TrainingRecord): string => {
  const coach =
    record.trainingPlan?.planType === "GroupFitness" && record.openingCourse
      ? record.openingCourse.coach
      : record.trainingPlan?.coach;
  return coach?.name || "未指定";
};

const getPlanTypeLabel = (planType?: string): string => {
  const labels: Record<string, string> = {
    PrivateTraining: "個人教練",
    FlexPrivate: "個人彈性",
    SemiPrivate: "個人小班",
    GroupFitness: "團體課程",
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

/**
 * 由課程紀錄的學員名稱跳往學員資訊頁，導覽參數對齊學員清單的「查看」
 */
const navigateToTraineeFromRecord = (record: TrainingRecord): void => {
  const traineeId = record.trainee?.id;
  if (!traineeId) return;

  navStore.setTraineeNav(traineeId, {
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

<style scoped>
/* 咖啡棕：明度各自調過讓文字在兩種主題都夠清楚 */
.trainee-link {
  color: #78350f;
  transition: color 0.3s ease;
}

[data-theme="dark"] .trainee-link {
  color: #d6a77a;
}

.trainee-link:hover {
  color: var(--color-text);
}
</style>
