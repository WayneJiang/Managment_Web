<template>
  <div class="w-full">
    <h1 class="text-3xl font-bold mb-4">學員資訊</h1>
    <LoadingState :loading="refLoading" :error="refError" />

    <div v-if="!refLoading && !refError && refTrainee" class="w-full">
      <TraineeForm
        :trainee="refTrainee"
        :coach="refIsCoach"
        @save="save"
        @back="back"
      />
      <TrainingRecordList :trainingRecords="refTrainee.trainingRecord" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTraineeStore } from "../stores/trainee";
import { ElMessage } from "element-plus";
import LoadingState from "../components/LoadingState.vue";
import TraineeForm from "../components/TraineeForm.vue";
import TrainingRecordList from "../components/TrainingRecordList.vue";
import type { Trainee } from "../services/trainee";
import { ModifyTrainee } from "../services/modifyTrainee";

const route = useRoute();
const router = useRouter();
const traineeStore = useTraineeStore();

const refTrainee = ref<Trainee | null>(null);
const refLoading = ref<boolean>(false);
const refError = ref<string>("");
const refIsCoach = ref<boolean>(false);
const refIsRegister = ref<boolean>(false);
const refId = ref<string>("");

onMounted(async (): Promise<void> => {
  refLoading.value = true;
  refIsCoach.value = route.query.coach === "true";
  refIsRegister.value = route.query.register === "true";

  refId.value = route.params.id as string;
  try {
    if (!refIsRegister.value) {
      const trainee = await traineeStore.fetchById(Number(refId.value));
      refTrainee.value = trainee;
    } else {
      refTrainee.value = {
        id: 0,
        socialId: refId.value,
        name: "",
        gender: "male",
        birthday: "",
        height: 0,
        weight: 0,
        phone: "",
        trainingPlan: [],
        trainingRecord: [],
      } as Trainee;
    }
  } catch (err) {
    refError.value =
      err instanceof Error ? err.message : "發生錯誤，請稍後再試";
  } finally {
    refLoading.value = false;
  }
});

const save = async (modifyTrainee: ModifyTrainee): Promise<void> => {
  refLoading.value = true;

  try {
    if (refIsRegister.value) {
      const result = await traineeStore.createTrainee(
        refId.value,
        modifyTrainee
      );
      if (result) {
        ElMessage.success("已新增");
        if (refIsCoach.value) {
          back();
        }
      } else {
        ElMessage.error("新增失敗");
      }
    } else {
      const result = await traineeStore.updateTrainee(
        Number(refId.value),
        modifyTrainee
      );
      if (result) {
        ElMessage.success("已更新");
        if (refIsCoach.value) {
          back();
        }
      } else {
        ElMessage.error("更新失敗");
      }
    }
  } catch (err) {
    ElMessage.error(
      err instanceof Error ? err.message : "發生錯誤，請稍後再試"
    );
  } finally {
    refLoading.value = false;
  }
};

const back = (): void => {
  router.back();
};
</script>
