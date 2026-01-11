export const getDifficultyColor = (difficulty: string) => {
  const colors = {
    Easy: 'bg-green-100 text-green-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Hard: 'bg-red-100 text-red-700',
  };
  return colors[difficulty as keyof typeof colors] || colors.Easy;
};
