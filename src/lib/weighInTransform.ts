import { CandlestickPoint, TransformResult, TrendSummary, WeighInRecord } from "../types";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const emptySummary: TrendSummary = {
  netChange: 0,
  netChangePct: 0,
  rollingChange: 0,
  rollingChangePct: 0,
  direction: "flat",
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const isValidDateString = (value: string): boolean => {
  if (!DATE_REGEX.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00`);
  return !Number.isNaN(parsed.getTime());
};

const toCandles = (records: WeighInRecord[]): CandlestickPoint[] =>
  records.map((record) => {
    const high = Math.max(record.morning, record.night);
    const low = Math.min(record.morning, record.night);
    return {
      time: record.date,
      open: record.morning,
      close: record.night,
      high,
      low,
    };
  });

const summarize = (candles: CandlestickPoint[]): TrendSummary => {
  if (candles.length === 0) {
    return emptySummary;
  }

  const first = candles[0];
  const last = candles[candles.length - 1];
  const netChange = last.close - first.open;
  const netChangePct = first.open !== 0 ? (netChange / first.open) * 100 : 0;
  const windowSize = Math.min(7, candles.length);
  const baseline = candles[candles.length - windowSize].close;
  const rollingChange = last.close - baseline;
  const rollingChangePct = baseline !== 0 ? (rollingChange / baseline) * 100 : 0;

  let direction: TrendSummary["direction"] = "flat";
  if (Math.abs(netChange) >= 0.05) {
    direction = netChange > 0 ? "up" : "down";
  }

  return {
    netChange,
    netChangePct,
    rollingChange,
    rollingChangePct,
    direction,
  };
};

const collectGapWarnings = (records: WeighInRecord[]): string[] => {
  const warnings: string[] = [];
  for (let index = 1; index < records.length; index += 1) {
    const prev = new Date(`${records[index - 1].date}T00:00:00`);
    const current = new Date(`${records[index].date}T00:00:00`);
    const diffDays = (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (records[index - 1].date === records[index].date) {
      warnings.push(`Duplicate date detected: ${records[index].date}.`);
      continue;
    }
    if (diffDays > 1.5) {
      warnings.push(`Gap detected between ${records[index - 1].date} and ${records[index].date}.`);
    }
  }
  return warnings;
};

export const transformWeighIns = (input: string): TransformResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let parsed: unknown;

  try {
    parsed = JSON.parse(input);
  } catch (error) {
    return {
      candles: [],
      summary: emptySummary,
      errors: ["Invalid JSON. Check commas, quotes, and brackets."],
      warnings,
    };
  }

  if (!Array.isArray(parsed)) {
    return {
      candles: [],
      summary: emptySummary,
      errors: ["JSON must be an array of weigh-in records."],
      warnings,
    };
  }

  const records: WeighInRecord[] = [];
  parsed.forEach((entry, index) => {
    if (typeof entry !== "object" || entry === null) {
      errors.push(`Row ${index + 1} must be an object.`);
      return;
    }
    const record = entry as Record<string, unknown>;
    const date = typeof record.date === "string" ? record.date : "";
    if (!isValidDateString(date)) {
      errors.push(`Row ${index + 1} has an invalid date. Use YYYY-MM-DD.`);
    }
    const morning = toNumber(record.morning);
    const night = toNumber(record.night);
    if (morning === null) {
      errors.push(`Row ${index + 1} is missing a valid morning weight.`);
    }
    if (night === null) {
      errors.push(`Row ${index + 1} is missing a valid night weight.`);
    }
    if (date && morning !== null && night !== null) {
      records.push({ date, morning, night });
    }
  });

  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  warnings.push(...collectGapWarnings(sorted));
  const candles = toCandles(sorted);

  return {
    candles,
    summary: summarize(candles),
    errors,
    warnings,
  };
};
