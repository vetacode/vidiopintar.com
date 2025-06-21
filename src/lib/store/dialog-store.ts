import { create, type StateCreator } from 'zustand'

interface DeleteVideoDialogState {
  isOpen: boolean;
  id: number;
  openDialog: (id: number) => void;
  closeDialog: () => void;
}

export const useDeleteVideoDialogStore = create<DeleteVideoDialogState>()((set) => ({
  isOpen: false,
  id: 0,
  openDialog: (id: number) => set({ isOpen: true, id }), // set returns void
  closeDialog: () => set({ isOpen: false, id: 0 }), // set returns void
}))
