import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface HealthRecord {
  id: string;
  userId: string;
  height: number | null;
  weight: number | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  medicalHistory: string | null;
  recordDate: string;
  notes: string | null;
  createTime: string;
  updateTime: string;
}

interface HealthTrendsChartProps {
  records: HealthRecord[];
  metric: 'weight' | 'bloodPressure' | 'bmi';
}

export default function HealthTrendsChart({ records, metric }: HealthTrendsChartProps) {
  // Sort records by date
  const sortedRecords = [...records].sort((a, b) => 
    new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime()
  );

  const calculateBMI = (height: number, weight: number) => {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  // Get data points based on metric
  const getDataPoints = () => {
    return sortedRecords.map(record => {
      let value = null;
      if (metric === 'weight' && record.weight) {
        value = record.weight;
      } else if (metric === 'bloodPressure' && record.bloodPressureSystolic) {
        value = record.bloodPressureSystolic;
      } else if (metric === 'bmi' && record.height && record.weight) {
        value = calculateBMI(record.height, record.weight);
      }
      return {
        date: new Date(record.recordDate),
        value,
        record
      };
    }).filter(point => point.value !== null);
  };

  const dataPoints = getDataPoints();

  if (dataPoints.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-12 text-center">
        <p className="text-gray-600">No data available for this metric</p>
      </div>
    );
  }

  // Calculate chart dimensions
  const values = dataPoints.map(p => p.value!);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;
  const padding = valueRange * 0.1;

  const chartMin = minValue - padding;
  const chartMax = maxValue + padding;
  const chartRange = chartMax - chartMin;

  // SVG dimensions
  const width = 800;
  const height = 300;
  const chartWidth = width - 100;
  const chartHeight = height - 60;
  const leftMargin = 60;
  const topMargin = 20;

  // Calculate points for line
  const points = dataPoints.map((point, index) => {
    const x = leftMargin + (index / (dataPoints.length - 1 || 1)) * chartWidth;
    const y = topMargin + chartHeight - ((point.value! - chartMin) / chartRange) * chartHeight;
    return { x, y, ...point };
  });

  // Create path for line
  const linePath = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  // Create path for area
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${topMargin + chartHeight} L ${points[0].x} ${topMargin + chartHeight} Z`;

  // Calculate trend
  const getTrend = () => {
    if (dataPoints.length < 2) return { icon: Minus, color: 'text-gray-500', label: 'No trend', change: 0 };
    const first = dataPoints[0].value!;
    const last = dataPoints[dataPoints.length - 1].value!;
    const change = ((last - first) / first) * 100;
    
    if (Math.abs(change) < 2) return { icon: Minus, color: 'text-gray-500', label: 'Stable', change: 0 };
    if (change > 0) return { icon: TrendingUp, color: 'text-red-500', label: 'Increasing', change };
    return { icon: TrendingDown, color: 'text-green-500', label: 'Decreasing', change };
  };

  const trend = getTrend();
  const TrendIcon = trend.icon;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getMetricLabel = () => {
    if (metric === 'weight') return 'Weight (kg)';
    if (metric === 'bloodPressure') return 'Blood Pressure (Systolic)';
    if (metric === 'bmi') return 'BMI';
    return '';
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{getMetricLabel()} Trend</h3>
          <p className="text-sm text-gray-600">{dataPoints.length} data points</p>
        </div>
        <div className="flex items-center gap-2">
          <TrendIcon className={`w-5 h-5 ${trend.color}`} />
          <span className={`font-semibold ${trend.color}`}>{trend.label}</span>
          {trend.change !== 0 && (
            <span className="text-sm text-gray-600">
              ({trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%)
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="mx-auto">
          {/* Y-axis grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = topMargin + chartHeight * (1 - ratio);
            const value = chartMin + chartRange * ratio;
            return (
              <g key={ratio}>
                <line
                  x1={leftMargin}
                  y1={y}
                  x2={leftMargin + chartWidth}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x={leftMargin - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-600"
                >
                  {value.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Area under curve */}
          <path
            d={areaPath}
            fill="url(#gradient)"
            opacity="0.3"
          />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="white"
                stroke="#3b82f6"
                strokeWidth="3"
              />
              <text
                x={point.x}
                y={topMargin + chartHeight + 20}
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {formatDate(point.date)}
              </text>
              <text
                x={point.x}
                y={point.y - 10}
                textAnchor="middle"
                className="text-xs fill-gray-800 font-semibold"
              >
                {point.value!.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}