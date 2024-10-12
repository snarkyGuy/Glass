export const formatTripleDigis = (value: number) => {
    return value.toLocaleString("en-US", {
      minimumIntegerDigits: 1,
      useGrouping: false,
    });
  };