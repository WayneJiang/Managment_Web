<template>
  <div class="w-full">
    <!-- 頁面標題列 -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-4">
      <h1 class="text-xl font-bold">教練管理</h1>
      <div class="flex items-center gap-2 mt-2 md:mt-0">
        <button
          v-if="!isFormOpen"
          @click="openCreateForm"
          class="btn btn-primary btn-sm"
        >
          新增教練
        </button>
      </div>
    </div>

    <!-- 教練列表卡片 -->
    <div
      v-if="!isFormOpen"
      class="card shadow-xl w-full"
    >
      <div class="card-body">
        <h2 class="card-title text-2xl">教練列表</h2>
        <div class="overflow-x-auto mt-2">
          <table class="table w-full">
            <thead>
              <tr>
                <th class="w-1/4">名字</th>
                <th class="w-1/4">類型</th>
                <th class="w-1/4">綁定狀態</th>
                <th class="w-1/4">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="coach in coaches" :key="coach.id">
                <td>
                  <span
                    class="underline decoration-dotted underline-offset-4 cursor-pointer transition-colors hover-brand"
                    @click="handleViewRecords(coach)"
                  >
                    {{ coach.name }}
                  </span>
                </td>
                <td>
                  <span
                    v-if="coach.coachType"
                    class="badge"
                    :class="{
                      'badge-error': coach.coachType === 'Founder',
                      'badge-primary': coach.coachType === 'Partner',
                      'badge-success': coach.coachType === 'Team',
                    }"
                  >
                    {{ getCoachTypeLabel(coach) }}
                  </span>
                  <span v-else class="badge badge-soft badge-neutral">未設定</span>
                </td>
                <td>
                  <div v-if="coach.socialId" class="flex items-center gap-2">
                    <span class="badge badge-soft badge-accent">已綁定</span>
                  </div>
                  <div v-else class="flex items-center gap-2">
                    <input
                      type="text"
                      :value="getBindUrl(coach.id)"
                      readonly
                      class="input input-sm w-full max-w-xs text-xs"
                    />
                    <button
                      @click="copyBindUrl(coach.id)"
                      class="btn btn-outline btn-xs"
                      :class="{ 'btn-success': copiedCoachId === coach.id }"
                    >
                      {{ copiedCoachId === coach.id ? '已複製' : '複製' }}
                    </button>
                  </div>
                </td>
                <td>
                  <button
                    @click="openEditForm(coach)"
                    class="btn btn-outline btn-xs"
                  >
                    修改
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="coaches.length === 0" class="text-center py-8 text-gray-500">
            目前沒有教練資料
          </div>
        </div>
      </div>
    </div>

    <!-- PDF 檔案下載區塊 -->
    <div v-if="!isFormOpen" key="pdf-section" class="card shadow-xl w-full mt-4">
      <div class="card-body">
        <div class="flex justify-between items-center">
          <h2 class="card-title text-2xl">PDF 檔案</h2>
          <div class="flex gap-2">
            <button
              @click="handleRegenerateReport"
              class="btn btn-soft btn-primary btn-sm"
              :disabled="isRegenerating"
            >
              <span v-if="isRegenerating" class="loading loading-spinner loading-sm"></span>
              {{ isRegenerating ? '產生中...' : '重新產生報表' }}
            </button>
            <button
              @click="fetchBlobs"
              class="btn btn-outline btn-sm"
              :disabled="isLoadingBlobs"
            >
              <span v-if="isLoadingBlobs" class="loading loading-spinner loading-sm"></span>
              重新整理
            </button>
          </div>
        </div>

        <div v-if="isLoadingBlobs" class="flex justify-center py-8">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <template v-else>
        <div v-if="blobFiles.length === 0" class="text-center py-8 text-gray-500">
          目前沒有 PDF 檔案
        </div>

        <div v-else class="overflow-x-auto mt-2">
          <table class="table w-full">
            <thead>
              <tr>
                <th class="w-1/2">檔案名稱</th>
                <th class="w-1/4">大小</th>
                <th class="w-1/4">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="file in blobFiles" :key="file.url">
                <td>{{ file.pathname }}</td>
                <td>{{ formatFileSize(file.size) }}</td>
                <td>
                  <a
                    :href="file.url"
                    target="_blank"
                    class="btn btn-soft btn-primary btn-xs"
                  >
                    下載
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </template>
      </div>
    </div>

    <!-- 年度統計卡片 -->
    <div
      v-if="selectedCoach && !isFormOpen"
      class="card shadow-xl w-full mt-4"
    >
      <div class="card-body">
        <div class="flex justify-between items-center">
          <h2 class="card-title text-2xl">{{ selectedCoach.name }} 的年度統計</h2>
          <button @click="closeRecords" class="btn btn-outline btn-sm">關閉</button>
        </div>

        <div v-if="isLoadingYearlySummary" class="flex justify-center py-8">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <div v-else-if="yearlySummary.personal.length === 0 && yearlySummary.sequential.length === 0" class="text-center py-8 text-gray-500">
          目前沒有年度統計資料
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <!-- 個人課程年度統計 -->
          <div v-if="yearlySummary.personal.length > 0">
            <h3 class="font-bold text-lg mb-2">個人課程</h3>
            <div class="overflow-x-auto">
              <table class="table table-sm w-full">
                <thead>
                  <tr>
                    <th>年度</th>
                    <th>上課人數</th>
                    <th>上課堂數</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in yearlySummary.personal" :key="row.year">
                    <td class="font-medium">{{ row.year }}</td>
                    <td>{{ row.totalAttendees }} 人</td>
                    <td>{{ row.totalSessions }} 堂</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 團體課程年度統計 -->
          <div v-if="yearlySummary.sequential.length > 0">
            <h3 class="font-bold text-lg mb-2">團體課程</h3>
            <div class="overflow-x-auto">
              <table class="table table-sm w-full">
                <thead>
                  <tr>
                    <th>年度</th>
                    <th>上課人數</th>
                    <th>開課次數</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in yearlySummary.sequential" :key="row.year">
                    <td class="font-medium">{{ row.year }}</td>
                    <td>{{ row.totalAttendees }} 人</td>
                    <td>{{ row.totalSessions }} 次</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 課程紀錄卡片 -->
    <div
      v-if="selectedCoach && !isFormOpen"
      class="card shadow-xl w-full mt-4"
    >
      <div class="card-body">
        <div class="flex justify-between items-center">
          <h2 class="card-title text-2xl">{{ selectedCoach.name }} 的課程紀錄</h2>
          <button @click="closeRecords" class="btn btn-outline btn-sm">關閉</button>
        </div>

        <div v-if="isLoadingRecords" class="flex justify-center py-8">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <div v-else-if="coachRecords.length === 0" class="text-center py-8 text-gray-500">
          目前沒有課程紀錄
        </div>

        <div v-else class="overflow-x-auto mt-2">
          <table class="table w-full">
            <thead>
              <tr>
                <th class="w-1/4">時間</th>
                <th class="w-1/4">學員</th>
                <th class="w-1/4">類型</th>
                <th class="w-1/4">課程</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(dayRecords, date) in pagedGroupedRecords" :key="date">
                <tr>
                  <td colspan="4" class="bg-base-200 font-bold">
                    {{ date }}
                    <span class="badge badge-sm ml-2">{{ dayRecords.length }} 堂</span>
                  </td>
                </tr>
                <tr v-for="record in dayRecords" :key="record.id">
                  <td>{{ formatTime(record.createdDate) }}</td>
                  <td>{{ record.trainee?.name || '未知學員' }}</td>
                  <td>
                    <span
                      class="badge badge-sm"
                      :class="{
                        'badge-primary': record.trainingPlan?.planType === 'Personal',
                        'badge-success': record.trainingPlan?.planType === 'FlexiblePersonal',
                        'badge-warning': record.trainingPlan?.planType === 'Sequential',
                      }"
                    >
                      {{ getPlanTypeLabel(record.trainingPlan?.planType) }}
                    </span>
                  </td>
                  <td>{{ record.openingCourse?.name || '-' }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- 分頁 -->
        <div v-if="!isLoadingRecords && totalPages > 1" class="flex justify-center items-center gap-2 mt-4">
          <button
            class="btn btn-sm"
            :disabled="currentPage <= 1"
            @click="currentPage--"
          >
            上一頁
          </button>
          <span>{{ currentPage }} / {{ totalPages }}</span>
          <button
            class="btn btn-sm"
            :disabled="currentPage >= totalPages"
            @click="currentPage++"
          >
            下一頁
          </button>
        </div>
      </div>
    </div>

    <!-- 新增/修改表單卡片 -->
    <div
      v-if="isFormOpen"
      class="card shadow-xl w-full"
    >
      <div class="card-body">
        <h2 class="card-title text-2xl">{{ isEdit ? '修改教練' : '新增教練' }}</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4 mt-2">
          <div>
            <label class="label">
              <span class="font-medium">名字</span>
            </label>
            <input
              v-model="formData.name"
              type="text"
              class="input w-full"
              :class="{ 'input-error': errors.name }"
            />
            <p v-if="errors.name" class="text-sm text-error mt-1">
              {{ errors.name }}
            </p>
          </div>

          <div>
            <label class="label">
              <span class="font-medium">類型</span>
            </label>
            <select
              v-model="formData.coachType"
              class="select w-full"
              :class="{ 'select-error': errors.coachType }"
            >
              <option value="">請選擇類型</option>
              <option value="Founder">創辦人</option>
              <option value="Partner">合作教練</option>
              <option value="Team">旗下教練</option>
            </select>
            <p v-if="errors.coachType" class="text-sm text-error mt-1">
              {{ errors.coachType }}
            </p>
          </div>

          <div class="flex gap-2 justify-end">
            <button
              type="button"
              @click="closeForm"
              class="btn btn-outline btn-sm"
            >
              取消
            </button>
            <button
              type="submit"
              class="btn btn-primary btn-sm"
              :disabled="isSubmitting"
            >
              <span
                v-if="isSubmitting"
                class="loading loading-spinner loading-sm"
              ></span>
              {{ isSubmitting ? "處理中..." : isEdit ? "修改" : "新增" }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useCoachStore } from "../stores/coach";
import { api } from "../services/api";
import axios from "axios";
import type { Coach, CoachType, CreateCoach, UpdateCoach } from "../services/coach";
import type { TrainingRecord } from "../services/training-record";

interface BlobFile {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
}

const coachStore = useCoachStore();

const isFormOpen = ref<boolean>(false);
const isSubmitting = ref<boolean>(false);
const editingCoach = ref<Coach | null>(null);
const copiedCoachId = ref<number | null>(null);
const selectedCoach = ref<Coach | null>(null);
const coachRecords = ref<TrainingRecord[]>([]);
const isLoadingRecords = ref<boolean>(false);
const isLoadingYearlySummary = ref<boolean>(false);
const yearlySummary = ref<{
  personal: { year: string; totalAttendees: number; totalSessions: number }[];
  sequential: { year: string; totalAttendees: number; totalSessions: number }[];
}>({ personal: [], sequential: [] });
const currentPage = ref<number>(1);
const pageSize = 20;

// Blob 檔案相關
const blobFiles = ref<BlobFile[]>([]);
const isLoadingBlobs = ref<boolean>(false);
const isRegenerating = ref<boolean>(false);

const errors = ref<{
  name: string;
  coachType: string;
}>({
  name: "",
  coachType: "",
});

const formData = ref<{
  socialId: string;
  name: string;
  coachType: CoachType | "";
}>({
  socialId: "",
  name: "",
  coachType: "",
});

const isEdit = computed(() => !!editingCoach.value);

const currentCoach = computed(() => coachStore.currentCoach);

const coaches = computed(() => {
  if (!currentCoach.value) return coachStore.coaches;
  return coachStore.coaches.filter((coach) => coach.id !== currentCoach.value?.id);
});

onMounted(async () => {
  await Promise.all([
    coachStore.fetchCoaches(),
    coachStore.fetchAll(),
    fetchBlobs(),
  ]);
});

function getCoachTypeLabel(coach: Coach): string {
  if (!coach.coachType) return "";
  if (coach.id === 1) return "共同創辦人";
  if (coach.id === 2) return "創辦人";

  const labels: Record<CoachType, string> = {
    Founder: "創辦人",
    Partner: "合作教練",
    Team: "旗下教練",
  };
  return labels[coach.coachType] || coach.coachType;
}

const clearErrors = (): void => {
  errors.value = {
    name: "",
    coachType: "",
  };
};

const validateField = (field: keyof typeof errors.value, value: string): string => {
  switch (field) {
    case "name":
      if (!value || value.trim() === "") {
        return "name should not be empty";
      }
      if (typeof value !== "string") {
        return "name must be a string";
      }
      return "";
    case "coachType":
      if (!value) {
        return "請選擇類型";
      }
      if (!["Founder", "Partner", "Team"].includes(value)) {
        return "coachType must be one of the following values: Founder, Partner, Team";
      }
      return "";
    default:
      return "";
  }
};

const resetForm = (): void => {
  formData.value = {
    socialId: "",
    name: "",
    coachType: "",
  };
  editingCoach.value = null;
  clearErrors();
};

const openCreateForm = (): void => {
  resetForm();
  isFormOpen.value = true;
};

const openEditForm = (coach: Coach): void => {
  editingCoach.value = coach;
  formData.value = {
    socialId: "",
    name: coach.name,
    coachType: coach.coachType || "Team",
  };
  clearErrors();
  isFormOpen.value = true;
};

const closeForm = (): void => {
  isFormOpen.value = false;
  resetForm();
};

const handleSubmit = async (): Promise<void> => {
  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;
  clearErrors();

  try {
    errors.value.name = validateField("name", formData.value.name);
    errors.value.coachType = validateField("coachType", formData.value.coachType);

    const hasError = Object.values(errors.value).some((error) => error !== "");

    if (hasError) {
      isSubmitting.value = false;
      return;
    }

    if (isEdit.value && editingCoach.value) {
      const updateData: UpdateCoach = {
        id: editingCoach.value.id,
        name: formData.value.name.trim(),
        coachType: formData.value.coachType as CoachType,
        socialId: editingCoach.value.socialId,
      };
      await coachStore.updateCoach(updateData);
    } else {
      const createData: CreateCoach = {
        name: formData.value.name.trim(),
        coachType: formData.value.coachType as CoachType,
      };
      await coachStore.createCoach(createData);
    }

    closeForm();
  } catch (error) {
    // 錯誤處理
  } finally {
    isSubmitting.value = false;
  }
};

const handleViewRecords = async (coach: Coach): Promise<void> => {
  selectedCoach.value = coach;
  coachRecords.value = [];
  yearlySummary.value = { personal: [], sequential: [] };
  currentPage.value = 1;
  isLoadingRecords.value = true;
  isLoadingYearlySummary.value = true;

  // 同時載入年度統計
  api.getCoachYearlySummary(coach.id).then((data) => {
    yearlySummary.value = data;
  }).catch((error) => {
    console.error("Failed to fetch yearly summary:", error);
  }).finally(() => {
    isLoadingYearlySummary.value = false;
  });

  try {
    // 從 store 中找出該教練負責的學員（透過 trainingPlan.coach）
    const trainees = coachStore.trainees;
    const traineeIds = new Set<number>();
    for (const trainee of trainees) {
      for (const plan of trainee.trainingPlan || []) {
        if (plan.coach?.id === coach.id) {
          traineeIds.add(trainee.id);
          break;
        }
      }
    }

    // 建立學員 ID → 名字的對照表
    const traineeNameMap = new Map<number, string>();
    for (const trainee of trainees) {
      traineeNameMap.set(trainee.id, trainee.name);
    }

    // 逐一查詢每位學員的紀錄，並篩選屬於該教練的
    const allRecords: TrainingRecord[] = [];
    const fetchPromises = Array.from(traineeIds).map(async (traineeId) => {
      let page = 1;
      let totalPages = 1;
      while (page <= totalPages) {
        const result = await api.getByTrainingRecord(traineeId, page);
        for (const record of result.data) {
          if (record.trainingPlan?.coach?.id === coach.id) {
            // 確保 trainee 有名字資訊
            if (!record.trainee?.name) {
              const name = traineeNameMap.get(traineeId);
              if (name) {
                record.trainee = { ...record.trainee, id: traineeId, name } as any;
              }
            }
            allRecords.push(record);
          }
        }
        totalPages = result.totalPages;
        page++;
      }
    });

    await Promise.all(fetchPromises);

    // 按日期降序排列
    allRecords.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
    coachRecords.value = allRecords;
  } catch (error) {
    console.error("Failed to fetch coach records:", error);
  } finally {
    isLoadingRecords.value = false;
  }
};

const closeRecords = (): void => {
  selectedCoach.value = null;
  coachRecords.value = [];
  yearlySummary.value = { personal: [], sequential: [] };
};

const totalPages = computed(() => Math.ceil(coachRecords.value.length / pageSize));

const pagedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return coachRecords.value.slice(start, start + pageSize);
});

