<template>
  <div class="w-full">
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div
        class="loading loading-spinner loading-lg"
        :style="{ color: 'var(--color-primary)' }"
      ></div>
      <div class="ml-2">加載中...</div>
    </div>
    <div
      v-if="error"
      class="alert mt-4"
      :style="{ backgroundColor: 'var(--color-error)', color: '#fff' }"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  loading: boolean;
  error: string;
}

defineProps<Props>();
</script>
