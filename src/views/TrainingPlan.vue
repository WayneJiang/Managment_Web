<template>
  <div class="w-full">
    <h1
      class="text-3xl font-bold mb-4"
      :style="{ color: 'var(--color-primary)' }"
    >
      訓練計畫
    </h1>
    <LoadingState :loading="refLoading" :error="refError" />

    <div v-if="!refLoading && !refError && refTrainee" class="w-full space-y-6">
      <div
        class="card shadow-xl w-full"
        :style="{
          backgroundColor: 'var(--color-card-bg)',
          color: 'var(--color-text)',
        }"
      >
        <div class="card-body">
          <h2 class="card-title text-2xl">
            {{ refEditTrainingPlanId != 0 ? "編輯" : "新增" }}
            {{ refTrainee.name }} 的訓練計畫
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
                    v-model="refSelectedCoach"
                    class="select select-bordered w-full"
                    :class="{ 'select-error': refCoachError }"
                    :style="{
                      backgroundColor: 'var(--color-input-bg)',
                      borderColor: refCoachError
                        ? 'var(--color-error)'
                        : 'var(--color-input-border)',
                      color: 'var(--color-text)',
                    }"
                  >
                    <option value="">請選擇教練</option>
                    <option
                      v-for="coach in refCoaches"
                      :key="coach.id"
                      :value="coach.id"
                    >
                      {{ coach.name }}
                    </option>
                  </select>
                  <label v-if="refCoachError" class="label">
                    <span
                      class="label-text-alt"
                      :style="{ color: 'var(--color-error)' }"
                      >{{ refCoachError }}</span
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
                    v-model="refPlanType"
                    class="select select-bordered w-full"
                    :class="{ 'select-error': refPlanTypeError }"
                    :style="{
                      backgroundColor: 'var(--color-input-bg)',
                      borderColor: refPlanTypeError
                        ? 'var(--color-error)'
                        : 'var(--color-input-border)',
                      color: 'var(--color-text)',
                    }"
                  >
                    <option value="">請選擇計畫類型</option>
                    <option value="group">團體</option>
                    <option value="private">個人教練</option>
                  </select>
                  <label v-if="refPlanTypeError" class="label">
                    <span
                      class="label-text-alt"
                      :style="{ color: 'var(--color-error)' }"
                      >{{ refPlanTypeError }}</span
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
                    v-model.number="refQuota"
                    class="input input-bordered w-full"
                    :class="{ 'input-error': refQuotaError }"
                    :style="{
                      backgroundColor: 'var(--color-input-bg)',
                      borderColor: refQuotaError
                        ? 'var(--color-error)'
                        : 'var(--color-input-border)',
                      color: 'var(--color-text)',
                    }"
                    min="1"
                    max="100"
                    placeholder="請輸入1-100之間的數字"
                  />
                  <label v-if="refQuotaError" class="label">
                    <span
                      class="label-text-alt"
                      :style="{ color: 'var(--color-error)' }"
                      >{{ refQuotaError }}</span
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
                  v-if="refTrainingSlots.length === 0"
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
                    v-for="(slot, index) in refTrainingSlots"
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

                <label v-if="refTrainingSlotError" class="label mt-3">
                  <span
                    class="label-text-alt"
                    :style="{ color: 'var(--color-error)' }"
                    >{{ refTrainingSlotError }}</span
                  >
                </label>
              </div>
            </div>

            <div class="card-actions justify-end mt-4">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="refLoading"
                :style="{
                  backgroundColor: 'var(--color-primary)',
                  borderColor: 'var(--color-primary)',
                  color: 'white',
                }"
              >
                <span v-if="refLoading" class="loading loading-spinner"></span>
                {{ refEditTrainingPlanId != 0 ? "更新" : "新增" }}
              </button>
              <button
                type="button"
                class="btn btn-ghost"
                @click="
                  () => (refEditTrainingPlanId ? handleCancelEdit() : back())
                "
                :disabled="refLoading"
                :style="{
                  backgroundColor: 'var(--color-button-bg)',
                  borderColor: 'var(--color-button-border)',
                  color: 'var(--color-text)',
                }"
              >
                {{ refEditTrainingPlanId != 0 ? "取消" : "返回" }}
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
            :trainingPlans="refTrainee.trainingPlan"
            @edit="handleEditTrainingPlan"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useTraineeStore } from "../stores/trainee";
