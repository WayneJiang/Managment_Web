<template>
  <div class="w-full">
    <h1 class="text-3xl font-bold mb-4">訓練計畫</h1>
    <LoadingState :loading="refLoading" :error="refError" />

    <div v-if="!refLoading && !refError && refTrainee" class="w-full space-y-6">
      <div class="card bg-base-100 shadow-xl w-full">
        <div class="card-body">
          <h2 class="card-title text-2xl">
            {{ refEditTrainingPlanId != 0 ? "編輯" : "新增" }}
            {{ refTrainee.name }} 的訓練計畫
          </h2>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">負責教練</span>
                </label>
                <select
                  v-model="refSelectedCoach"
                  class="select select-bordered w-full"
                  :class="{ 'select-error': refCoachError }"
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
                  <span class="label-text-alt text-error">{{
                    refCoachError
                  }}</span>
                </label>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">計畫類型</span>
                </label>
                <select
                  v-model="refPlanType"
                  class="select select-bordered w-full"
                  :class="{ 'select-error': refPlanTypeError }"
                >
                  <option value="">請選擇計畫類型</option>
                  <option value="group">團體</option>
                  <option value="private">個人教練</option>
                </select>
                <label v-if="refPlanTypeError" class="label">
                  <span class="label-text-alt text-error">{{
                    refPlanTypeError
                  }}</span>
                </label>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">計畫額度</span>
                </label>
                <input
                  type="number"
                  v-model.number="refQuota"
                  class="input input-bordered w-full"
                  :class="{ 'input-error': refCoachError }"
                  min="1"
                  max="100"
                  placeholder="請輸入1-100之間的數字"
                />
                <label v-if="refQuotaError" class="label">
                  <span class="label-text-alt text-error">{{
                    refQuotaError
                  }}</span>
                </label>
              </div>
            </div>

            <div class="card-actions justify-end mt-4">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="refLoading"
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
              >
                {{ refEditTrainingPlanId != 0 ? "取消" : "返回" }}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div class="card bg-base-100 shadow-xl w-full">
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
import { useRoute, useRouter } from "vue-router";
import { useTraineeStore } from "../stores/trainee";
import { ElMessage } from "element-plus";
import LoadingState from "../components/LoadingState.vue";
import TrainingPlanList from "../components/TrainingPlanList.vue";
import { Trainee } from "../services/trainee";
import { Coach } from "../services/coach";
import { TrainingPlan } from "../services/trainingPlan";
import { ModifyTrainingPlan } from "../services/modifyTrainingPlan";

const route = useRoute();
const router = useRouter();
const traineeStore = useTraineeStore();

const refTrainee = ref<Trainee | null>(null);
const refCoaches = ref<Coach[] | null>([]);
const refSelectedCoach = ref<number>(0);
const refPlanType = ref<string>("");
const refQuota = ref<number>(0);
const refLoading = ref<boolean>(false);
const refError = ref<string>("");
const refCoachError = ref<string>("");
const refPlanTypeError = ref<string>("");
const refQuotaError = ref<string>("");
const refEditTrainingPlanId = ref<number>(0);
const refEditorId = ref<number>(0);

onMounted(async () => {
  refLoading.value = true;

  try {
    const id = Number(route.params.id as string);
    refEditorId.value = Number(route.params.editor as string);

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
};

const handleSubmit = async () => {
  validateForm();
  if (refCoachError.value || refPlanTypeError.value || refQuotaError.value) {
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
};

const handleCancelEdit = () => {
  refEditTrainingPlanId.value = 0;
  refSelectedCoach.value = 0;
  refPlanType.value = "";
  refQuota.value = 0;

  refCoachError.value = "";
  refPlanTypeError.value = "";
  refQuotaError.value = "";
  refError.value = "";
};

const back = () => {
  router.back();
};
</script>
