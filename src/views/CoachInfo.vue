<template>
  <div class="w-full">
    <div class="flex flex-col md:flex-row justify-between items-center mb-4">
      <h1 class="text-3xl font-bold">教練管理介面</h1>
      <div
        v-if="refCoachName"
        class="badge badge-primary badge-lg mt-2 md:mt-0"
      >
        {{ refCoachName }}
      </div>
    </div>

    <LoadingState :loading="refLoading" :error="refError" />

    <div v-if="!refLoading && !refError" class="w-full">
      <TraineeList
        :trainees="refTrainees"
        @update="navigateToUpdate"
        @add="navigateToAdd"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCoachStore } from "../stores/coach";

const route = useRoute();
const router = useRouter();
const coachStore = useCoachStore();

const refCoachName = ref("");
const refTrainees = ref([]);
const refLoading = ref(false);
const refError = ref("");

onMounted(async () => {
  refLoading.value = true;

  try {
    const id = route.params.id;

    const coach = await coachStore.fetchById(id);
    refCoachName.value = coach.name;

    const trainees = await coachStore.fetchAll();
    refTrainees.value = trainees;
  } catch (err) {
    refError.value = err.message || "發生錯誤，請稍後再試";
  } finally {
    refLoading.value = false;
  }
});

const navigateToUpdate = (trainee) => {
  router.push(`/trainee/info/${trainee.id}?coach=true`);
};

const navigateToAdd = (trainee) => {
  router.push(`/plan/${trainee.id}`);
};
</script>
