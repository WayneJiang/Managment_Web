import { defineStore } from "pinia";

const STORAGE_KEY = "nav-state";

interface NavigationState {
  targetId: string;
  coach: boolean;
  register: boolean;
  coachId: number;
  note: string;
  showRecords: boolean;
  showPlans: boolean;
  editor: number;
}

const defaultState = (): NavigationState => ({
  targetId: "",
  coach: false,
  register: false,
  coachId: -1,
  note: "",
  showRecords: true,
  showPlans: true,
  editor: 0,
});

function saveToSession(state: NavigationState) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadFromSession(): Partial<NavigationState> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export const useNavigationStore = defineStore("navigation", {
  state: (): NavigationState => {
    const saved = loadFromSession();
    return { ...defaultState(), ...saved };
  },

  actions: {
    setTraineeNav(id: string | number, params?: {
      coach?: boolean;
      register?: boolean;
      coachId?: number;
      note?: string;
      showRecords?: boolean;
      showPlans?: boolean;
    }) {
      this.targetId = String(id);
      this.coach = params?.coach ?? false;
      this.register = params?.register ?? false;
      this.coachId = params?.coachId ?? -1;
      this.note = params?.note ?? "";
      this.showRecords = params?.showRecords ?? true;
      this.showPlans = params?.showPlans ?? true;
      saveToSession(this.$state);
    },

    setCoachNav(id: string | number) {
      this.targetId = String(id);
      saveToSession(this.$state);
    },

    setPlanNav(id: string | number, params?: { editor?: number; showRecords?: boolean; showPlans?: boolean }) {
      this.targetId = String(id);
      this.editor = params?.editor ?? 0;
      this.showRecords = params?.showRecords ?? true;
      this.showPlans = params?.showPlans ?? true;
      saveToSession(this.$state);
    },

    reset() {
      Object.assign(this, defaultState());
      sessionStorage.removeItem(STORAGE_KEY);
    },
  },
});