import { ElMessage } from "element-plus";
import LoadingState from "../components/LoadingState.vue";
import TrainingPlanList from "../components/TrainingPlanList.vue";
import { Trainee } from "../services/trainee";
import { Coach } from "../services/coach";
import { TrainingPlan } from "../services/trainingPlan";
import { ModifyTrainingPlan } from "../services/modifyTrainingPlan";
import { TrainingSlot } from "../services/trainingPlan";

const router = useRouter();
const traineeStore = useTraineeStore();

const refTrainee = ref<Trainee | null>(null);
const refCoaches = ref<Coach[] | null>([]);
const refSelectedCoach = ref<number>(0);
const refPlanType = ref<string>("");
const refQuota = ref<number>(0);
const refTrainingSlots = ref<TrainingSlot[]>([]);
const refLoading = ref<boolean>(false);
const refError = ref<string>("");
const refCoachError = ref<string>("");
const refPlanTypeError = ref<string>("");
const refQuotaError = ref<string>("");
const refTrainingSlotError = ref<string>("");
const refEditTrainingPlanId = ref<number>(0);
const refEditorId = ref<number>(0);

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

onMounted(async () => {
  refLoading.value = true;

  try {
    const routeState = history.state;
    const id = Number(routeState?.id);
    refEditorId.value = Number(routeState?.editor);

    const [trainee, coaches] = await Promise.all([
      traineeStore.fetchById(id),
      traineeStore.fetchCoaches(),
    ]);

    refTrainee.value = trainee;
    refCoaches.value = coaches;
  } catch (err) {
    refError.value =
      err instanceof Error ? err.message : "發生錯誤，請稍後再試";
  } finally {
    refLoading.value = false;
  }
});

watch(refQuota, (newValue) => {
  if (typeof newValue === "number") {
    if (newValue < 1) refQuota.value = 1;
    if (newValue > 100) refQuota.value = 100;
  }
});

const addTrainingSlot = () => {
  refTrainingSlots.value.push({
    dayOfWeek: "",
    start: "09:00",
    end: "10:00",
  });
};

const removeTrainingSlot = (index: number) => {
  refTrainingSlots.value.splice(index, 1);
};

const getEndTimeOptions = (startTime: string) => {
  if (!startTime) return timeOptions;
  const startHour = parseInt(startTime.split(":")[0]);
  return timeOptions.filter((time) => {
    const timeHour = parseInt(time.value.split(":")[0]);
    return timeHour > startHour;
  });
};

const validateForm = () => {
  if (!refSelectedCoach.value) {
    refCoachError.value = "請選擇教練";
  } else {
    refCoachError.value = "";
  }

  if (!refPlanType.value) {
    refPlanTypeError.value = "請選擇計畫類型";
  } else {
    refPlanTypeError.value = "";
  }

  if (!refQuota.value || refQuota.value == 0) {
    refQuotaError.value = "請輸入1-100之間的數字";
  } else {
    refQuotaError.value = "";
  }

  if (refTrainingSlots.value.length === 0) {
    refTrainingSlotError.value = "請至少設定一個訓練時段";
  } else {
    const hasInvalidSlot = refTrainingSlots.value.some(
      (slot) => !slot.dayOfWeek || !slot.start || !slot.end
    );
    if (hasInvalidSlot) {
      refTrainingSlotError.value = "請完整填寫所有訓練時段";
    } else {
      const hasInvalidTimeRange = refTrainingSlots.value.some((slot) => {
        if (!slot.start || !slot.end) return false;
        const startHour = parseInt(slot.start.split(":")[0]);
        const endHour = parseInt(slot.end.split(":")[0]);
        return endHour <= startHour;
      });
      if (hasInvalidTimeRange) {
        refTrainingSlotError.value = "結束時間必須晚於開始時間";
      } else {
        refTrainingSlotError.value = "";
      }
    }
  }
};

