<template>
  <div class="card bg-base-100 shadow-xl mt-4 w-full">
    <div class="card-body">
      <div class="flex justify-between items-center">
        <h2 class="card-title text-2xl">簽到歷史記錄</h2>
        <button
          class="btn btn-primary"
          @click="exportToPdf"
          :disabled="trainingRecords.length === 0"
        >
          匯出 PDF
        </button>
      </div>
      <div class="overflow-x-auto mt-4 w-full">
        <table class="table table-zebra responsive-table w-full">
          <thead>
            <tr>
              <th class="text-center">日期</th>
              <th class="text-center">時間</th>
              <th class="text-center">計畫</th>
              <th class="text-center">教練</th>
              <th class="text-center">額度</th>
              <th class="text-center">已用</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(trainingRecord, index) in trainingRecords" :key="index">
              <td class="text-center" :data-label="'日期'">
                {{ formatDate(trainingRecord.createdDate) }}
              </td>
              <td class="text-center" :data-label="'時間'">
                {{ formatTime(trainingRecord.createdDate) }}
              </td>
              <td class="text-center" :data-label="'計畫'">
                {{ plan(trainingRecord.trainingPlan?.planType) }}
              </td>
              <td class="text-center" :data-label="'教練'">
                {{ trainingRecord.trainingPlan?.coach?.name }}
              </td>
              <td class="text-center" :data-label="'額度'">
                {{ trainingRecord.trainingPlan?.planQuota }}
              </td>
              <td class="text-center" :data-label="'已用'">
                {{ trainingRecord.trainingPlan?.usedQuota }}
              </td>
            </tr>
            <tr v-if="trainingRecords.length === 0">
              <td colspan="6" class="text-center">無簽到記錄</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TrainingRecord } from "../services/trainingRecord";
import { TrainingPlan } from "../services/trainingPlan";

const props = defineProps<{
  trainingRecords: TrainingRecord[];
}>();

dayjs.extend(utc);
dayjs.extend(timezone);

const plan = (planType: TrainingPlan["planType"]): string => {
  if (!planType) return "";
  switch (planType) {
    case "private":
      return "個人教練";
    case "group":
      return "團體";
    default:
      return "";
  }
};

const formatDate = (dateTimeString: string): string => {
  return dayjs(dateTimeString).tz("Asia/Taipei").format("YYYY-MM-DD");
};

const formatTime = (dateTimeString: string): string => {
  return dayjs(dateTimeString).tz("Asia/Taipei").format("HH:mm:ss");
};

const exportToPdf = async (): Promise<void> => {
  const doc = new jsPDF();

  doc.addFont("/fonts/NotoSansTC-Regular.ttf", "NotoSansTC", "normal");
  doc.addFont("/fonts/NotoSansTC-Bold.ttf", "NotoSansTC", "bold");
  doc.setFont("NotoSansTC");

  doc.setFontSize(20);
  doc.text("簽到歷史記錄", 14, 20);

  const tableData = props.trainingRecords.map((record) => [
    formatDate(record.createdDate),
    formatTime(record.createdDate),
    plan(record.trainingPlan?.planType),
    record.trainingPlan?.coach?.name || "",
    record.trainingPlan?.planQuota?.toString() || "",
    record.trainingPlan?.usedQuota?.toString() || "",
  ]);

  autoTable(doc, {
    head: [["日期", "時間", "計畫", "教練", "額度", "已用"]],
    body: tableData,
    startY: 30,
    styles: {
      font: "NotoSansTC",
      fontSize: 10,
      halign: "center",
    },
    headStyles: {
      font: "NotoSansTC",
      fontStyle: "bold",
      fillColor: [66, 139, 202],
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
      halign: "center",
    },
    margin: { top: 30 },
  });

  doc.save(`簽到歷史記錄.pdf`);
};
</script>
