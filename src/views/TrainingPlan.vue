<template>
  <div class="w-full">
    <h1
      class="text-3xl font-bold mb-4"
      :style="{ color: 'var(--color-primary)' }"
    >
      訓練計畫
    </h1>
    <LoadingState :loading="isLoading" :error="errorMessage || ''" />

    <div
      v-if="!isLoading && !errorMessage && currentTrainee"
      class="w-full space-y-6"
    >
      <div
        class="card shadow-xl w-full"
        :style="{
          backgroundColor: 'var(--color-card-bg)',
          color: 'var(--color-text)',
        }"
      >
        <div class="card-body">
          <h2 class="card-title text-2xl">
            {{ isEditMode ? "編輯" : "新增" }}
            {{ currentTrainee.name }} 的訓練計畫
          </h2>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div
                class="card bg-base-100 shadow-md p-4"
                :style="{
                  backgroundColor: 'var(--color-card-bg)',
                  border: '1px solid var(--color-border)',
                }"
              >
                <div class="form-control">
                  <label class="label">
                    <span
                      class="label-text font-semibold"
                      :style="{ color: 'var(--color-text)' }"
                      >負責教練</span
                    >
                  </label>
                  <select
                    v-model="selectedCoach"
                    class="select select-bordered w-full"
                    :class="{ 'select-error': validationErrors.coach }"
                    :style="{
                      backgroundColor: 'var(--color-input-bg)',
                      borderColor: validationErrors.coach
                        ? 'var(--color-error)'
                        : 'var(--color-input-border)',
                      color: 'var(--color-text)',
                    }"
                  >
                    <option value="">請選擇教練</option>
                    <option
                      v-for="coach in coaches"
                      :key="coach.id"
                      :value="coach.id"
                    >
                      {{ coach.name }}
                    </option>
                  </select>
                  <label v-if="validationErrors.coach" class="label">
                    <span
                      class="label-text-alt"
                      :style="{ color: 'var(--color-error)' }"
                      >{{ validationErrors.coach }}</span
                    >
                  </label>
                </div>
              </div>

              <div
                class="card bg-base-100 shadow-md p-4"
                :style="{
                  backgroundColor: 'var(--color-card-bg)',
                  border: '1px solid var(--color-border)',
                }"
              >
                <div class="form-control">
                  <label class="label">
                    <span
                      class="label-text font-semibold"
                      :style="{ color: 'var(--color-text)' }"
                      >計畫類型</span
                    >
                  </label>
                  <select
                    v-model="planType"
                    class="select select-bordered w-full"
                    :class="{ 'select-error': validationErrors.planType }"
                    :style="{
                      backgroundColor: 'var(--color-input-bg)',
                      borderColor: validationErrors.planType
                        ? 'var(--color-error)'
                        : 'var(--color-input-border)',
                      color: 'var(--color-text)',
                    }"
                  >
                    <option value="">請選擇計畫類型</option>
                    <option value="private">個人教練</option>
                    <option value="block">團體課程</option>
                    <option value="sequential">開放團體課程</option>
                  </select>
                  <label v-if="validationErrors.planType" class="label">
                    <span
                      class="label-text-alt"
                      :style="{ color: 'var(--color-error)' }"
                      >{{ validationErrors.planType }}</span
                    >
                  </label>
                </div>
              </div>

              <div
                class="card bg-base-100 shadow-md p-4"
                :style="{
                  backgroundColor: 'var(--color-card-bg)',
                  border: '1px solid var(--color-border)',
                }"
              >
                <div class="form-control">
                  <label class="label">
                    <span
                      class="label-text font-semibold"
                      :style="{ color: 'var(--color-text)' }"
                      >計畫額度</span
                    >
                  </label>
                  <input
                    type="number"
                    v-model.number="quota"
                    class="input input-bordered w-full"
                    :class="{ 'input-error': validationErrors.quota }"
                    :style="{
                      backgroundColor: 'var(--color-input-bg)',
                      borderColor: validationErrors.quota
                        ? 'var(--color-error)'
                        : 'var(--color-input-border)',
                      color: 'var(--color-text)',
                    }"
                    min="1"
                    max="100"
                    placeholder="請輸入1-100之間的數字"
                  />
                  <label v-if="validationErrors.quota" class="label">
                    <span
                      class="label-text-alt"
                      :style="{ color: 'var(--color-error)' }"
                      >{{ validationErrors.quota }}</span
                    >
                  </label>
                </div>
              </div>
            </div>

            <div
              class="card bg-base-100 shadow-md p-4 mt-4"
              :style="{
                backgroundColor: 'var(--color-card-bg)',
                border: '1px solid var(--color-border)',
              }"
            >
              <div class="form-control">
                <div class="flex justify-between items-center mb-4">
                  <label class="label">
                    <span
                      class="label-text font-semibold text-lg"
                      :style="{ color: 'var(--color-text)' }"
                      >訓練時段設定</span
                    >
                  </label>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline"
                    @click="addTrainingSlot"
                    :style="{
                      borderColor: 'var(--color-primary)',
                      color: 'var(--color-primary)',
                    }"
                  >
                    <svg
                      class="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      ></path>
                    </svg>
                    新增時段
                  </button>
                </div>

                <div
                  v-if="trainingTimeSlots.length === 0"
                  class="text-center py-8 opacity-70"
                >
                  <svg
                    class="w-12 h-12 mx-auto mb-2 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <p>尚未設定訓練時段</p>
                </div>

                <div v-else class="space-y-4">
                  <div
                    v-for="(slot, index) in trainingTimeSlots"
                    :key="index"
                    class="card bg-base-200 p-4"
                    :style="{
                      backgroundColor: 'var(--color-input-bg)',
                      border: '1px solid var(--color-border)',
                    }"
                  >
                    <div class="flex justify-between items-center mb-3">
                      <span class="text-sm font-medium opacity-80">時段</span>
                      <button
                        type="button"
                        class="btn btn-sm btn-error"
                        @click="removeTrainingSlot(index)"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 01 16.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div class="form-control">
                        <label class="label">
                          <span class="label-text text-sm opacity-70"
                            >星期</span
                          >
                        </label>
                        <select
                          v-model="slot.dayOfWeek"
                          class="select select-bordered select-sm w-full"
                          :style="{
                            backgroundColor: 'var(--color-card-bg)',
                            borderColor: 'var(--color-input-border)',
                            color: 'var(--color-text)',
                          }"
                        >
                          <option value="">請選擇</option>
                          <option
                            v-for="day in dayOptions"
                            :key="day.value"
                            :value="day.value"
                          >
                            {{ day.label }}
                          </option>
                        </select>
                      </div>

                      <div class="form-control">
                        <label class="label">
                          <span class="label-text text-sm opacity-70"
                            >開始時間</span
                          >
                        </label>
                        <select
                          v-model="slot.start"
                          class="select select-bordered select-sm w-full"
                          :style="{
                            backgroundColor: 'var(--color-card-bg)',
                            borderColor: 'var(--color-input-border)',
                            color: 'var(--color-text)',
                          }"
                        >
                          <option value="">請選擇</option>
                          <option
                            v-for="time in timeOptions"
                            :key="time.value"
                            :value="time.value"
                          >
                            {{ time.label }}
                          </option>
                        </select>
                      </div>

                      <div class="form-control">
                        <label class="label">
                          <span class="label-text text-sm opacity-70"
                            >結束時間</span
                          >
                        </label>
                        <select
                          v-model="slot.end"
                          class="select select-bordered select-sm w-full"
                          :style="{
                            backgroundColor: 'var(--color-card-bg)',
                            borderColor: 'var(--color-input-border)',
                            color: 'var(--color-text)',
                          }"
                        >
                          <option value="">請選擇</option>
                          <option
                            v-for="time in getEndTimeOptions(slot.start)"
                            :key="time.value"
                            :value="time.value"
                          >
                            {{ time.label }}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <label v-if="validationErrors.trainingSlots" class="label mt-3">
                  <span
                    class="label-text-alt"
                    :style="{ color: 'var(--color-error)' }"
                    >{{ validationErrors.trainingSlots }}</span
                  >
                </label>
              </div>
            </div>

            <div class="card-actions justify-end mt-4">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="isLoading"
                :style="{
                  backgroundColor: 'var(--color-primary)',
                  borderColor: 'var(--color-primary)',
                  color: 'white',
                }"
              >
                <span v-if="isLoading" class="loading loading-spinner"></span>
                {{ isEditMode ? "更新" : "新增" }}
              </button>
              <button
                type="button"
                class="btn btn-ghost"
                @click="handleCancel"
                :disabled="isLoading"
                :style="{
                  backgroundColor: 'var(--color-button-bg)',
                  borderColor: 'var(--color-button-border)',
                  color: 'var(--color-text)',
                }"
              >
                {{ isEditMode ? "取消" : "返回" }}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div
        class="card shadow-xl w-full"
        :style="{
          backgroundColor: 'var(--color-card-bg)',
          color: 'var(--color-text)',
        }"
      >
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">歷史訓練計畫</h2>
          <TrainingPlanList
            :trainingPlans="currentTrainee.trainingPlan"
            @edit="handleEditTrainingPlan"
          />
        </div>
      </div>

      <!-- 訓練記錄列表 -->
      <TrainingRecordList
        :traineeId="currentTrainee.id"
        :trainingRecords="trainingRecords"
        :coachId="editorId"
        @update-records="handleUpdateTrainingRecords"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useTraineeStore } from "../stores/trainee";
