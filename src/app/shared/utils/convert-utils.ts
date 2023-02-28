export function prettyPrintFileSize(size: number):string {
  if (isNaN(size)) return "";
  if (size < 2 ** 10) return `${size} B`
  if (size < 2 ** 20) return (size / 2 ** 10).toFixed(1) + " KiB"
  if (size < 2 ** 30) return (size / 2 ** 20).toFixed(1) + " MiB"
  if (size < 2 ** 40) return (size / 2 ** 30).toFixed(1) + " GiB"
  return (size / 2 ** 40).toFixed(1) + " TiB"
}
