export function toTranslatableCamelCase(s: string): string {
  return s.toLowerCase().replace(/([_/][a-z])/ig, (subString: string) => {
    return subString.toUpperCase().replace('_', '');
  });
}
