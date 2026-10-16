// pg hands numeric back as a string; keep money values numbers in JSON
export const decimalTransformer = {
  to: (value: number) => value,
  from: (value: string) => Number(value),
};
