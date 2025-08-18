<template>
  <div
    class="card shadow-xl mt-4 w-full"
    :style="{
      backgroundColor: 'var(--color-card-bg)',
      color: 'var(--color-text)',
    }"
  >
    <div class="card-body">
      <div class="flex justify-between items-center">
        <h2 class="card-title text-2xl">簽到歷史記錄</h2>
        <button
          class="btn"
          :style="{
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            borderColor: 'var(--color-primary)',
          }"
          @click="exportToPdf"
          :disabled="trainingRecords.length === 0"
        >
          匯出 PDF
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <div
          v-for="(trainingRecord, index) in trainingRecords"
          :key="index"
          class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300"
          :style="{
            backgroundColor: 'var(--color-card-bg)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          }"
        >
          <div class="card-body p-4">
            <div class="flex justify-between items-start mb-3">
              <div
                class="badge badge-lg"
                :class="{
                  'badge-primary':
                    trainingRecord.trainingPlan?.planType === 'private',
                  'badge-secondary':
                    trainingRecord.trainingPlan?.planType === 'group',
                }"
              >
                {{ plan(trainingRecord.trainingPlan?.planType) }}
              </div>
            </div>

            <div class="mb-4">
              <div class="flex items-center gap-2 mb-2">
                <svg
                  class="w-4 h-4 opacity-70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
                <span class="font-semibold text-sm opacity-80">簽到日期</span>
              </div>
              <div class="text-lg font-bold">
                {{ formatDate(trainingRecord.createdDate) }}
              </div>
            </div>

            <div class="mb-4">
              <div class="flex items-center gap-2 mb-2">
                <svg
                  class="w-4 h-4 opacity-70"
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
                <span class="font-semibold text-sm opacity-80">簽到時間</span>
              </div>
              <div class="text-lg font-bold">
                {{ formatTime(trainingRecord.createdDate) }}
              </div>
            </div>

            <div class="mb-4">
              <div class="flex items-center gap-2 mb-2">
                <svg
                  class="w-4 h-4 opacity-70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
                <span class="font-semibold text-sm opacity-80">指導教練</span>
              </div>
              <div class="text-lg font-bold">
                <span
                  :class="{
                    'text-error': !trainingRecord.trainingPlan?.coach?.name,
                  }"
                >
                  {{ trainingRecord.trainingPlan?.coach?.name || "未指定" }}
                </span>
              </div>
            </div>

            <div
              class="flex justify-center items-center pt-3 border-t"
              :style="{ borderColor: 'var(--color-border)' }"
            >
              <div class="text-center">
                <div class="font-semibold text-sm opacity-80">剩餘</div>
                <div class="text-lg font-bold">
                  <span
                    :class="{
                      'text-error':
                        !trainingRecord.trainingPlan?.planQuota ||
                        trainingRecord.trainingPlan?.usedQuota === undefined,
                      'text-success':
                        trainingRecord.trainingPlan?.planQuota &&
                        trainingRecord.trainingPlan?.usedQuota !== undefined,
                    }"
                  >
                    {{
                      trainingRecord.trainingPlan?.planQuota &&
                      trainingRecord.trainingPlan?.usedQuota !== undefined
                        ? Math.max(
                            0,
                            trainingRecord.trainingPlan.planQuota -
                              trainingRecord.trainingPlan.usedQuota
                          )
                        : "未設定"
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="trainingRecords.length === 0" class="text-center py-8">
        <svg
          class="w-16 h-16 mx-auto opacity-50 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          ></path>
        </svg>
        <p class="text-lg opacity-70">目前沒有簽到記錄</p>
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
  return dayjs(dateTimeString).tz("Asia/Taipei").format("MM/DD");
};

const formatTime = (dateTimeString: string): string => {
  return dayjs(dateTimeString).tz("Asia/Taipei").format("HH:mm");
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
