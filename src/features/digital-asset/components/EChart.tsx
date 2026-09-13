import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, HeatmapChart, LineChart, SankeyChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent, VisualMapComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import type { ComposeOption } from 'echarts/core';
import type { BarSeriesOption, HeatmapSeriesOption, LineSeriesOption, SankeySeriesOption } from 'echarts/charts';
import type { GridComponentOption, LegendComponentOption, TooltipComponentOption, VisualMapComponentOption } from 'echarts/components';

echarts.use([
  BarChart, HeatmapChart, LineChart, SankeyChart,
  GridComponent, LegendComponent, TooltipComponent, VisualMapComponent, SVGRenderer,
]);

export type DashboardChartOption = ComposeOption<
  BarSeriesOption | HeatmapSeriesOption | LineSeriesOption | SankeySeriesOption |
  GridComponentOption | LegendComponentOption | TooltipComponentOption | VisualMapComponentOption
>;

type Props = {
  option: DashboardChartOption;
  ariaLabel: string;
  height?: number;
};

export function EChart({ option, ariaLabel, height = 260 }: Props) {
  const target = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!target.current) return;
    const chart = echarts.init(target.current, undefined, { renderer: 'svg' });
    chart.setOption(option);
    const resize = () => chart.resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      chart.dispose();
    };
  }, [option]);

  return <div ref={target} className="da-chart" style={{ height }} role="img" aria-label={ariaLabel} />;
}
