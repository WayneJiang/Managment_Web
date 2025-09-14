<template>
  <div class="w-full">
    <div class="space-y-4">
      <div
        v-for="day in weekDays"
        :key="day"
        class="bg-base-200 rounded-lg p-4"
      >
        <h3 class="text-lg font-semibold mb-4">{{ day }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="course in getCoursesByDay(day)"
            :key="course.id"
            class="bg-secondary text-secondary-content rounded-lg p-3 shadow-sm"
          >
            <div class="flex justify-between items-start mb-2">
              <div class="font-medium">課程名稱：{{ course.name }}</div>
              <div class="flex gap-1">
                <button
                  @click="$emit('edit', course)"
                  class="btn btn-xs btn-outline"
                  style="
                    border-color: white;
                    color: white;
                    background-color: transparent;
                  "
                >
                  <svg
                    class="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    ></path>
                  </svg>
                </button>
                <button
                  @click="$emit('delete', course)"
                  class="btn btn-xs btn-outline"
                  style="
                    border-color: white;
                    color: white;
                    background-color: transparent;
                  "
                >
                  <svg
                    class="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
            <div class="text-sm opacity-90">
              時段：{{ course.start }} - {{ course.end }}
            </div>
            <div class="text-sm opacity-90 mt-1">
              教練：{{ course.coach.name }}
            </div>
            <div v-if="course.note" class="text-xs opacity-75 mt-1">
              {{ course.note }}
            </div>
          </div>
          <div
            v-if="getCoursesByDay(day).length === 0"
            class="text-center text-base-content/50 text-sm py-4 col-span-full"
          >
            無課程
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OpeningCourse } from "../services/openoingCourse";

interface Props {
  courses: OpeningCourse[];
}

interface Emits {
  (e: "edit", course: OpeningCourse): void;
  (e: "delete", course: OpeningCourse): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const weekDays = [
  "星期一",
  "星期二",
  "星期三",
  "星期四",
  "星期五",
  "星期六",
  "星期日",
];

const dayMapping: Record<string, string> = {
  Monday: "星期一",
  Tuesday: "星期二",
  Wednesday: "星期三",
  Thursday: "星期四",
  Friday: "星期五",
  Saturday: "星期六",
  Sunday: "星期日",
};

const getCoursesByDay = (chineseDay: string): OpeningCourse[] => {
  const englishDay = Object.keys(dayMapping).find(
    (key) => dayMapping[key] === chineseDay
  );
  if (!englishDay) return [];
  return props.courses.filter((course) => course.dayOfWeek === englishDay);
};
</script>
