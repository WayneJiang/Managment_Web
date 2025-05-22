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

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTraineeStore } from "../stores/trainee";
import LoadingState from "../components/LoadingState.vue";
import TraineeForm from "../components/TraineeForm.vue";
import TrainingRecordList from "../components/TrainingRecordList.vue";

const route = useRoute();
const router = useRouter();
const traineeStore = useTraineeStore();

const refTrainee = ref(null);
const refLoading = ref(false);
const refError = ref("");
const refIsCoach = ref(false);
const refIsRegister = ref(false);
const refSocialId = ref("");

onMounted(async () => {
  refLoading.value = true;
  refIsCoach.value = route.query.coach == "true";
  refIsRegister.value = route.query.register == "true";

  refSocialId.value = route.params.id;
  try {
    if (!refIsRegister.value) {
      const trainee = await traineeStore.fetchById(refSocialId.value);
      refTrainee.value = trainee;
    } else {
      refTrainee.value = {
        name: "",
        gender: "male",
        height: "0.0",
        weight: "0.0",
        phone: "",
      };
    }
  } catch (err) {
    refError.value = err.message || "發生錯誤，請稍後再試";
  } finally {
    refLoading.value = false;
  }
});

const save = async (trainee) => {
  refLoading.value = true;

  try {
    if (refIsRegister.value) {
      const result = await traineeStore.createTrainee(
        refSocialId.value,
        trainee
      );
      if (result) {
        alert("已新增");
        if (refIsCoach.value) {
          back();
        }
      } else {
        refError.value = "新增失敗";
      }
    } else {
      const result = await traineeStore.updateTrainee(trainee);
      if (result) {
        alert("已更新");
        if (refIsCoach.value) {
          back();
        }
      } else {
        refError.value = "更新失敗";
      }
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
