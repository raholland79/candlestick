export type WeighInRecord = {
  date: string;
  morning: number;
  night: number;
};

export type CandlestickPoint = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type TrendSummary = {
  netChange: number;
  netChangePct: number;
  rollingChange: number;
  rollingChangePct: number;
  direction: "up" | "down" | "flat";
};

export type TransformResult = {
  candles: CandlestickPoint[];
  summary: TrendSummary;
  errors: string[];
  warnings: string[];
};
