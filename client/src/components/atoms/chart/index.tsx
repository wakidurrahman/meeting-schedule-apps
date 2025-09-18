import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import React from 'react';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';

import { BaseComponentProps } from '@/types/components-common';
import { buildClassNames } from '@/utils/component';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
);

// Chart color constants based on our design system
export const CHART_COLORS = {
  primary: '#5347ce',
  secondary: '#887cfd',
  accent1: '#4896fe',
  accent2: '#16c8c7',
  success: '#8bc34a',
  warning: '#ffc107',
  danger: '#dc3545',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#535353',
};

export const CHART_GRADIENTS = {
  purple: ['#5347ce', '#887cfd'],
  blue: ['#4896fe', '#16c8c7'],
  success: ['#8bc34a', '#9be0ff'],
  warning: ['#ffc107', '#ffcd27'],
  danger: ['#dc3545', '#ff4072'],
};

// Common chart options
const getDefaultOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
    },
    x: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
    },
  },
});

// Chart component interfaces
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }>;
}

export interface ChartProps extends BaseComponentProps {
  data: ChartData;
  options?: object;
  height?: number;
  width?: number;
}

// Line Chart Component
export const LineChart: React.FC<ChartProps> = ({
  data,
  options = {},
  height = 300,
  className,
}) => {
  const classes = buildClassNames('chart-container', className);
  const mergedOptions = { ...getDefaultOptions(), ...options };

  return (
    <div className={classes} style={{ height }}>
      <Line data={data} options={mergedOptions} />
    </div>
  );
};

// Bar Chart Component
export const BarChart: React.FC<ChartProps> = ({ data, options = {}, height = 300, className }) => {
  const classes = buildClassNames('chart-container', className);
  const mergedOptions = { ...getDefaultOptions(), ...options };

  return (
    <div className={classes} style={{ height }}>
      <Bar data={data} options={mergedOptions} />
    </div>
  );
};

// Pie Chart Component
export const PieChart: React.FC<ChartProps> = ({ data, options = {}, height = 300, className }) => {
  const classes = buildClassNames('chart-container', className);
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
    ...options,
  };

  return (
    <div className={classes} style={{ height }}>
      <Pie data={data} options={pieOptions} />
    </div>
  );
};

// Doughnut Chart Component
export const DoughnutChart: React.FC<ChartProps> = ({
  data,
  options = {},
  height = 300,
  className,
}) => {
  const classes = buildClassNames('chart-container', className);
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
    ...options,
  };

  return (
    <div className={classes} style={{ height }}>
      <Doughnut data={data} options={doughnutOptions} />
    </div>
  );
};

// Utility function to create gradient colors for charts
export const createGradientData = (
  canvas: HTMLCanvasElement,
  colorStart: string,
  colorEnd: string,
): CanvasGradient => {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to get canvas context');

  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);
  return gradient;
};

// Helper function to generate chart data with our color scheme
export const generateChartData = (
  labels: string[],
  datasets: Array<{
    label: string;
    data: number[];
    colorScheme?: keyof typeof CHART_GRADIENTS;
  }>,
): ChartData => {
  return {
    labels,
    datasets: datasets.map((dataset, index) => {
      const colors = Object.values(CHART_COLORS);
      const defaultColor = colors[index % colors.length];
      const gradientColors = dataset.colorScheme
        ? CHART_GRADIENTS[dataset.colorScheme]
        : [defaultColor, defaultColor];

      return {
        ...dataset,
        backgroundColor: gradientColors[0] + '80', // 50% opacity
        borderColor: gradientColors[0],
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      };
    }),
  };
};

// Main Chart component with compound pattern
interface ChartComponent extends React.FC<ChartProps> {
  Line: typeof LineChart;
  Bar: typeof BarChart;
  Pie: typeof PieChart;
  Doughnut: typeof DoughnutChart;
}

const Chart = LineChart as ChartComponent;
Chart.Line = LineChart;
Chart.Bar = BarChart;
Chart.Pie = PieChart;
Chart.Doughnut = DoughnutChart;

export default Chart;
