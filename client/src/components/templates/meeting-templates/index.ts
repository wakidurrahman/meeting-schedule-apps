/**
 * Meeting Templates
 *
 * Specialized templates for meeting functionality:
 * - CalendarTemplate: For calendar views with grid and sidebar
 * - MeetingDashboardTemplate: For meeting management dashboard
 * - MeetingDetailTemplate: For meeting detail/edit pages
 */

export { default as CalendarTemplate } from './CalendarTemplate';
export { default as MeetingDashboardTemplate } from './MeetingDashboardTemplate';
export { default as MeetingDetailTemplate } from './MeetingDetailTemplate';

// Export types
export type { CalendarTemplateProps } from './CalendarTemplate';
export type { MeetingDashboardTemplateProps } from './MeetingDashboardTemplate';
export type { MeetingDetailTemplateProps } from './MeetingDetailTemplate';
