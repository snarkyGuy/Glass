export const formatTripleDigis = (value: number) => {
  return value.toLocaleString("en-US", {
    minimumIntegerDigits: 3,
    useGrouping: false,
  });
};
