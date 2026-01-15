import React from "react";
import ReactECharts from "echarts-for-react";
import { CandlestickPoint, TrendSummary } from "../types";

type WeighInCandlestickProps = {
  candles: CandlestickPoint[];
  summary: TrendSummary;
};

const formatDelta = (value: number): string => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}`;
};

const formatPct = (value: number): string => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

const trendLabel = (direction: TrendSummary["direction"]): string => {
  if (direction === "up") return "Upward";
  if (direction === "down") return "Downward";
  return "Flat";
};

const WeighInCandlestick: React.FC<WeighInCandlestickProps> = ({ candles, summary }) => {
  const dates = candles.map((item) => item.time);
  const candleSeries = candles.map((item) => [item.open, item.close, item.low, item.high]);
  const closeSeries = candles.map((item) => item.close);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
    },
    legend: {
      data: ["Weigh-ins", "Night Close"],
    },
    grid: {
      left: "10%",
      right: "8%",
      top: 60,
      bottom: 70,
    },
    xAxis: {
      type: "category",
      data: dates,
      boundaryGap: true,
      axisLine: { lineStyle: { color: "#555" } },
    },
    yAxis: {
      scale: true,
      axisLine: { lineStyle: { color: "#555" } },
      splitLine: { lineStyle: { color: "#ddd" } },
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    series: [
      {
        name: "Weigh-ins",
        type: "candlestick",
        data: candleSeries,
        itemStyle: {
          color: "#6fbf73",
          color0: "#f28b82",
          borderColor: "#5a8f5c",
          borderColor0: "#c0392b",
        },
      },
      {
        name: "Night Close",
        type: "line",
        data: closeSeries,
        smooth: true,
        lineStyle: { width: 2, color: "#4c6fff" },
        symbol: "circle",
        symbolSize: 6,
      },
    ],
  };

  return (
    <section>
      <div className="summary">
        <div>
          <span className="label">Trend</span>
          <span>{trendLabel(summary.direction)}</span>
        </div>
        <div>
          <span className="label">Net Change</span>
          <span>
            {formatDelta(summary.netChange)} ({formatPct(summary.netChangePct)})
          </span>
        </div>
        <div>
          <span className="label">7-Day Change</span>
          <span>
            {formatDelta(summary.rollingChange)} ({formatPct(summary.rollingChangePct)})
          </span>
        </div>
        <div>
          <span className="label">Entries</span>
          <span>{candles.length}</span>
        </div>
      </div>
      <div className="chart">
        <ReactECharts option={option} style={{ height: 420 }} />
      </div>
    </section>
  );
};

export default WeighInCandlestick;
