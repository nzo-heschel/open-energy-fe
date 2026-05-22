export function parseContentDispositionFilename(
  contentDisposition: string | null,
): string | undefined {
  if (!contentDisposition) return undefined;
  const filenameMatch = contentDisposition.match(
    /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
  );
  if (filenameMatch?.[1]) {
    return filenameMatch[1].replace(/['"]/g, '');
  }
  return undefined;
}

export function ensureDateRangeInFilename(
  filename: string,
  dateRange: string,
): string {
  if (filename.includes(dateRange)) return filename;
  return filename.replace(/(\.[^.]+)?$/, `-${dateRange}$1`);
}

export function resolveExportFilename(
  defaultFilename: string,
  contentDisposition: string | null,
  dateRange?: string,
): string {
  let filename =
    parseContentDispositionFilename(contentDisposition) ?? defaultFilename;
  if (dateRange) {
    filename = ensureDateRangeInFilename(filename, dateRange);
  }
  return filename;
}

export function downloadBlob(blob: Blob, filename: string) {
  const urlObject = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = urlObject;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(urlObject);
}

export function buildExportDateRangeSuffix(options: {
  startDate?: string;
  endDate?: string;
  year?: string | number;
  years?: Array<string | number>;
  fallbackStartYear?: number;
  fallbackEndYear?: number;
}): string | undefined {
  if (options.startDate && options.endDate) {
    return `${options.startDate}-${options.endDate}`;
  }
  if (options.year !== undefined && options.year !== 'all') {
    return String(options.year);
  }
  if (options.years && options.years.length > 0) {
    const sorted = [...options.years]
      .map(String)
      .sort((a, b) => Number(a) - Number(b));
    return sorted.length === 1
      ? sorted[0]
      : `${sorted[0]}-${sorted[sorted.length - 1]}`;
  }
  if (options.fallbackStartYear != null && options.fallbackEndYear != null) {
    return `${options.fallbackStartYear}-${options.fallbackEndYear}`;
  }
  return undefined;
}