import { ElMessage } from "element-plus";
import LoadingState from "../components/LoadingState.vue";
import TrainingPlanList from "../components/TrainingPlanList.vue";
import TrainingRecordList from "../components/TrainingRecordList.vue";
import type { Trainee } from "../services/trainee";
import type { Coach } from "../services/coach";
import type {
  TrainingPlan,
  UpdateTrainingPlan,
  TrainingTimeSlot,
} from "../services/trainingPlan";
import type { TrainingRecord } from "../services/trainingRecord";

const router = useRouter();
const traineeStore = useTraineeStore();

// 使用 store 的狀態，而不是本地 ref
const currentTrainee = computed(() => traineeStore.currentTrainee);
const isLoading = computed(() => traineeStore.loading);
const errorMessage = computed(() => traineeStore.error);

// 本地狀態管理
const coaches = ref<Coach[]>([]);
const selectedCoach = ref<number>(0);
const planType = ref<string>("");
const quota = ref<number>(0);
const trainingTimeSlots = ref<TrainingTimeSlot[]>([]);
const editTrainingPlanId = ref<number>(0);
const editorId = ref<number>(0);
const trainingRecords = ref<TrainingRecord[]>([]);

// 驗證錯誤狀態
const validationErrors = ref({
  coach: "",
  planType: "",
  quota: "",
  trainingSlots: "",
});

