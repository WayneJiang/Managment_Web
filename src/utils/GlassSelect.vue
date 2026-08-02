<template>
  <div ref="rootEl" class="glass-select">
    <button
      ref="triggerEl"
      type="button"
      class="input w-full glass-select-trigger"
      :class="{
        'input-sm': size === 'sm',
        'glass-select-trigger-error': error,
        'glass-select-trigger-open': isOpen,
      }"
      :disabled="disabled"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      @click="toggle"
      @keydown="onKeydown"
    >
      <span
        class="glass-select-value"
        :class="{ 'glass-select-value-empty': !selectedOption }"
      >
        {{ selectedOption ? selectedOption.label : placeholder }}
      </span>
      <svg
        class="glass-select-arrow"
        :class="{ 'glass-select-arrow-open': isOpen }"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6 8l4 4 4-4"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="listEl"
        class="glass-select-list"
        :class="{ 'glass-select-list-sm': size === 'sm' }"
        :style="listStyle"
        role="listbox"
        @mousedown.prevent
      >
        <div
          v-for="(option, index) in options"
          :key="index"
          ref="optionEls"
          class="glass-select-option"
          :class="{
            'glass-select-option-selected': isSelected(option),
            'glass-select-option-active': index === activeIndex,
            'glass-select-option-disabled': option.disabled,
          }"
          role="option"
          :aria-selected="isSelected(option)"
          @click="pick(option)"
          @mousemove="activeIndex = index"
        >
          <span class="glass-select-option-label">{{ option.label }}</span>
          <svg
            v-if="isSelected(option)"
            class="glass-select-check"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 10.5l3.5 3.5L15 7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div v-if="options.length === 0" class="glass-select-empty">
          無可選項目
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts">
export type GlassSelectValue = string | number | undefined | null;

export interface GlassSelectOption<T = GlassSelectValue> {
  value: T;
  label: string;
  disabled?: boolean;
}
</script>

<script setup lang="ts" generic="T extends GlassSelectValue">
import { ref, computed, nextTick, onBeforeUnmount, watch } from "vue";

interface Props {
  options: GlassSelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: "sm" | "md";
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "請選擇",
  disabled: false,
  error: false,
  size: "md",
});

const model = defineModel<T>();

const rootEl = ref<HTMLElement | null>(null);
const triggerEl = ref<HTMLButtonElement | null>(null);
const listEl = ref<HTMLElement | null>(null);
const optionEls = ref<HTMLElement[]>([]);

const isOpen = ref<boolean>(false);
const activeIndex = ref<number>(-1);
const listStyle = ref<Record<string, string>>({});

/**
 * 對齊原生 select 的 v-model 行為：編輯既有資料時值可能是字串 "3"，
 * 而選項值是數字 3，嚴格比較會選不中。
 */
const isSameValue = (a: GlassSelectValue, b: GlassSelectValue): boolean =>
  a === b || (a != null && b != null && String(a) === String(b));

const selectedOption = computed<GlassSelectOption<T> | undefined>(() =>
  props.options.find((option) => isSameValue(option.value, model.value))
);

const isSelected = (option: GlassSelectOption<T>): boolean =>
  !!selectedOption.value && isSameValue(option.value, model.value);

/** 清單改用 fixed 定位並 teleport 到 body，避免被 modal-box 的 overflow 裁切 */
const updatePosition = (): void => {
  const trigger = triggerEl.value;
  if (!trigger) return;

  const rect = trigger.getBoundingClientRect();
  const gap = 6;
  const maxHeight = 280;
  const spaceBelow = window.innerHeight - rect.bottom - gap;
  const spaceAbove = rect.top - gap;
  const openUpward = spaceBelow < Math.min(maxHeight, 160) && spaceAbove > spaceBelow;
  const available = Math.max(120, Math.min(maxHeight, openUpward ? spaceAbove : spaceBelow));

  listStyle.value = {
    position: "fixed",
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    maxHeight: `${available}px`,
    ...(openUpward
      ? { bottom: `${window.innerHeight - rect.top + gap}px` }
      : { top: `${rect.bottom + gap}px` }),
  };
};

const scrollActiveIntoView = (): void => {
  const el = optionEls.value[activeIndex.value];
  el?.scrollIntoView({ block: "nearest" });
};

const onDocumentPointerDown = (event: MouseEvent | TouchEvent): void => {
  const target = event.target as Node;
  if (rootEl.value?.contains(target) || listEl.value?.contains(target)) return;
  close();
};

const bindGlobalListeners = (): void => {
  document.addEventListener("mousedown", onDocumentPointerDown);
  document.addEventListener("touchstart", onDocumentPointerDown);
  // capture 才能接到 modal-box 等內層容器的捲動
  window.addEventListener("scroll", updatePosition, true);
  window.addEventListener("resize", updatePosition);
};

const unbindGlobalListeners = (): void => {
  document.removeEventListener("mousedown", onDocumentPointerDown);
  document.removeEventListener("touchstart", onDocumentPointerDown);
  window.removeEventListener("scroll", updatePosition, true);
  window.removeEventListener("resize", updatePosition);
};

const open = async (): Promise<void> => {
  if (props.disabled || isOpen.value) return;

  isOpen.value = true;
  activeIndex.value = props.options.findIndex((option) =>
    isSameValue(option.value, model.value)
  );
  updatePosition();
  bindGlobalListeners();

  await nextTick();
  updatePosition();
  scrollActiveIntoView();
};

