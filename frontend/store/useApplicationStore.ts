import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import type { AncillaryMaps, QuestionnaireMap, SchemaValue } from '../types/schema';

type SectionKey = keyof QuestionnaireMap | keyof AncillaryMaps | string;
type SectionData = Record<string, SchemaValue>;

interface ApplicationState {
  data: Partial<Record<SectionKey, SectionData>>;
  currentStep: number;
  setField: (section: SectionKey, field: string, value: SchemaValue) => void;
  setSection: (section: SectionKey, value: SectionData) => void;
  setCurrentStep: (step: number) => void;
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


