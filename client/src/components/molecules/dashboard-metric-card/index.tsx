import React from 'react';

import Card from '@/components/molecules/card';
import { BaseComponentProps } from '@/types/components-common';
import { buildClassNames } from '@/utils/component';

import './index.scss';

export interface DashboardMetricCardProps extends BaseComponentProps {
  title: string;
  value: number | string;
  icon?: string;
  colorScheme?: 'purple' | 'blue' | 'success' | 'warning' | 'danger' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  subtitle?: string;
  format?: 'number' | 'currency' | 'percentage';
}

/**
 * Dashboard Metric Card Component
 *
 * Displays key metrics with optional trend indicators and icons.
 * Follows the design pattern from the dashboard image with gradients and modern styling.
 */
const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({
  title,
  value,
  icon,
  colorScheme = 'purple',
  trend,
  subtitle,
  format = 'number',
  className,
}) => {
  const classes = buildClassNames('dashboard-metric-card', className);

  // Format the value based on the format type
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(val);
      case 'percentage':
        return `${val}%`;
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  // Get color scheme classes
  const getColorScheme = (scheme: string) => {
    const schemes = {
      purple: 'dashboard-metric-card--purple',
      blue: 'dashboard-metric-card--blue',
      success: 'dashboard-metric-card--success',
      warning: 'dashboard-metric-card--warning',
      danger: 'dashboard-metric-card--danger',
      info: 'dashboard-metric-card--info',
    };
    return schemes[scheme as keyof typeof schemes] || schemes.purple;
  };

  return (
    <Card className={buildClassNames(classes, getColorScheme(colorScheme))} shadow="sm">
      <Card.Body className="p-4">
        <div className="d-flex align-items-start justify-content-between">
          <div className="flex-grow-1">
            {/* Title */}
            <div className="dashboard-metric-card__title mb-1">
              <span className="text-muted small fw-medium">{title}</span>
            </div>

            {/* Value */}
            <div className="dashboard-metric-card__value mb-2">
              <span className="h2 fw-bold text-dark mb-0">{formatValue(value)}</span>
            </div>

            {/* Subtitle */}
            {subtitle && (
              <div className="dashboard-metric-card__subtitle">
                <span className="text-muted small">{subtitle}</span>
              </div>
            )}

            {/* Trend */}
            {trend && (
              <div className="dashboard-metric-card__trend mt-2">
                <span
                  className={buildClassNames(
                    'badge badge-sm',
                    trend.isPositive ? 'text-success' : 'text-danger',
                  )}
                >
                  <i
                    className={buildClassNames(
                      'bi',
                      trend.isPositive ? 'bi-arrow-up' : 'bi-arrow-down',
                      'me-1',
                    )}
                  />
                  {Math.abs(trend.value)}%
                </span>
                {trend.label && <span className="text-muted small ms-2">{trend.label}</span>}
              </div>
            )}
          </div>

          {/* Icon */}
          {icon && (
            <div className="dashboard-metric-card__icon">
              <div className="dashboard-metric-card__icon-wrapper">
                <i className={buildClassNames('bi', icon)} />
              </div>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default DashboardMetricCard;
