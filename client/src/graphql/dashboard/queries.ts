import { gql } from '@apollo/client';
import { TypedDocumentNode as TD } from '@graphql-typed-document-node/core';

/**
 * Dashboard-related queries for statistics and metrics
 */

// Dashboard statistics interface
export interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalBookings: number;
  totalMeetings: number;
  totalRevenue: number;
  recentUsers: number;
  recentEvents: number;
  recentBookings: number;
  recentMeetings: number;
  upcomingMeetings: number;
  ongoingMeetings: number;
  completedMeetings: number;
  cancelledMeetings: number;
}

// Dashboard overview query
export interface DashboardOverviewQueryData {
  dashboardOverview: DashboardStats;
}

export const GET_DASHBOARD_OVERVIEW: TD<DashboardOverviewQueryData, Record<string, never>> = gql`
  query DashboardOverview {
    dashboardOverview {
      totalUsers
      totalEvents
      totalBookings
      totalMeetings
      totalRevenue
      recentUsers
      recentEvents
      recentBookings
      recentMeetings
      upcomingMeetings
      ongoingMeetings
      completedMeetings
      cancelledMeetings
    }
  }
` as unknown as TD<DashboardOverviewQueryData, Record<string, never>>;

// Monthly analytics interface
export interface MonthlyAnalytics {
  month: string;
  users: number;
  events: number;
  bookings: number;
  meetings: number;
  revenue: number;
}

// Monthly analytics query
export interface MonthlyAnalyticsQueryData {
  monthlyAnalytics: MonthlyAnalytics[];
}

export interface MonthlyAnalyticsQueryVars {
  year?: number;
  months?: number; // Number of months to fetch
}

export const GET_MONTHLY_ANALYTICS: TD<MonthlyAnalyticsQueryData, MonthlyAnalyticsQueryVars> = gql`
  query MonthlyAnalytics($year: Int, $months: Int) {
    monthlyAnalytics(year: $year, months: $months) {
      month
      users
      events
      bookings
      meetings
      revenue
    }
  }
` as unknown as TD<MonthlyAnalyticsQueryData, MonthlyAnalyticsQueryVars>;

// Meeting analytics by time period
export interface MeetingAnalytics {
  period: string;
  count: number;
  totalDuration: number; // in minutes
  averageDuration: number; // in minutes
  attendeesCount: number;
}

export interface MeetingAnalyticsQueryData {
  meetingAnalytics: MeetingAnalytics[];
}

export interface MeetingAnalyticsQueryVars {
  period: 'day' | 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const GET_MEETING_ANALYTICS: TD<MeetingAnalyticsQueryData, MeetingAnalyticsQueryVars> = gql`
  query MeetingAnalytics($period: String!, $startDate: String, $endDate: String, $limit: Int) {
    meetingAnalytics(period: $period, startDate: $startDate, endDate: $endDate, limit: $limit) {
      period
      count
      totalDuration
      averageDuration
      attendeesCount
    }
  }
` as unknown as TD<MeetingAnalyticsQueryData, MeetingAnalyticsQueryVars>;

// User activity analytics
export interface UserActivity {
  date: string;
  activeUsers: number;
  newUsers: number;
  meetingsCreated: number;
  eventsCreated: number;
  bookingsMade: number;
}

export interface UserActivityQueryData {
  userActivity: UserActivity[];
}

export interface UserActivityQueryVars {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month';
}

export const GET_USER_ACTIVITY: TD<UserActivityQueryData, UserActivityQueryVars> = gql`
  query UserActivity($startDate: String, $endDate: String, $period: String) {
    userActivity(startDate: $startDate, endDate: $endDate, period: $period) {
      date
      activeUsers
      newUsers
      meetingsCreated
      eventsCreated
      bookingsMade
    }
  }
` as unknown as TD<UserActivityQueryData, UserActivityQueryVars>;

// Revenue analytics
export interface RevenueAnalytics {
  period: string;
  totalRevenue: number;
  eventRevenue: number;
  bookingRevenue: number;
  transactionCount: number;
  averageTransactionValue: number;
}

export interface RevenueAnalyticsQueryData {
  revenueAnalytics: RevenueAnalytics[];
}

export interface RevenueAnalyticsQueryVars {
  period: 'day' | 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
}

export const GET_REVENUE_ANALYTICS: TD<RevenueAnalyticsQueryData, RevenueAnalyticsQueryVars> = gql`
  query RevenueAnalytics($period: String!, $startDate: String, $endDate: String) {
    revenueAnalytics(period: $period, startDate: $startDate, endDate: $endDate) {
      period
      totalRevenue
      eventRevenue
      bookingRevenue
      transactionCount
      averageTransactionValue
    }
  }
` as unknown as TD<RevenueAnalyticsQueryData, RevenueAnalyticsQueryVars>;

// Top performing events/users
export interface TopPerformers {
  events: Array<{
    id: string;
    title: string;
    bookingCount: number;
    revenue: number;
  }>;
  users: Array<{
    id: string;
    name: string;
    email: string;
    meetingCount: number;
    eventCount: number;
    totalRevenue: number;
  }>;
}

export interface TopPerformersQueryData {
  topPerformers: TopPerformers;
}

export interface TopPerformersQueryVars {
  limit?: number;
  period?: 'week' | 'month' | 'quarter' | 'year';
}

export const GET_TOP_PERFORMERS: TD<TopPerformersQueryData, TopPerformersQueryVars> = gql`
  query TopPerformers($limit: Int, $period: String) {
    topPerformers(limit: $limit, period: $period) {
      events {
        id
        title
        bookingCount
        revenue
      }
      users {
        id
        name
        email
        meetingCount
        eventCount
        totalRevenue
      }
    }
  }
` as unknown as TD<TopPerformersQueryData, TopPerformersQueryVars>;
