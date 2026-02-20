import * as React from "react";
import * as Recharts from "recharts";

import { cn } from "@/utils/cn";

/**
 * Themes
 */
const THEMES = {
  light: "",
  dark: ".dark",
};

/**
 * Context
 */
const ChartContext = React.createContext(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

/**
 * Chart Container
 */
function ChartContainer({ id, className, config, children, ...props }) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-layer]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <Recharts.ResponsiveContainer>{children}</Recharts.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

/**
 * Chart Style (CSS variables)
 */
function ChartStyle({ id, config }) {
  const entries = Object.entries(config || {}).filter(
    ([, v]) => v?.color || v?.theme,
  );

  if (!entries.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(([theme, prefix]) => {
            const vars = entries
              .map(([key, cfg]) => {
                const color = cfg.theme?.[theme] || cfg.color;
                return color ? `--color-${key}: ${color};` : null;
              })
              .filter(Boolean)
              .join("\n");

            return `
${prefix} [data-chart="${id}"] {
${vars}
}
`;
          })
          .join("\n"),
      }}
    />
  );
}

/**
 * Tooltip
 */
const ChartTooltip = Recharts.Tooltip;

function ChartTooltipContent({
  active,
  payload,
  className,
  hideLabel = false,
}) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "border-border/50 bg-background rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
    >
      {payload.map((item) => {
        const key = item.dataKey || item.name;
        const cfg = config?.[key] || {};
        const color = item.color || cfg.color;

        return (
          <div key={key} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: color }}
              />
              {!hideLabel && (
                <span className="text-muted-foreground">
                  {cfg.label || item.name}
                </span>
              )}
            </div>
            <span className="font-mono font-medium">
              {item.value?.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Legend
 */
const ChartLegend = Recharts.Legend;

function ChartLegendContent({ payload, className }) {
  const { config } = useChart();

  if (!payload?.length) return null;

  return (
    <div className={cn("flex justify-center gap-4", className)}>
      {payload.map((item) => {
        const key = item.dataKey;
        const cfg = config?.[key] || {};

        return (
          <div key={key} className="flex items-center gap-1.5 text-xs">
            <span
              className="h-2 w-2 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            {cfg.label || item.value}
          </div>
        );
      })}
    </div>
  );
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