// 計算屬性
const isEditMode = computed(() => editTrainingPlanId.value !== 0);

// 選項資料
const dayOptions = [
  { value: "Monday", label: "星期一" },
  { value: "Tuesday", label: "星期二" },
  { value: "Wednesday", label: "星期三" },
  { value: "Thursday", label: "星期四" },
  { value: "Friday", label: "星期五" },
  { value: "Saturday", label: "星期六" },
  { value: "Sunday", label: "星期日" },
];

const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return { value: `${hour}:00`, label: `${hour}:00` };
});

/**
 * 從路由狀態中提取參數
 */
const extractRouteParams = (): void => {
  const routeState = history.state;
  editorId.value = Number(routeState?.editor) || 0;
};

/**
 * 初始化資料
 */
const initializeData = async (): Promise<void> => {
  try {
    const routeState = history.state;
    const traineeId = Number(routeState?.id);

    if (!traineeId) {
      throw new Error("缺少學員 ID");
    }

    const [trainee, coachesData] = await Promise.all([
      traineeStore.fetchById(traineeId),
      traineeStore.fetchCoaches(),
    ]);

    if (!trainee) {
      throw new Error("無法獲取學員資料");
    }

    coaches.value = coachesData || [];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "發生錯誤，請稍後再試";
    console.error("Failed to initialize training plan data:", err);
    // Store 會自動處理錯誤狀態
  }
};

/**
 * 監聽額度變化，確保在有效範圍內
 */
watch(quota, (newValue: number) => {
  if (typeof newValue === "number") {
    if (newValue < 1) quota.value = 1;
    if (newValue > 100) quota.value = 100;
  }
});

/**
 * 新增訓練時段
 */
const addTrainingSlot = (): void => {
  trainingTimeSlots.value.push({
    dayOfWeek: "",
    start: "09:00",
    end: "10:00",
  });
};

/**
 * 移除訓練時段
 */
const removeTrainingSlot = (index: number): void => {
  trainingTimeSlots.value.splice(index, 1);
};

/**
 * 獲取結束時間選項
 */
const getEndTimeOptions = (startTime: string) => {
  if (!startTime) return timeOptions;
  const startHour = parseInt(startTime.split(":")[0]);
  return timeOptions.filter((time) => {
    const timeHour = parseInt(time.value.split(":")[0]);
    return timeHour > startHour;
  });
};

/**
 * 驗證表單
 */
