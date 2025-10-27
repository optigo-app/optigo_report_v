import { parse, isValid } from "date-fns";

const normalizeDate = (input) => {
  if (!input) return null;

  // Already a Date
  if (input instanceof Date && isValid(input)) return input;

  // Timestamp number
  if (typeof input === "number") {
    const d = new Date(input);
    return isValid(d) ? d : null;
  }

  const knownFormats = [
    "yyyy-MM-dd",    // 2025-08-01
    "dd-MM-yyyy",    // 01-08-2025
    "d-MM-yyyy",     // 1-08-2025
    "MM/dd/yyyy",    // 08/01/2025
    "d/M/yyyy",      // 1/8/2025
    "dd/MM/yyyy",    // 01/08/2025
    "yyyy/MM/dd",    // 2025/08/01
    "d MMM yyyy",    // 15 Jul 2025
    "dd MMM yyyy",   // 01 Aug 2025
    "MMM d, yyyy",   // Jul 15, 2025
  ];

  for (const format of knownFormats) {
    const parsed = parse(input.trim(), format, new Date());
    if (isValid(parsed)) return parsed;
  }

  // Fallback: let native Date try
  const fallback = new Date(input);
  return isValid(fallback) ? fallback : null;
};

export default normalizeDate;
