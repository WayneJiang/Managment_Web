<template>
  <div
    class="card shadow-xl mt-4 w-full"
    :style="{
      backgroundColor: 'var(--color-card-bg)',
      color: 'var(--color-text)',
    }"
  >
    <div class="card-body">
      <h2 class="card-title text-2xl">學員列表</h2>
      <div class="overflow-x-auto mt-4 w-full">
        <table
          class="table responsive-table w-full"
          :style="{ borderColor: 'var(--color-border)' }"
        >
          <thead>
            <tr>
              <th class="text-center">姓名</th>
              <th class="text-center">本期訓練計畫</th>
              <th class="text-center">本期負責教練</th>
              <th class="text-center">本期剩餘額度</th>
              <th class="text-center">更新資料</th>
              <th class="text-center">調整計畫</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="trainee in trainees"
              :key="trainee.id"
              class="hover"
              :style="{
                backgroundColor: 'var(--color-card-bg)',
                color: 'var(--color-text)',
              }"
            >
              <td class="text-center" :data-label="'姓名'">
                {{ trainee.name }}
              </td>
              <td class="text-center" :data-label="'本期訓練計畫'">
                {{ plan(trainee.trainingPlan[0]?.planType) }}
              </td>
              <td class="text-center" :data-label="'本期負責教練'">
                {{ trainee.trainingPlan[0]?.coach.name }}
              </td>
              <td class="text-center" :data-label="'本期剩餘額度'">
                {{ trainee.trainingPlan[0]?.planQuota }}
              </td>
              <td class="text-center" :data-label="'更新資料'">
                <button
                  class="btn btn-sm"
                  :style="{
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    borderColor: 'var(--color-primary)',
                  }"
                  @click="onUpdate(trainee)"
                >
                  更新
                </button>
              </td>
              <td class="text-center" :data-label="'調整計畫'">
                <button
                  class="btn btn-sm"
                  :style="{
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    borderColor: 'var(--color-primary)',
                  }"
                  @click="onAdjust(trainee)"
                >
                  調整
                </button>
              </td>
            </tr>
            <tr v-if="trainees.length == 0">
              <td colspan="6" class="text-center">無學員記錄</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import { Trainee } from "../services/trainee";
import { TrainingPlan } from "../services/trainingPlan";

interface Props {
  trainees: Trainee[];
}

const props = defineProps<Props>();

const plan = (planType: TrainingPlan["planType"]): string => {
  switch (planType) {
    case "private":
      return "個人教練";
    case "group":
      return "團體";
    default:
      return "";
  }
};

const emit = defineEmits<{
  (e: "update", trainee: Trainee): void;
  (e: "adjust", trainee: Trainee): void;
}>();

const onUpdate = (trainee: Trainee): void => {
  emit("update", trainee);
};

const onAdjust = (trainee: Trainee): void => {
  emit("adjust", trainee);
};
</script>
