const isSwapError = (error: string) => {
  const isSwapIssue = error.includes("1inch");

  if (isSwapIssue) {
    switch (true) {
      case error.includes("Not enough"):
        return "Not enough funds";
      default:
        return error;
    }
  }
};

export const defineIssue = (error: string) => {
  const swapError = isSwapError(error);
  if (swapError) {
    return swapError;
  }
  return error;
};
