<template>
  <div class="card bg-base-100 shadow-xl mt-4 w-full">
    <div class="card-body">
      <h2 class="card-title text-2xl">簽到歷史記錄</h2>
      <div class="overflow-x-auto mt-4 w-full">
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th class="text-center">日期</th>
              <th class="text-center">時間</th>
              <th class="text-center">計畫</th>
              <th class="text-center">教練</th>
              <th class="text-center">剩餘額度</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(trainingRecord, index) in trainingRecords" :key="index">
              <td class="text-center">
                {{ formatDate(trainingRecord.createdDate) }}
              </td>
              <td class="text-center">
                {{ formatTime(trainingRecord.createdDate) }}
              </td>
              <td class="text-center">
                {{ plan(trainingRecord.trainingPlan?.planType) }}
              </td>
              <td class="text-center">
                {{ trainingRecord.trainingPlan?.coach?.name }}
              </td>
              <td class="text-center">
                {{ trainingRecord.trainingPlan?.quota }}
              </td>
            </tr>
            <tr v-if="trainingRecords.length === 0">
              <td colspan="5" class="text-center">無簽到記錄</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

const props = defineProps({
  trainingRecords: {
    type: Array,
    default: () => [],
  },
});

dayjs.extend(utc);
dayjs.extend(timezone);

const plan = (planType) => {
  switch (planType) {
    case "private":
      return "個人教練";
    case "group":
      return "團體";
  }
};

const formatDate = (dateTimeString) => {
  return dayjs(dateTimeString).tz("Asia/Taipei").format("YYYY-MM-DD");
};

const formatTime = (dateTimeString) => {
  return dayjs(dateTimeString).tz("Asia/Taipei").format("HH:mm:ss");
};
</script>
