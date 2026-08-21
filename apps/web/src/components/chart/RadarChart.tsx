import * as echarts from "echarts";
import { useEffect, useRef } from "react";

/** 掌握度雷达图（ECharts 封装） */
export function RadarChart({
  indicators,
  values,
  name,
  className,
}: {
  /** [{ name: "数学", max: 100 }] */
  indicators: { name: string; max: number }[];
  /** 与 indicators 等长的掌握度数值（0-100） */
  values: number[];
  name: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);

    chart.setOption({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(10,15,31,0.9)",
        borderColor: "rgba(255,255,255,0.1)",
        textStyle: { color: "#e2e8f0", fontSize: 12 },
      },
      radar: {
        indicator: indicators,
        radius: "68%",
        center: ["50%", "52%"],
        axisName: { color: "#94a3b8", fontSize: 12, fontWeight: 600 },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.12)" } },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
        splitArea: { areaStyle: { color: ["rgba(255,255,255,0.02)", "rgba(255,255,255,0.05)"] } },
      },
      series: [
        {
          type: "radar",
          data: [
            {
              value: values,
              name,
              areaStyle: { color: "rgba(167,139,250,0.35)" },
              lineStyle: { color: "#a78bfa", width: 2 },
              itemStyle: { color: "#a78bfa" },
              symbol: "circle",
              symbolSize: 5,
            },
          ],
        },
      ],
    });

    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      chart.dispose();
    };
  }, [indicators, values, name]);

  return <div ref={ref} className={className} />;
}
