<template>
  <div class="modal" :class="{ 'modal-open': isOpen }">
    <div class="modal-box max-w-4xl">
      <h3 class="font-bold text-lg mb-4">教練管理</h3>

      <!-- 新增教練按鈕 -->
      <div class="mb-4">
        <button
          @click="openCreateForm"
          class="btn btn-primary btn-sm"
          :disabled="isFormOpen"
        >
          新增教練
        </button>
      </div>

      <!-- 教練列表 -->
      <div v-if="!isFormOpen" class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>名字</th>
              <th>類型</th>
              <th>綁定狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="coach in coaches" :key="coach.id">
              <td>{{ coach.name }}</td>
              <td>
                <span
                  v-if="coach.coachType"
                  class="badge"
                  :class="{
                    'badge-primary': coach.coachType === 'Founder',
                    'badge-secondary': coach.coachType === 'Partner',
                    'badge-accent': coach.coachType === 'Team',
                  }"
                >
                  {{ coach.coachType }}
                </span>
                <span v-else class="badge badge-ghost">未設定</span>
              </td>
              <td>
                <div v-if="coach.socialId" class="flex items-center gap-2">
                  <span class="badge badge-success">已綁定</span>
                </div>
                <div v-else class="flex items-center gap-2">
                  <input
                    type="text"
                    :value="getBindUrl(coach.id)"
                    readonly
                    class="input input-sm input-bordered w-full max-w-xs text-xs"
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
                <div class="flex items-center">
                  <button
                    @click="openEditForm(coach)"
                    class="btn btn-outline btn-xs"
                  >
                    修改
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="coaches.length === 0" class="text-center py-8 text-gray-500">
          目前沒有教練資料
        </div>
      </div>

      <!-- 新增/修改表單 -->
      <div v-if="isFormOpen" class="space-y-4">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">名字</span>
            </label>
            <input
              v-model="formData.name"
              type="text"
              class="input"
              :style="{
                borderColor: errors.name
                  ? 'var(--color-error)'
                  : 'var(--color-input-border)',
                backgroundColor: 'var(--color-input-bg)',
                color: 'var(--color-text)',
              }"
            />
            <label v-if="errors.name" class="label">
              <span
                class="label-text-alt"
                :style="{ color: 'var(--color-error)' }"
                >{{ errors.name }}</span
              >
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">類型</span>
            </label>
            <select
              v-model="formData.coachType"
              class="select"
              :style="{
                borderColor: errors.coachType
                  ? 'var(--color-error)'
                  : 'var(--color-input-border)',
                backgroundColor: 'var(--color-input-bg)',
                color: 'var(--color-text)',
              }"
            >
              <option value="">請選擇類型</option>
              <option value="Founder">Founder</option>
              <option value="Partner">Partner</option>
              <option value="Team">Team</option>
            </select>
            <label v-if="errors.coachType" class="label">
              <span
                class="label-text-alt"
                :style="{ color: 'var(--color-error)' }"
                >{{ errors.coachType }}</span
              >
            </label>
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
              :class="{ 'btn-disabled': isSubmitting }"
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

      <!-- Modal 關閉按鈕 -->
      <div class="modal-action" v-if="!isFormOpen">
        <button @click="closeModal" class="btn btn-outline">關閉</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { Coach, CoachType, CreateCoach, UpdateCoach } from "../services/coach";

interface Props {
  isOpen: boolean;
  coaches: Coach[];
}

interface Emits {
  (e: "close"): void;
  (e: "create", data: CreateCoach): void;
  (e: "update", data: UpdateCoach): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isFormOpen = ref<boolean>(false);
const isSubmitting = ref<boolean>(false);
const editingCoach = ref<Coach | null>(null);
const copiedCoachId = ref<number | null>(null);

// 錯誤狀態管理
const errors = ref<{
  name: string;
  coachType: string;
}>({
  name: "",
  coachType: "",
});

const formData = ref<{
  socialId:string;
  name: string;
  coachType: CoachType | "";
}>({
  socialId:"",
  name: "",
  coachType: "",
});

const isEdit = computed(() => !!editingCoach.value);

// 清除所有錯誤
const clearErrors = (): void => {
  errors.value = {
    name: "",
    coachType: "",
  };
};

// 驗證單一欄位
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
    socialId:"",
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
    socialId:"",
    name: coach.name,
    coachType: coach.coachType || "Team", // 預設為 Team
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
    // 驗證所有欄位
    errors.value.name = validateField("name", formData.value.name);
    errors.value.coachType = validateField("coachType", formData.value.coachType);

    // 檢查是否有任何錯誤
    const hasError = Object.values(errors.value).some((error) => error !== "");

    if (hasError) {
      isSubmitting.value = false;
      return;
    }

    if (isEdit.value && editingCoach.value) {
      // 更新模式
      const updateData: UpdateCoach = {
        id: editingCoach.value.id,
        name: formData.value.name.trim(),
        coachType: formData.value.coachType as CoachType,
        socialId: editingCoach.value.socialId,
      };
      console.log("Update coach data:", updateData);
      emit("update", updateData);
    } else {
      // 建立模式
      const createData: CreateCoach = {
        name: formData.value.name.trim(),
        coachType: formData.value.coachType as CoachType,
      };
      console.log("Create coach data:", createData);
      emit("create", createData);
    }

    closeForm();
  } catch (error) {
    // 錯誤處理
  } finally {
    isSubmitting.value = false;
  }
};

const closeModal = (): void => {
  emit("close");
  resetForm();
  isFormOpen.value = false;
};

/**
 * 生成綁定網址
 */
const getBindUrl = (coachId: number): string => {
  return `${window.location.origin}/bind?coachId=${coachId}`;
};

/**
 * 複製綁定網址
 */
const copyBindUrl = async (coachId: number): Promise<void> => {
  try {
    const url = getBindUrl(coachId);
    await navigator.clipboard.writeText(url);
    copiedCoachId.value = coachId;

    // 2秒後重置複製狀態
    setTimeout(() => {
      copiedCoachId.value = null;
    }, 2000);
  } catch (error) {
    console.error("Failed to copy URL:", error);
  }
};

watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      closeForm();
      copiedCoachId.value = null;
    }
  }
);
</script>
