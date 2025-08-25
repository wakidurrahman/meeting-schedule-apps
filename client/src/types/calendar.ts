/**
 * Calendar Types
 *
 * Type definitions for:
 * - CalendarDay: A single day in the calendar
 * - CalendarWeek: A week in the calendar
 * - CalendarGrid: A grid of days in the calendar
 * - TimeSlot: A time slot in the calendar
 * - CalendarViewType: The type of view in the calendar
 * - CalendarProps: The props for the calendar component
 * - CalendarHeaderProps: The props for the calendar header component
 * - CalendarGridProps: The props for the calendar grid component
 * - CalendarEventProps: The props for the calendar event component
 * - MeetingModalProps: The props for the meeting modal component
 * - QuickCreateModalProps: The props for the quick create modal component
 * - MeetingDetailsModalProps: The props for the meeting details modal component
 * - MeetingListProps: The props for the meeting list component
 * - MeetingCardProps: The props for the meeting card component
 * - TimeSlotProps: The props for the time slot component
 * - MeetingFilterProps: The props for the meeting filter component
 * - CalendarNavigationAction: The action for the calendar navigation
 * - CalendarViewAction: The action for the calendar view
 * - CalendarDateAction: The action for the calendar date
 * - CalendarState: The state of the calendar
 * - MeetingFormState: The state of the meeting form
 */

import type { BaseComponentProps } from '@/types/components-common';
import type {
  AttendeeAvailability,
  MeetingConflict,
  MeetingEvent,
  MeetingFormData,
  MeetingValidationResult,
} from '@/types/meeting';
import type { AttendeeUser } from '@/types/user';

export interface CalendarDay {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  isPreviousMonth: boolean;
  isNextMonth: boolean;
  dayNumber: number;
  meetings: MeetingEvent[];
}

export interface CalendarWeek {
  days: CalendarDay[];
  weekNumber: number;
}

export interface CalendarGridType {
  weeks: CalendarWeek[];
  currentMonth: number;
  currentYear: number;
  totalDays: number;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  isAvailable: boolean;
  meetings: MeetingEvent[];
}

export type CalendarViewType = 'day' | 'week' | 'month' | 'year';

/**
 * Enhanced calendar title data structure
 * Supports complex title layouts with multiple display elements
 */
export interface CalendarTitleData {
  /** Primary month abbreviation (e.g., "JAN") - mainly for month view */
  monthAbbr?: string;
  /** Day number for current/selected date (e.g., "10") - mainly for month view */
  dayNumber?: string;
  /** Main title displayed prominently (e.g., "January 2025") */
  mainTitle: string;
  /** Secondary subtitle or date range (e.g., "Jan 1, 2025 - Jan 31, 2025") */
  subtitle?: string;
  /** Optional view-specific metadata */
  metadata?: {
    isToday?: boolean;
    isCurrentMonth?: boolean;
    selectedDate?: Date;
    viewType?: CalendarViewType;
  };
}

// Calendar Component Types
export interface CalendarProps extends BaseComponentProps {
  /**
   * Current view type
   */
  view: CalendarViewType;
  /**
   * Currently selected date
   */
  selectedDate: Date;
  /**
   * Array of meetings to display
   */
  meetings: MeetingEvent[];
  /**
   * Callback when a date is clicked
   */
  onDateClick?: (date: Date) => void;
  /**
   * Callback when a meeting is clicked
   */
  onMeetingClick?: (meeting: MeetingEvent) => void;
  /**
   * Callback when create meeting is requested
   */
  onCreateMeeting?: (date?: Date) => void;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Show weekend days
   */
  showWeekends?: boolean;
  /**
   * Minimum time for new meetings
   */
  minTime?: string;
  /**
   * Maximum time for new meetings
   */
  maxTime?: string;
}

export interface CalendarHeaderProps extends BaseComponentProps {
  /**
   * Current date being displayed
   */
  currentDate: Date;
  /**
   * Current view type
   */
  view: CalendarViewType;
  /**
   * Enhanced calendar title with structured data
   * Supports both simple string (legacy) and structured title format
   */
  title: string | CalendarTitleData;
  /**
   * Callback when view changes
   */
  onViewChange?: (view: CalendarViewType) => void;
  /**
   * Callback when navigating to previous period
   */
  onNavigatePrevious?: () => void;
  /**
   * Callback when navigating to next period
   */
  onNavigateNext?: () => void;
  /**
   * Callback when today button is clicked
   */
  onNavigateToday?: () => void;
  /**
   * Callback when create meeting is clicked
   */
  onCreateMeeting?: () => void;
  /**
   * Show create meeting button
   */
  showCreateButton?: boolean;
  /**
   * Loading state
   */
  loading?: boolean;
}

export interface CalendarGridProps extends BaseComponentProps {
  /**
   * Calendar grid data
   */
  calendarGrid: CalendarGridType;
  /**
   * Currently selected date
   */
  selectedDate?: Date;
  /**
   * Callback when a date is clicked
   */
  onDateClick?: (date: Date) => void;
  /**
   * Callback when a meeting is clicked
   */
  onMeetingClick?: (meeting: MeetingEvent) => void;
  /**
   * Show weekend days
   */
  showWeekends?: boolean;
  /**
   * Compact mode (smaller cells)
   */
  compact?: boolean;
}