const handleSubmit = async () => {
  validateForm();
  if (
    refCoachError.value ||
    refPlanTypeError.value ||
    refQuotaError.value ||
    refTrainingSlotError.value
  ) {
    return;
  }

  if (!refTrainee.value) {
    refError.value = "找不到學員資料";
    return;
  }

  refLoading.value = true;
  try {
    const data: ModifyTrainingPlan = {
      trainee: refTrainee.value.id,
      coach: refSelectedCoach.value,
      planType: refPlanType.value,
      planQuota: refQuota.value,
      trainingSlot: refTrainingSlots.value,
      editor: refEditorId.value,
      id: 0,
    };

    if (refEditTrainingPlanId.value) {
      data.id = refEditTrainingPlanId.value;
      const result = await traineeStore.updateTrainingPlan(data);
      if (!result) {
        ElMessage.error("更新失敗");
        return;
      }
    } else {
      const result = await traineeStore.createTrainingPlan(data);
      if (!result) {
        ElMessage.error("新增失敗");
        return;
      }
    }

    const isEditMode = refEditTrainingPlanId.value != 0;

    refSelectedCoach.value = 0;
    refPlanType.value = "";
    refQuota.value = 0;
    refTrainingSlots.value = [];
    refEditTrainingPlanId.value = 0;

    const trainee = await traineeStore.fetchById(refTrainee.value.id);
    refTrainee.value = trainee;

    ElMessage.success(isEditMode ? "更新成功" : "新增成功");
  } catch (err) {
    refError.value =
      err instanceof Error ? err.message : "發生錯誤，請稍後再試";
  } finally {
    refLoading.value = false;
  }
};

const handleEditTrainingPlan = (trainingPlan: TrainingPlan) => {
  refEditTrainingPlanId.value = trainingPlan.id;
  refSelectedCoach.value = trainingPlan.coach.id;
  refPlanType.value = trainingPlan.planType;
  refQuota.value = trainingPlan.planQuota;

  let slots: TrainingSlot[] = [];

  if (typeof trainingPlan.trainingSlot === "string") {
    if (trainingPlan.trainingSlot.trim() === "") {
      slots = [];
    } else {
      try {
        const parsedSlots = JSON.parse(trainingPlan.trainingSlot);
        if (Array.isArray(parsedSlots)) {
          slots = parsedSlots;
        } else {
          slots = [];
        }
      } catch (error) {
        console.error("解析 trainingSlot JSON 字串失敗:", error);
        slots = [];
      }
    }
  } else if (Array.isArray(trainingPlan.trainingSlot)) {
    slots = trainingPlan.trainingSlot;
  } else {
    slots = [];
  }

  if (slots.length > 0) {
    const uniqueSlots = slots.filter(
      (slot, index, self) =>
        index ===
        self.findIndex(
          (s) =>
            s.dayOfWeek === slot.dayOfWeek &&
            s.start === slot.start &&
            s.end === slot.end
        )
    );

    refTrainingSlots.value = uniqueSlots;
  } else {
    refTrainingSlots.value = [];
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleCancelEdit = () => {
  refEditTrainingPlanId.value = 0;
  refSelectedCoach.value = 0;
  refPlanType.value = "";
  refQuota.value = 0;
  refTrainingSlots.value = [];

  refCoachError.value = "";
  refPlanTypeError.value = "";
  refQuotaError.value = "";
  refTrainingSlotError.value = "";
  refError.value = "";
};

const back = () => {
  router.back();
};
</script>
