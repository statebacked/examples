export function exhaustive(item: never): never {
  throw new Error("non-exhaustive match: " + item);
}