const pagedGroupedRecords = computed(() => {
  const groups: Record<string, TrainingRecord[]> = {};
  for (const record of pagedRecords.value) {
    const date = new Date(record.createdDate).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
  }
  return groups;
});

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getPlanTypeLabel = (planType?: string): string => {
  const labels: Record<string, string> = {
    Personal: "個人教練",
    FlexiblePersonal: "個人彈性",
    Sequential: "團體課程",
  };
  return planType ? labels[planType] || planType : "未知";
};

const getBindUrl = (coachId: number): string => {
  return `${window.location.origin}/bind?coachId=${coachId}`;
};

const copyBindUrl = async (coachId: number): Promise<void> => {
  try {
    const url = getBindUrl(coachId);
    await navigator.clipboard.writeText(url);
    copiedCoachId.value = coachId;

    setTimeout(() => {
      copiedCoachId.value = null;
    }, 2000);
  } catch (error) {
    console.error("Failed to copy URL:", error);
  }
};

// ===== Blob 檔案相關 =====
const BLOB_TOKEN = import.meta.env.VITE_BLOB_READ_WRITE_TOKEN || "";

const fetchBlobs = async (): Promise<void> => {
  isLoadingBlobs.value = true;
  try {
    if (BLOB_TOKEN) {
      // 本地開發：透過 Vite proxy 轉發到 vercel.com/api/blob
      const response = await axios.get("/api/blobs", {
        headers: { Authorization: `Bearer ${BLOB_TOKEN}` },
      });
      const allBlobs = response.data.blobs || [];
      blobFiles.value = allBlobs
        .filter((b: any) => b.pathname.endsWith(".pdf"))
        .map((b: any) => ({ url: b.url, pathname: b.pathname, size: b.size, uploadedAt: b.uploadedAt }));
    } else {
      // 正式環境：走 Serverless Function
      const response = await axios.get("/api/blobs");
      blobFiles.value = response.data;
    }
  } catch (error) {
    console.error("Failed to fetch blobs:", error);
  } finally {
    isLoadingBlobs.value = false;
  }
};

const API_BASE_URL = import.meta.env.VITE_API_URL;

const handleRegenerateReport = async (): Promise<void> => {
  isRegenerating.value = true;
  try {
    await axios.get(`${API_BASE_URL}/regenerateReport`);
    // 產生完成後重新載入檔案列表
    await fetchBlobs();
  } catch (error) {
    console.error("Failed to regenerate report:", error);
  } finally {
    isRegenerating.value = false;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
</script>
