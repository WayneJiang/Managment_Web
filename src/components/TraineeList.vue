<template>
  <div class="card bg-base-100 shadow-xl mt-4 w-full">
    <div class="card-body">
      <h2 class="card-title text-2xl">學員列表</h2>
      <div class="overflow-x-auto mt-4 w-full">
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th>姓名</th>
              <th>本期訓練計畫</th>
              <th>本期負責教練</th>
              <th>本期剩餘額度</th>
              <th>更新資料</th>
              <th>新增計畫</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="trainee in trainees" :key="trainee.id" class="hover">
              <td>{{ trainee.name }}</td>
              <td>{{ plan(trainee.trainingPlan[0]?.planType) }}</td>
              <td>{{ trainee.trainingPlan[0]?.coach.name }}</td>
              <td>{{ trainee.trainingPlan[0]?.quota }}</td>
              <td>
                <button
                  class="btn btn-sm btn-primary"
                  @click="onUpdate(trainee)"
                >
                  更新
                </button>
              </td>
              <td>
                <button
                  class="btn btn-sm btn-primary"
                  @click="onAdd(trainee)"
                  :disabled="trainee.trainingPlan[0]?.quota > 0"
                  :title="
                    trainee.trainingPlan[0]?.quota > 0
                      ? '剩餘課程數必須為 0 才能新增計畫'
                      : '新增計畫'
                  "
                >
                  新增
                </button>
              </td>
            </tr>
            <tr v-if="trainees.length == 0">
              <td colspan="4" class="text-center">無學員記錄</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  trainees: {
    type: Array,
    default: () => [],
  },
});

const plan = (planType) => {
  switch (planType) {
    case "private":
      return "個人教練";
    case "group":
      return "團體";
  }
};

const emit = defineEmits(["update", "add"]);

const onUpdate = (trainee) => {
  emit("update", trainee);
};

const onAdd = (trainee) => {
  emit("add", trainee);
};
</script>
