import { GET_MEETINGS_BY_DATE_RANGE } from '@/graphql/meeting/queries';
import type { CalendarViewType } from '@/types/calendar';
import { getOptimizedDateRange } from '@/utils/calendar';
import { cloneDate } from '@/utils/date';
import { useApolloClient } from '@apollo/client';
import { useCallback, useEffect } from 'react';

export const useCalendarPrefetch = (currentDate: Date, view: CalendarViewType) => {
  const client = useApolloClient();

  const prefetchAdjacentDates = useCallback(() => {
    // Prefetch previous and next periods for smooth navigation
    const nextDate = cloneDate(currentDate);
    const prevDate = cloneDate(currentDate);

    switch (view) {
      case 'month':
        nextDate.setMonth(nextDate.getMonth() + 1);
        prevDate.setMonth(prevDate.getMonth() - 1);
        break;
      case 'week':
        nextDate.setDate(nextDate.getDate() + 7);
        prevDate.setDate(prevDate.getDate() - 7);
        break;
      case 'day':
        nextDate.setDate(nextDate.getDate() + 1);
        prevDate.setDate(prevDate.getDate() - 1);
        break;
      case 'year':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        prevDate.setFullYear(prevDate.getFullYear() - 1);
        break;
    }

    // Prefetch in background
    const prefetchRanges = [
      getOptimizedDateRange(prevDate, view),
      getOptimizedDateRange(nextDate, view),
    ];

    prefetchRanges.forEach((range) => {
      client.query({
        query: GET_MEETINGS_BY_DATE_RANGE,
        variables: {
          dateRange: {
            startDate: range.start.toISOString(),
            endDate: range.end.toISOString(),
          },
        },
        fetchPolicy: 'cache-first',
      });
    });
  }, [currentDate, view, client]);

  // Prefetch when view or date changes
  useEffect(() => {
    const timeout = setTimeout(prefetchAdjacentDates, 500); // Debounce prefetching

    // Clear timeout on cleanup or component unmount
    return () => {
      clearTimeout(timeout);
    };
  }, [prefetchAdjacentDates]);
};
