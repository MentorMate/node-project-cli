export const getRandomNumber: (min?: number, max?: number) => number = (
  min = 100,
  max = 1000
) => {
  return Math.floor(Math.random() * max + min);
};
