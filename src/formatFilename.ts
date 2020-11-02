export const formatFilename = (s: string) => {
  const [first, ...rest] = s.split(".");
  return [first, "vcode-story", ...rest].join(".");
};
