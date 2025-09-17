import {
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import React, { useMemo, useState } from 'react';

import Button from '@/components/atoms/button';
import { BarChart, LineChart, generateChartData } from '@/components/atoms/chart';
import Card from '@/components/molecules/card';
import { BaseComponentProps } from '@/types/components-common';
import type { Meeting } from '@/types/meeting';
import { buildClassNames } from '@/utils/component';

export type CalendarChartView = 'year' | 'month' | 'week' | 'day';

export interface CalendarChartProps extends BaseComponentProps {
  meetings: Meeting[];
  view?: CalendarChartView;
  onViewChange?: (view: CalendarChartView) => void;
  currentDate?: Date;
  height?: number;
  showControls?: boolean;
}

/**
 * Calendar Chart Component
 *
 * Displays meeting data in different time-based views (Year/Month/Week/Day)
 * with interactive controls and visual representations.
 */
const CalendarChart: React.FC<CalendarChartProps> = ({
  meetings,
  view = 'month',
  onViewChange,
  currentDate = new Date(),
  height = 400,
  showControls = true,
  className,
}) => {
  const [currentView, setCurrentView] = useState<CalendarChartView>(view);
  const classes = buildClassNames('calendar-chart', className);

  // Handle view change
  const handleViewChange = (newView: CalendarChartView) => {
    setCurrentView(newView);
    if (onViewChange) {
      onViewChange(newView);
    }
  };

  // Process meetings data based on current view
  const chartData = useMemo(() => {
    const processedMeetings = meetings.map((meeting) => ({
      ...meeting,
      startTime: new Date(meeting.startTime),
      endTime: new Date(meeting.endTime),
    }));

    switch (currentView) {
      case 'year': {
        const yearStart = startOfYear(currentDate);
        const yearEnd = endOfYear(currentDate);
        const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

        const monthlyData = months.map((month) => {
          const monthMeetings = processedMeetings.filter(
            (meeting) =>
              meeting.startTime.getMonth() === month.getMonth() &&
              meeting.startTime.getFullYear() === month.getFullYear(),
          );
          return {
            label: format(month, 'MMM'),
            count: monthMeetings.length,
          };
        });

        return generateChartData(
          monthlyData.map((d) => d.label),
          [
            {
              label: 'Meetings',
              data: monthlyData.map((d) => d.count),
              colorScheme: 'purple' as const,
            },
          ],
        );
      }

      case 'month': {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd });

        const weeklyData = weeks.map((week, index) => {
          const weekEnd = endOfWeek(week);
          const weekMeetings = processedMeetings.filter(
            (meeting) => meeting.startTime >= week && meeting.startTime <= weekEnd,
          );
          return {
            label: `Week ${index + 1}`,
            count: weekMeetings.length,
          };
        });

        return generateChartData(
          weeklyData.map((d) => d.label),
          [
            {
              label: 'Meetings',
              data: weeklyData.map((d) => d.count),
              colorScheme: 'blue' as const,
            },
          ],
        );
      }

      case 'week': {
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

        const dailyData = days.map((day) => {
          const dayMeetings = processedMeetings.filter(
            (meeting) => meeting.startTime.toDateString() === day.toDateString(),
          );
          return {
            label: format(day, 'EEE'),
            count: dayMeetings.length,
          };
        });

        return generateChartData(
          dailyData.map((d) => d.label),
          [
            {
              label: 'Meetings',
              data: dailyData.map((d) => d.count),
              colorScheme: 'success' as const,
            },
          ],
        );
      }

      case 'day': {
        // For day view, show hourly distribution
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const currentDateString = currentDate.toDateString();

        const hourlyData = hours.map((hour) => {
          const hourMeetings = processedMeetings.filter(
            (meeting) =>
              meeting.startTime.toDateString() === currentDateString &&
              meeting.startTime.getHours() === hour,
          );
          return {
            label: `${hour.toString().padStart(2, '0')}:00`,
            count: hourMeetings.length,
          };
        });

        // Only show hours that have data or are within business hours (8-18)
        const filteredHourlyData = hourlyData.filter(
          (data, index) => data.count > 0 || (index >= 8 && index <= 18),
        );

        return generateChartData(
          filteredHourlyData.map((d) => d.label),
          [
            {
              label: 'Meetings',
              data: filteredHourlyData.map((d) => d.count),
              colorScheme: 'warning' as const,
            },
          ],
        );
      }

      default:
        return generateChartData([], []);
    }
  }, [meetings, currentView, currentDate]);

  // Chart title based on view
  const getChartTitle = () => {
    switch (currentView) {
      case 'year':
        return `Meetings in ${format(currentDate, 'yyyy')}`;
      case 'month':
        return `Meetings in ${format(currentDate, 'MMMM yyyy')}`;
      case 'week':
        return `Meetings in week of ${format(startOfWeek(currentDate), 'MMM dd, yyyy')}`;
      case 'day':
        return `Meetings on ${format(currentDate, 'EEEE, MMMM dd, yyyy')}`;
      default:
        return 'Meetings';
    }
  };

  // Chart options based on view
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: getChartTitle(),
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
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
  };

  return (
    <Card className={classes}>
      {showControls && (
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Meeting Calendar</h6>
          <div className="btn-group btn-group-sm" role="group">
            <Button
              variant={currentView === 'year' ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => handleViewChange('year')}
            >
              Year
            </Button>
            <Button
              variant={currentView === 'month' ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => handleViewChange('month')}
            >
              Month
            </Button>
            <Button
              variant={currentView === 'week' ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => handleViewChange('week')}
            >
              Week
            </Button>
            <Button
              variant={currentView === 'day' ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => handleViewChange('day')}
            >
              Day
            </Button>
          </div>
        </Card.Header>
      )}

      <Card.Body>
        <div style={{ height }}>
          {currentView === 'day' ? (
            <LineChart data={chartData} options={chartOptions} height={height} />
          ) : (
            <BarChart data={chartData} options={chartOptions} height={height} />
          )}
        </div>

        <div className="mt-3 d-flex justify-content-between align-items-center text-muted small">
          <span>Total meetings: {meetings.length}</span>
          <span>View: {currentView}</span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CalendarChart;