export interface CalendarEventProps extends BaseComponentProps {
  /**
   * Meeting event to display
   */
  meeting: MeetingEvent;
  /**
   * Callback when event is clicked
   */
  onClick?: (meeting: MeetingEvent) => void;
  /**
   * Display format
   */
  format?: 'full' | 'compact' | 'minimal';
  /**
   * Show time information
   */
  showTime?: boolean;
  /**
   * Show attendee count
   */
  showAttendees?: boolean;
  /**
   * Draggable event (for future implementation)
   */
  draggable?: boolean;
}

// Meeting Modal Types
export interface MeetingModalProps extends BaseComponentProps {
  /**
   * Show/hide modal
   */
  show: boolean;
  /**
   * Callback when modal is closed
   */
  onHide: () => void;
  /**
   * Meeting data (for edit mode)
   */
  meeting?: MeetingEvent | null;
  /**
   * Pre-selected date (for create mode)
   */
  selectedDate?: Date;
  /**
   * Available users for attendee selection
   */
  availableUsers?: Array<AttendeeUser>;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Callback when meeting is saved
   */
  onSave?: (meetingData: MeetingFormData) => void;
  /**
   * Callback when meeting is deleted
   */
  onDelete?: (meetingId: string) => void;
}

export interface QuickCreateModalProps extends BaseComponentProps {
  /**
   * Show/hide modal
   */
  show: boolean;
  /**
   * Callback when modal is closed
   */
  onHide: () => void;
  /**
   * Pre-selected date/time
   */
  selectedDate?: Date;
  /**
   * Available users for attendee selection
   */
  availableUsers?: Array<AttendeeUser>;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Callback when meeting is created
   */
  onCreate?: (meetingData: MeetingFormData) => void;
}

export interface MeetingDetailsModalProps extends BaseComponentProps {
  /**
   * Show/hide modal
   */
  show: boolean;
  /**
   * Callback when modal is closed
   */
  onHide: () => void;
  /**
   * Meeting to display
   */
  meeting: MeetingEvent | null;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Callback when edit is requested
   */
  onEdit?: (meeting: MeetingEvent) => void;
  /**
   * Callback when delete is requested
   */
  onDelete?: (meetingId: string) => void;
  /**
   * Show edit/delete actions
   */
  showActions?: boolean;
  /**
   * Current user ID (to determine permissions)
   */
  currentUserId?: string;
}

// Meeting List/Dashboard Types
export interface MeetingListProps extends BaseComponentProps {
  /**
   * Array of meetings to display
   */
  meetings: MeetingEvent[];
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Callback when a meeting is clicked
   */
  onMeetingClick?: (meeting: MeetingEvent) => void;
  /**
   * Callback when edit is requested
   */
  onEdit?: (meeting: MeetingEvent) => void;
  /**
   * Callback when delete is requested
   */
  onDelete?: (meetingId: string) => void;
  /**
   * Display format
   */
  format?: 'list' | 'card' | 'table';
  /**
   * Show actions (edit/delete)
   */
  showActions?: boolean;
  /**
   * Empty state message
   */
  emptyMessage?: string;
  /**
   * Group by date
   */
  groupByDate?: boolean;
}

export interface MeetingCardProps extends BaseComponentProps {
  /**
   * Meeting to display
   */
  meeting: MeetingEvent;
  /**
   * Callback when card is clicked
   */
  onClick?: (meeting: MeetingEvent) => void;
  /**
   * Callback when edit is requested
   */
  onEdit?: (meeting: MeetingEvent) => void;
  /**
   * Callback when delete is requested
   */
  onDelete?: (meetingId: string) => void;
  /**
   * Show actions (edit/delete)
   */
  showActions?: boolean;
  /**
   * Compact display mode
   */
  compact?: boolean;
  /**
   * Show full details
   */
  showDetails?: boolean;
}

// Time Slot Types
export interface TimeSlotProps extends BaseComponentProps {
  /**
   * Time slot to display
   */
  slot: TimeSlot;
  /**
   * Callback when slot is clicked
   */
  onClick?: (slot: TimeSlot) => void;
  /**
   * Show availability status
   */
  showAvailability?: boolean;
  /**
   * Compact display mode
   */
  compact?: boolean;
}

// Filter and Search Types
export interface MeetingFilterProps extends BaseComponentProps {
  /**
   * Current filter values
   */
  filters: {
    dateRange?: { start: Date; end: Date };
    attendees?: string[];
    status?: Array<'upcoming' | 'ongoing' | 'completed'>;
    search?: string;
  };
  /**
   * Available users for attendee filtering
   */
  availableUsers?: Array<{ id: string; name: string }>;
  /**
   * Callback when filters change
   */
  onFiltersChange?: (filters: MeetingFilterProps['filters']) => void;
  /**
   * Callback when filters are cleared
   */
  onClearFilters?: () => void;
}

// Navigation Types
export interface CalendarNavigationAction {
  type: 'navigate';
  direction: 'previous' | 'next' | 'today';
  view: CalendarViewType;
  currentDate: Date;
}

export interface CalendarViewAction {
  type: 'view-change';
  view: CalendarViewType;
}

export interface CalendarDateAction {
  type: 'date-select';
  date: Date;
}

export type CalendarAction = CalendarNavigationAction | CalendarViewAction | CalendarDateAction;

// State Types
export interface CalendarState {
  currentDate: Date;
  selectedDate: Date | null;
  view: CalendarViewType;
  meetings: MeetingEvent[];
  loading: boolean;
  error: string | null;
}

export interface MeetingFormState {
  data: MeetingFormData;
  validation: MeetingValidationResult;
  conflicts: MeetingConflict[];
  attendeeAvailability: AttendeeAvailability[];
  loading: boolean;
  error: string | null;
}