const validateForm = (): boolean => {
  const errors = {
    coach: "",
    planType: "",
    quota: "",
    trainingSlots: "",
  };

  if (!selectedCoach.value) {
    errors.coach = "請選擇教練";
  }

  if (!planType.value) {
    errors.planType = "請選擇計畫類型";
  }

  if (!quota.value || quota.value === 0) {
    errors.quota = "請輸入1-100之間的數字";
  }

  if (trainingTimeSlots.value.length === 0) {
    errors.trainingSlots = "請至少設定一個訓練時段";
  } else {
    const hasInvalidSlot = trainingTimeSlots.value.some(
      (slot) => !slot.dayOfWeek || !slot.start || !slot.end
    );
    if (hasInvalidSlot) {
      errors.trainingSlots = "請完整填寫所有訓練時段";
    } else {
      const hasInvalidTimeRange = trainingTimeSlots.value.some((slot) => {
        if (!slot.start || !slot.end) return false;
        const startHour = parseInt(slot.start.split(":")[0]);
        const endHour = parseInt(slot.end.split(":")[0]);
        return endHour <= startHour;
      });
      if (hasInvalidTimeRange) {
        errors.trainingSlots = "結束時間必須晚於開始時間";
      }
    }
  }

  validationErrors.value = errors;
  return !Object.values(errors).some((error) => error !== "");
};

/**
 * 處理表單提交
 */
const handleSubmit = async (): Promise<void> => {
  if (!validateForm()) {
    return;
  }

  if (!currentTrainee.value) {
    console.error("No trainee data available");
    return;
  }

  try {
    const data: UpdateTrainingPlan = {
      trainee: currentTrainee.value.id,
      coach: selectedCoach.value,
      planType: planType.value,
      planQuota: quota.value,
      trainingTimeSlot: trainingTimeSlots.value,
      editor: editorId.value,
      id: editTrainingPlanId.value,
    };

    let result: boolean | null = false;
    if (isEditMode.value) {
      result = await traineeStore.updateTrainingPlan(data);
    } else {
      result = await traineeStore.createTrainingPlan(data);
    }

    if (!result) {
      const errorMessage = isEditMode.value ? "更新失敗" : "新增失敗";
      ElMessage.error(errorMessage);
      return;
    }

    // 重置表單
    resetForm();

    // 重新載入學員資料
    const updatedTrainee = await traineeStore.fetchById(
      currentTrainee.value.id
    );
    if (updatedTrainee) {
      traineeStore.currentTrainee = updatedTrainee;
    }

    const successMessage = isEditMode.value ? "更新成功" : "新增成功";
    ElMessage.success(successMessage);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "發生錯誤，請稍後再試";
    ElMessage.error(message);
    console.error("Failed to submit training plan:", err);
  }
};

/**
 * 重置表單
 */
const resetForm = (): void => {
  selectedCoach.value = 0;
  planType.value = "";
  quota.value = 0;
  trainingTimeSlots.value = [];
  editTrainingPlanId.value = 0;
  validationErrors.value = {
    coach: "",
    planType: "",
    quota: "",
    trainingSlots: "",
  };
};

/**
 * 處理編輯訓練計畫
 */
const handleEditTrainingPlan = (trainingPlan: TrainingPlan): void => {
  editTrainingPlanId.value = trainingPlan.id;
  selectedCoach.value = trainingPlan.coach?.id || 0;
  planType.value = trainingPlan.planType;
  quota.value = trainingPlan.planQuota;

  if (trainingPlan.trainingTimeSlot.length > 0) {
    const uniqueSlots = trainingPlan.trainingTimeSlot.filter(
      (slot, index, self) =>
        index ===
        self.findIndex(
          (s) =>
            s.dayOfWeek === slot.dayOfWeek &&
            s.start === slot.start &&
            s.end === slot.end
        )
    );
    trainingTimeSlots.value = uniqueSlots;
  } else {
    trainingTimeSlots.value = [];
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
};

/**
 * 處理取消操作
 */
const handleCancel = (): void => {
  if (isEditMode.value) {
    resetForm();
  } else {
    handleBack();
  }
};

/**
 * 處理返回導航
 */
const handleBack = (): void => {
  try {
    router.back();
  } catch (error) {
    console.error("Failed to navigate back:", error);
  }
};

/**
 * 處理訓練記錄更新
 */
const handleUpdateTrainingRecords = (records: TrainingRecord[]): void => {
  trainingRecords.value = records;
};

onMounted(async (): Promise<void> => {
  extractRouteParams();
  await initializeData();
});
</script>
