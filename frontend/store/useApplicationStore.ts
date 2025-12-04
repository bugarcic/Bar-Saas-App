import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApplicationData } from '../types/schema';

// Helper type to allow partial updates to specific sections
// e.g., setField('header', 'bole_id', '123')
type SectionKey = keyof ApplicationData;

interface ApplicationState {
  data: ApplicationData;
  currentStep: number;
  userId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setField: (section: SectionKey, field: string, value: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setSection: (section: SectionKey, value: any) => void;
  setCurrentStep: (step: number) => void;
  setUserId: (id: string) => void;
  setData: (data: Partial<ApplicationData>) => void;
  reset: () => void;
}

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set) => ({
      data: {},
      currentStep: 0,
      userId: undefined,
      setField: (section, field, value) =>
        set((state) => {
          // We need to cast to any here because TypeScript can't know 
          // which specific section structure we are accessing dynamically
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sectionData: any = state.data[section] ?? {};
          
          // Handle array updates or object updates
          if (Array.isArray(sectionData)) {
             // This helper function might be too simple for array updates by field
             // Arrays usually need setSection. 
             // For now we assume setField is used for object properties.
             return { data: state.data }; 
          }

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
      setData: (newData) => set({ data: newData }),
      reset: () => set({ data: {}, currentStep: 0 }),
    }),
    {
      name: 'application-store',
      partialize: (state) => ({
        data: state.data,
        currentStep: state.currentStep,
      }),
    },
  ),
);
