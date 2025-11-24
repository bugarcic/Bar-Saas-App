import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import type { AncillaryMaps, QuestionnaireMap, SchemaValue } from '../types/schema';

type SectionKey = keyof QuestionnaireMap | keyof AncillaryMaps | string;
type SectionData = Record<string, SchemaValue>;

interface ApplicationState {
  data: Partial<Record<SectionKey, SectionData>>;
  currentStep: number;
  userId?: string;
  setField: (section: SectionKey, field: string, value: SchemaValue) => void;
  setSection: (section: SectionKey, value: SectionData) => void;
  setCurrentStep: (step: number) => void;
  setUserId: (id: string) => void;
  reset: () => void;
}

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const storage = createJSONStorage<ApplicationState>(() =>
  typeof window !== 'undefined' ? window.localStorage : noopStorage,
);

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set) => ({
      data: {},
      currentStep: 0,
      userId: undefined,
      setField: (section, field, value) =>
        set((state) => {
          const sectionData = state.data[section] ?? {};
          return {
            data: {
              ...state.data,
              [section]: {
                ...sectionData,
                [field]: value,
              },
            },
          };
        }),
      setSection: (section, value) =>
        set((state) => ({
          data: {
            ...state.data,
            [section]: value,
          },
        })),
      setCurrentStep: (step) => set({ currentStep: step }),
      setUserId: (id) => set({ userId: id }),
      reset: () => set({ data: {}, currentStep: 0 }),
    }),
    {
      name: 'application-store',
      storage,
      partialize: (state) => ({
        data: state.data,
        currentStep: state.currentStep,
      }),
    },
  ),
);


