
export const isValidDateNightBudget = (budget: number): boolean => {
  return budget >= 10 && budget <= 500;
};


export const getMinDateNightBudget = (): number => 10;


export const getMaxDateNightBudget = (): number => 500;


export const formatDateNightCost = (cost: number): string => {
  return cost.toFixed(2);
};

