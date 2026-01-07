import { useState, useCallback } from 'react';

export const useConfirmDialog = () => {
  const [state, setState] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });

  const open = useCallback((id: string) => {
    setState({ isOpen: true, id });
  }, []);

  const close = useCallback(() => {
    setState({ isOpen: false, id: null });
  }, []);

  const confirm = useCallback((callback: (id: string) => void) => {
    if (state.id) {
      callback(state.id);
    }
    close();
  }, [state.id, close]);

  return { ...state, open, close, confirm };
};

