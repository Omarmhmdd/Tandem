import { useHousehold } from '../contexts/HouseholdContext';


export const useHasHousehold = (): boolean => {
  const { household } = useHousehold();
  return !!household;
};