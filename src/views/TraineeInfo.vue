<template>
  <div class="w-full">
    <h1 class="text-3xl font-bold mb-4">學員資訊</h1>
    <LoadingState :loading="refLoading" :error="refError" />

    <div v-if="!refLoading && !refError && refTrainee" class="w-full">
      <TraineeFormComponent
        :trainee="refTrainee"
        :coach="refIsCoach"
        @save="save"
        @back="back"
      />
      <TrainingRecordComponent :trainingRecords="refTrainee.trainingRecord" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTraineeStore } from "../stores/trainee";
import LoadingState from "../components/LoadingState.vue";
import TraineeFormComponent from "../components/TraineeForm.vue";
import TrainingRecordComponent from "../components/TrainingRecord.vue";

const route = useRoute();
const router = useRouter();
const traineeStore = useTraineeStore();

const refTrainee = ref(null);
const refLoading = ref(false);
const refError = ref("");
const refIsCoach = ref(false);

onMounted(async () => {
  refLoading.value = true;
  refIsCoach.value = route.query.coach == "true";

  try {
    const id = route.params.id;
    const trainee = await traineeStore.fetchById(id);
    refTrainee.value = trainee;
  } catch (err) {
    refError.value = err.message || "發生錯誤，請稍後再試";
  } finally {
    refLoading.value = false;
  }
});

const save = async (trainee) => {
  refLoading.value = true;

  try {
    const result = await traineeStore.updateTrainee(trainee);
    if (result) {
      alert("已更新");
      if (refIsCoach.value) {
        back();
      }
    } else {
      refError.value = "更新失敗";
    }
  } catch (err) {
    refError.value = err.message || "發生錯誤，請稍後再試";
  } finally {
    refLoading.value = false;
  }
};

const back = () => {
  router.back();
};
</script>
