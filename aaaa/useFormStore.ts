import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

interface FormData {
  id?: string;
  submittedAt?: string;
  date?: string;
  fundStatus?:"postfund" | "prefund";
  formType?: "LAND" | "POND" | "PLANTATION";
  formStatus?: "Approved" | "Pending" | "Rejected" |"Review";
  basicDetails?: any;
  landOwnership?: any;
  landDevelopment?: any;
  bankDetails?: any;
}

interface FormStore {
  data: FormData;
  submittedForms: FormData[];
  draftForms: FormData[];
  loading: boolean;

  setData: (section: keyof FormData, value: any) => void;
  resetData: () => void;
  submitForm: () => Promise<void>;
  saveDraft: () => Promise<void>;
  loadDrafts: () => Promise<void>;
  loadSubmittedForms: () => Promise<void>;
  clearSubmittedForms: () => Promise<void>;
  deleteFormByIndex: (index: number) => Promise<void>;
}

export const useFormStore = create<FormStore>((set, get) => ({
  data: {},
  submittedForms: [],
  draftForms: [],
  loading: false,

  setData: (section, value) =>
    set((state) => ({
      data: {
        ...state.data,
        [section]: value,
      },
    })),

  resetData: () => set({ data: {} }),

  submitForm: async () => {
    const currentData = get().data;
    const allForms = get().submittedForms;

    let updatedForms;

    if (currentData.id) {
      updatedForms = allForms.map((form) =>
        form.id === currentData.id ? { ...form, ...currentData } : form
      );
    } else {
      const formWithMeta: FormData = {
        ...currentData,
        id: Date.now().toString(),
        submittedAt: new Date().toISOString(),
        formStatus: currentData.formStatus ,
        fundStatus:currentData.fundStatus || "prefund",
      };
      updatedForms = [...allForms, formWithMeta];
    }

    await AsyncStorage.setItem("submittedForms", JSON.stringify(updatedForms));
    set({ submittedForms: updatedForms, data: {} });
  },

  saveDraft: async () => {
    const currentData = get().data;
    const allDrafts = get().draftForms ?? [];

    if (!currentData || Object.keys(currentData).length === 0) {
      console.warn("No data to save as draft.");
      return;
    }

    let updatedDrafts;

    if (currentData.id) {
      updatedDrafts = allDrafts.map((form) =>
        form.id === currentData.id ? { ...form, ...currentData } : form
      );
    } else {
      const draftWithMeta = {
        ...currentData,
        id: Date.now().toString(),
        savedAt: new Date().toISOString(),
        formStatus: "Draft",
      };
      updatedDrafts = [...allDrafts, draftWithMeta];
    }

    await AsyncStorage.setItem("draftForms", JSON.stringify(updatedDrafts));
    set({ draftForms: updatedDrafts, data: {} });
  },

  loadDrafts: async () => {
    try {
      const stored = await AsyncStorage.getItem("draftForms");
      if (stored) {
        set({ draftForms: JSON.parse(stored) });
      }
    } catch (error) {
      console.error("Failed to load draft forms", error);
    }
  },

  loadSubmittedForms: async () => {
    set({ loading: true });
    try {
      const stored = await AsyncStorage.getItem("submittedForms");
      if (stored) {
        set({ submittedForms: JSON.parse(stored) });
      }
    } catch (error) {
      console.error("Failed to load submitted forms", error);
    } finally {
      set({ loading: false });
    }
  },

  clearSubmittedForms: async () => {
    await AsyncStorage.removeItem("submittedForms");
    set({ submittedForms: [] });
  },

  deleteFormByIndex: async (index: number) => {
    const currentForms = get().submittedForms;
    const updatedForms = currentForms.filter((_, i) => i !== index);
    await AsyncStorage.setItem("submittedForms", JSON.stringify(updatedForms));
    set({ submittedForms: updatedForms });
  },
}));
