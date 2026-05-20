"use client";

import React from "react";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  ComposedChart,
} from "recharts";

const DEFAULT_MARGIN = { top: 20, right: 20, left: 60, bottom: 10 };

type BarLayout = "stacked" | "grouped";

type StackedComposedChartProps = {
  data: Array<Record<string, number | string>>;
  xAxisDataKey: string;
  yAxisLabel: string;
  tooltipContent: React.ReactElement;
  sizeBrackets: Array<{ key: string; color: string }>;
  activeSeries: Record<string, boolean>;
  barSize: number;
  opacityForKey: (key: string) => number;
  /** Recharts `LabelList` data key for the top-of-stack total (default `"total"`). */
  labelListDataKey?: string;
  /** Override chart margins (defaults match most request charts). */
  margin?: Partial<typeof DEFAULT_MARGIN>;
  /** Corner radius on the top segment only (last bar in `sizeBrackets`). */
  lastBarRadius?: [number, number, number, number];
  /** Custom formatter for top-of-stack labels (default: rounded + toLocaleString). */
  labelListFormatter?: (value: number) => string;
  /** Merged into default `LabelList` styles. */
  labelListStyle?: React.CSSProperties;
  /** `stacked` (default) or side-by-side grouped bars (no `stackId`). */
  barLayout?: BarLayout;
  barGap?: number;
  barCategoryGap?: number | string;
  /** Forwarded to `YAxis` `domain` (percent charts, auto max, etc.). */
  yAxisDomain?: [number, number | string] | [number, (max: number) => number];
  /** When set, replaces the default Y tick formatter. */
  yAxisTickFormatter?: (value: number) => string;
  /** Reserve horizontal space for Y-axis ticks and label. */
  yAxisWidth?: number;
  /** Horizontal offset for Y-axis label to avoid tick overlap. */
  yAxisLabelDx?: number;
  /** Do not render top `LabelList` (grouped charts or single-bar views). */
  hideLabelList?: boolean;
  /** Passed to `Tooltip` `cursor`. */
  tooltipCursor?: React.ComponentProps<typeof Tooltip>["cursor"];
  /** Applied to every bar when `barLayout="grouped"`. */
  groupedBarRadius?: [number, number, number, number];
};

export default function StackedComposedChart({
  data,
  xAxisDataKey,
  yAxisLabel,
  tooltipContent,
  sizeBrackets,
  activeSeries,
  barSize,
  opacityForKey,
  labelListDataKey = "total",
  margin: marginProp,
  lastBarRadius,
  labelListFormatter,
  labelListStyle,
  barLayout = "stacked",
  barGap,
  barCategoryGap,
  yAxisDomain,
  yAxisTickFormatter,
  yAxisWidth = 92,
  yAxisLabelDx = 5,
  hideLabelList = false,
  tooltipCursor,
  groupedBarRadius,
}: StackedComposedChartProps) {
  const margin = { ...DEFAULT_MARGIN, ...marginProp };
  const isStacked = barLayout === "stacked";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={margin}
        {...(barGap !== undefined ? { barGap } : {})}
        {...(barCategoryGap !== undefined ? { barCategoryGap } : {})}
      >
        <CartesianGrid vertical={false} strokeDasharray="6 6" />
        <XAxis dataKey={xAxisDataKey} tick={{ fontSize: 12 }} />
        <YAxis
          tick={{ fontSize: 12 }}
          width={yAxisWidth}
          {...(yAxisDomain !== undefined ? { domain: yAxisDomain } : {})}
          tickFormatter={
            yAxisTickFormatter ?? ((value: number) => value.toLocaleString())
          }
          label={{
            value: yAxisLabel,
            angle: -90,
            position: "insideLeft",
            dx: yAxisLabelDx,
            style: {
              textAnchor: "middle",
              fontFamily: "Heebo, sans-serif",
            },
          }}
        />
        <Tooltip
          isAnimationActive={false}
          cursor={tooltipCursor}
          content={(props) =>
            React.isValidElement(tooltipContent)
              ? React.cloneElement(tooltipContent, props)
              : null
          }
        />
        {(() => {
          const topVisibleKey = [...sizeBrackets]
            .reverse()
            .find((bracket) => activeSeries[bracket.key])?.key;

          return sizeBrackets.map((bracket) => {
            if (!activeSeries[bracket.key]) return null;

            const isTopVisible = bracket.key === topVisibleKey;

            return (
              <Bar
                key={bracket.key}
                dataKey={bracket.key}
                {...(isStacked ? { stackId: "a" } : {})}
                fill={bracket.color}
                barSize={barSize}
                opacity={opacityForKey(bracket.key)}
                {...(!isStacked && groupedBarRadius
                  ? { radius: groupedBarRadius }
                  : {})}
                {...(isStacked && isTopVisible && lastBarRadius
                  ? { radius: lastBarRadius }
                  : {})}
              >
                {isStacked && !hideLabelList && isTopVisible && (
                  <LabelList
                    dataKey={labelListDataKey}
                    position="top"
                    formatter={(value: number) => {
                      if (
                        value === undefined ||
                        value === null ||
                        isNaN(value)
                      )
                        return "";
                      if (labelListFormatter)
                        return labelListFormatter(value);
                      return Math.round(value).toLocaleString();
                    }}
                    style={{
                      fill: "#707585",
                      fontWeight: 400,
                      fontSize: 14,
                      fontFamily: "Heebo",
                      ...labelListStyle,
                    }}
                  />
                )}
              </Bar>
            );
          });
        })()}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
