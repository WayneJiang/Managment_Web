<template>
  <div class="w-full">
    <div class="flex flex-col md:flex-row justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">公開課程管理</h1>
      <div class="flex gap-2 mt-2 md:mt-0">
        <button @click="showAddCourseModal" class="btn btn-primary btn-sm">
          <svg
            class="h-4 w-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            ></path>
          </svg>
          新增課程
        </button>
      </div>
    </div>

    <LoadingState :loading="refLoading" :error="refError" />

    <div v-if="!refLoading && !refError" class="w-full">
      <OpeningCourseWeekView
        :courses="refCourses"
        @edit="handleEditCourse"
        @delete="handleDeleteCourse"
      />
    </div>

    <!-- 課程表單模態框 -->
    <OpeningCourseForm
      :is-open="isModalOpen"
      :course="editingCourse"
      :coaches="refCoaches"
      @close="closeModal"
      @submit="handleSubmitCourse"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import OpeningCourseWeekView from "../components/OpeningCourseWeekView.vue";
import OpeningCourseForm from "../components/OpeningCourseForm.vue";
import LoadingState from "../components/LoadingState.vue";
import type {
  OpeningCourse,
  CreateOpeningCourse,
  UpdateOpeningCourse,
} from "../services/openoingCourse";
import type { Coach } from "../services/coach";
import { useCoachStore } from "../stores/coach";

const router = useRouter();
const coachStore = useCoachStore();

const refCourses = ref<OpeningCourse[]>([]);
const refCoaches = ref<Coach[]>([]);
const refLoading = ref<boolean>(false);
const refError = ref<string>("");

// 模態框狀態
const isModalOpen = ref<boolean>(false);
const editingCourse = ref<OpeningCourse | null>(null);

const fetchCourses = async (): Promise<void> => {
  refLoading.value = true;
  refError.value = "";

  try {
    const [courses, coaches] = await Promise.all([
      coachStore.fetchOpeningCourses(),
      coachStore.fetchCoaches(),
    ]);
    refCourses.value = courses;
    refCoaches.value = coaches;
  } catch (err: unknown) {
    const errorMessage: string =
      err instanceof Error ? err.message : "發生錯誤，請稍後再試";
    refError.value = errorMessage;
  } finally {
    refLoading.value = false;
  }
};

// 模態框相關功能
const showAddCourseModal = (): void => {
  editingCourse.value = null;
  isModalOpen.value = true;
};

const handleEditCourse = (course: OpeningCourse): void => {
  editingCourse.value = course;
  isModalOpen.value = true;
};

const handleDeleteCourse = async (course: OpeningCourse): Promise<void> => {
  if (!confirm(`確定要刪除課程「${course.name}」嗎？`)) {
    return;
  }

  try {
    const result = await coachStore.deleteOpeningCourse(course.id);
    if (result) {
      ElMessage.success("課程刪除成功");
      await fetchCourses(); // 重新載入課程列表
    } else {
      ElMessage.error("課程刪除失敗");
    }
  } catch (err: unknown) {
    const errorMessage: string =
      err instanceof Error ? err.message : "刪除失敗，請稍後再試";
    ElMessage.error(errorMessage);
  }
};

const handleSubmitCourse = async (
  courseData: CreateOpeningCourse | UpdateOpeningCourse
): Promise<void> => {
  try {
    let result: boolean;
    if ("id" in courseData) {
      // 更新模式
      result = await coachStore.updateOpeningCourses(
        courseData as UpdateOpeningCourse
      );
      if (result) {
        ElMessage.success("課程更新成功");
      } else {
        ElMessage.error("課程更新失敗");
        return;
      }
    } else {
      // 新增模式
      result = await coachStore.createOpeningCourse(
        courseData as CreateOpeningCourse
      );
      if (result) {
        ElMessage.success("課程新增成功");
      } else {
        ElMessage.error("課程新增失敗");
        return;
      }
    }

    // 重新載入課程列表
    await fetchCourses();
    closeModal();
  } catch (err: unknown) {
    const errorMessage: string =
      err instanceof Error ? err.message : "操作失敗，請稍後再試";
    ElMessage.error(errorMessage);
  }
};

const closeModal = (): void => {
  isModalOpen.value = false;
  editingCourse.value = null;
};

onMounted((): void => {
  fetchCourses();
});
</script>
