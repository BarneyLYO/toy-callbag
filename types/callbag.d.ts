export type Callbag<T> = (
  code: 0 | 1 | 2,
  sink?: any,
) => void
