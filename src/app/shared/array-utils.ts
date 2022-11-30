export function removeElementFromArray<T>(array: T[], matcher: (item: T) => boolean): void {
  const index = array.findIndex(matcher);
  if (index === -1) {
    return;
  }
  array.splice(index, 1);
}
