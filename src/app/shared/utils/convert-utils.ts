export function prettyPrintFileSize(size: string):string {
    if (!isNaN(Number(size))) {
      if (size.length < 4) {
        return size + ' B';
      }
      else if (4 <= size.length && size.length < 8) {
        return (Number(size) / 1024 ).toFixed(1) + ' KiB';
      }
      else if (8 <= size.length && size.length < 12) {
        return (Number(size) / (1024**2)).toFixed(1) + ' MiB';
      }
      else if (12 <= size.length && size.length < 16) {
        return (Number(size) / (1024**3)).toFixed(1) + ' GiB';
      }
    }

    return "";
}