const close = (): void => {
  if (!isOpen.value) return;
  isOpen.value = false;
  activeIndex.value = -1;
  unbindGlobalListeners();
};

const toggle = (): void => {
  isOpen.value ? close() : open();
};

const pick = (option: GlassSelectOption<T>): void => {
  if (option.disabled) return;
  model.value = option.value;
  close();
  triggerEl.value?.focus();
};

/** 略過 disabled 選項往指定方向找下一個可選項 */
const moveActive = (step: number): void => {
  const total = props.options.length;
  if (total === 0) return;

  let next = activeIndex.value;
  for (let i = 0; i < total; i++) {
    next = (next + step + total) % total;
    if (!props.options[next].disabled) {
      activeIndex.value = next;
      nextTick(scrollActiveIntoView);
      return;
    }
  }
};

const onKeydown = (event: KeyboardEvent): void => {
  switch (event.key) {
    case "Enter":
    case " ":
      event.preventDefault();
      if (!isOpen.value) {
        open();
      } else if (activeIndex.value >= 0) {
        pick(props.options[activeIndex.value]);
      }
      break;
    case "ArrowDown":
      event.preventDefault();
      isOpen.value ? moveActive(1) : open();
      break;
    case "ArrowUp":
      event.preventDefault();
      isOpen.value ? moveActive(-1) : open();
      break;
    case "Home":
      if (isOpen.value) {
        event.preventDefault();
        activeIndex.value = -1;
        moveActive(1);
      }
      break;
    case "End":
      if (isOpen.value) {
        event.preventDefault();
        activeIndex.value = 0;
        moveActive(-1);
      }
      break;
    case "Escape":
      if (isOpen.value) {
        event.preventDefault();
        close();
      }
      break;
    case "Tab":
      close();
      break;
  }
};

// 父層在開啟狀態下抽換選項（例如結束時間隨開始時間變動）時重新定位
watch(
  () => props.options,
  () => {
    if (isOpen.value) nextTick(updatePosition);
  }
);

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) close();
  }
);

onBeforeUnmount(unbindGlobalListeners);
</script>

<style scoped>
.glass-select {
  position: relative;
  width: 100%;
}

/* 高度、內距、圓角一律沿用 daisyUI 的 .input，才能跟隔壁的日期欄位對齊 */
.glass-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  color: var(--color-text);
  font-weight: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.glass-select-trigger:hover:not(:disabled) {
  border-color: var(--color-input-border) !important;
}

/* style.css 用 !important 設了 .input 的 border-color，狀態樣式得同級才蓋得過 */
.glass-select-trigger:focus-visible,
.glass-select-trigger-open {
  outline: none;
  border-color: var(--color-primary-brand) !important;
  box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.15);
}

[data-theme="dark"] .glass-select-trigger:focus-visible,
[data-theme="dark"] .glass-select-trigger-open {
  box-shadow: 0 0 0 2px rgba(255, 82, 82, 0.2);
}

.glass-select-trigger-error {
  border-color: var(--color-error) !important;
}

.glass-select-trigger:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.glass-select-value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.glass-select-value-empty {
  color: var(--color-text-secondary);
}

.glass-select-arrow {
  flex-shrink: 0;
  /* 用 em 才會跟著 .input / .input-sm 的字級縮放 */
  width: 1.2em;
  height: 1.2em;
  color: var(--color-text-secondary);
  transition: transform 0.2s ease;
}

.glass-select-arrow-open {
  transform: rotate(180deg);
}
</style>

<style>
/* 非 scoped：清單 teleport 到 body，拿不到 scoped 屬性 */
.glass-select-list {
  z-index: 9999;
  overflow-y: auto;
  padding: 0.3rem;
  border: 1px solid var(--glass-border);
  border-radius: 0.85rem;
  /* 玻璃感靠 blur，底色仍需夠不透明才讀得清楚 */
  background-color: color-mix(in srgb, var(--color-background) 88%, transparent);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--glass-shadow), var(--glass-highlight);
  overscroll-behavior: contain;
}

.glass-select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.7rem;
  border-radius: 0.55rem;
  color: var(--color-text);
  font-size: 0.9rem;
  line-height: 1.35;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}

.glass-select-option-label {
  flex: 1;
}

.glass-select-list-sm .glass-select-option {
  padding: 0.35rem 0.55rem;
  font-size: 0.8rem;
}

.glass-select-option-active {
  background: rgba(211, 47, 47, 0.1);
}

.glass-select-option-selected {
  color: var(--color-primary-brand);
  font-weight: 600;
}

.glass-select-option-selected.glass-select-option-active {
  background: rgba(211, 47, 47, 0.16);
}

[data-theme="dark"] .glass-select-option-active {
  background: rgba(255, 82, 82, 0.16);
}

[data-theme="dark"] .glass-select-option-selected {
  color: var(--color-primary-hover);
}

[data-theme="dark"] .glass-select-option-selected.glass-select-option-active {
  background: rgba(255, 82, 82, 0.24);
}

.glass-select-option-disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.glass-select-option-disabled.glass-select-option-active {
  background: transparent;
}

.glass-select-check {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
}

.glass-select-empty {
  padding: 0.75rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  text-align: center;
}
</style>
