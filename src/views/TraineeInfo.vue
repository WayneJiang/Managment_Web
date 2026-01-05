<template>
  <div class="w-full">
    <h1 class="text-3xl font-bold mb-4">學員資訊</h1>
    <LoadingState :loading="isLoading" :error="errorMessage || ''" />

    <div v-if="!isLoading && !errorMessage && currentTrainee" class="w-full">
      <TraineeForm
        :trainee="currentTrainee"
        :coach="isCoach"
        @save="handleSave"
        @back="handleBack"
      />
      <TraineePlanList
        v-if="showPlans"
        :trainingPlans="currentTrainee.trainingPlan"
        :trainees="allTrainees"
        :currentTrainee="currentTrainee"
      />
      <TrainingRecordList
        v-if="showRecords"
        :traineeId="currentTrainee.id"
        :trainingRecords="currentMonthRecords"
        :trainingPlans="currentTrainee.trainingPlan"
        :coachId="isCoach ? coachId : -1"
        :canEditRecords="canEditRecords"
        @update-records="handleUpdateRecords"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useTraineeStore } from "../stores/trainee";
import { useCoachStore } from "../stores/coach";
import { ElMessage } from "element-plus";
import LoadingState from "../components/LoadingState.vue";
import TraineeForm from "../components/TraineeForm.vue";
import TrainingRecordList from "../components/TrainingRecordList.vue";
import TraineePlanList from "../components/TraineePlanList.vue";
import type { Trainee, UpdateTrainee } from "../services/trainee";
import type { TrainingRecord } from "../services/training-record";

const router = useRouter();
const traineeStore = useTraineeStore();
const coachStore = useCoachStore();

// 使用 store 的狀態，而不是本地 ref
const currentTrainee = computed(() => traineeStore.currentTrainee);
const isLoading = computed(() => traineeStore.loading);
const errorMessage = computed(() => traineeStore.error);

// 本地狀態管理
const isCoach = ref<boolean>(false);
const isRegister = ref<boolean>(false);
const traineeId = ref<string>("");
const coachId = ref<number>(-1); // 預設為 -1，表示未指定教練
const lineNote = ref<string>(""); // LINE 顯示名稱
const currentMonthRecords = ref<TrainingRecord[]>([]);
const showRecords = ref<boolean>(true); // 預設顯示簽到紀錄
const showPlans = ref<boolean>(true); // 預設顯示歷史計畫
const allTrainees = ref<Trainee[]>([]);

/**
 * 檢查當前教練是否為 Founder
 */
const canEditRecords = computed(() => {
  if (!isCoach.value || coachId.value === -1) {
    return false;
  }
  const currentCoach = coachStore.coaches.find((coach) => coach.id === coachId.value);
  return currentCoach?.coachType === "Founder";
});

/**
 * 從路由狀態中提取參數
 */
const extractRouteParams = (): void => {
  const routeState = history.state;
  isCoach.value = Boolean(routeState?.coach);
  isRegister.value = Boolean(routeState?.register);
  traineeId.value = routeState?.id?.toString() || "";
  coachId.value = Number(routeState?.coachId) || -1; // 從路由狀態中提取教練 ID
  lineNote.value = routeState?.note || ""; // 從路由狀態中提取 LINE 顯示名稱
  showRecords.value = routeState?.showRecords !== false; // 預設為 true，除非明確設為 false
  showPlans.value = routeState?.showPlans !== false; // 預設為 true，除非明確設為 false
};

/**
 * 建立預設的學員物件（用於註冊）
 */
const createDefaultTrainee = (): Trainee => ({
  id: 0,
  socialId: traineeId.value,
  name: "",
  gender: "Male",
  birthday: "",
  height: 0,
  weight: 0,
  phone: "",
  note: lineNote.value,
  trainingPlan: [],
  trainingRecord: [],
});

/**
 * 初始化學員資料
 */
const initializeTraineeData = async (): Promise<void> => {
  try {
    if (!isRegister.value) {
      // 並行載入學員資料
      const [trainee, trainees] = await Promise.all([
        traineeStore.fetchTraineeById(Number(traineeId.value)),
        traineeStore.fetchTrainees(),
      ]);

      if (!trainee) {
        throw new Error("無法獲取學員資料");
      }

      allTrainees.value = trainees || [];

      // 如果是教練模式，也載入教練列表以判斷權限
      if (isCoach.value) {
        await coachStore.fetchCoaches();
      }
    } else {
      // 對於註冊模式，設定預設的學員物件並清除載入狀態
      traineeStore.currentTrainee = createDefaultTrainee();
      traineeStore.clearLoadingState();

      // 獲取所有學員資料用於顯示夥伴
      const trainees = await traineeStore.fetchTrainees();
      allTrainees.value = trainees || [];
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "發生錯誤，請稍後再試";
    ElMessage.error(message);
  }
};

/**
 * 處理學員資料儲存
 */
const handleSave = async (updateTrainee: UpdateTrainee): Promise<void> => {
  try {
    let result: boolean | null = false;

    if (isRegister.value) {
      result = await traineeStore.createTrainee(traineeId.value, updateTrainee);
    } else {
      result = await traineeStore.updateTrainee(
        Number(traineeId.value),
        updateTrainee
      );
    }

    if (result) {
      const successMessage = isRegister.value ? "已新增" : "已更新";
      ElMessage.success(successMessage);

      if (isCoach.value) {
        handleBack();
      }
    } else {
      const errorMessage = isRegister.value ? "新增失敗" : "更新失敗";
      ElMessage.error(errorMessage);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "發生錯誤，請稍後再試";
    ElMessage.error(message);
  }
};

/**
 * 處理返回導航
 */
const handleBack = (): void => {
  try {
    router.back();
  } catch (error) {
    // 導航失敗，靜默處理
  }
};

/**
 * 處理訓練記錄更新
 */
const handleUpdateRecords = (records: TrainingRecord[]): void => {
  currentMonthRecords.value = records;
};

onMounted(async (): Promise<void> => {
  extractRouteParams();

  // 檢查必要參數，如果沒有則重定向回首頁
  if (!traineeId.value) {
    router.replace("/");
    return;
  }

  await initializeTraineeData();
});
</script>
