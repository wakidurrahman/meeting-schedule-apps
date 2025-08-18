/**
 * Calendar Event Component
 *
 * Displays individual meeting events within calendar cells:
 * - Meeting title and time
 * - Attendee count indication
 * - Click to view details
 * - Hover effects
 * - Truncation for long titles
 */

import React from 'react';

import { BaseComponentProps } from '@/types/components-common';
import type { MeetingEvent } from '@/utils/calendar';
import { buildClassNames } from '@/utils/component';
import { formatAttendeeList, formatMeetingTimeRange, getMeetingStatus } from '@/utils/meeting';

export interface CalendarEventProps extends BaseComponentProps {
  meeting: MeetingEvent;
  onClick?: (meeting: MeetingEvent, event: React.MouseEvent) => void;
  onDoubleClick?: (meeting: MeetingEvent, event: React.MouseEvent) => void;
  compactMode?: boolean;
  showTime?: boolean;
  showAttendees?: boolean;
  maxTitleLength?: number;
}

const CalendarEvent: React.FC<CalendarEventProps> = ({
  meeting,
  onClick,
  onDoubleClick,
  compactMode = false,
  showTime = true,
  showAttendees = true,
  maxTitleLength = 30,
  className,
  ...rest
}) => {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onClick?.(meeting, event);
  };

  const handleDoubleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDoubleClick?.(meeting, event);
  };

  // Format meeting details
  const timeRange = showTime
    ? formatMeetingTimeRange(meeting.startTime, meeting.endTime, 'short')
    : '';
  const attendeeList =
    showAttendees && meeting.attendees ? formatAttendeeList(meeting.attendees, 2) : '';
  const meetingStatus = getMeetingStatus(meeting);

  // Truncate title if needed
  const displayTitle =
    meeting.title.length > maxTitleLength
      ? `${meeting.title.substring(0, maxTitleLength)}...`
      : meeting.title;

  // CSS classes
  const eventClasses = buildClassNames(
    'calendar-event',
    `calendar-event--${meetingStatus}`,
    compactMode && 'calendar-event--compact',
    onClick && 'calendar-event--clickable',
    className,
  );

  return (
    <div
      className={eventClasses}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(meeting, e as unknown as React.MouseEvent);
              }
            }
          : undefined
      }
      title={`${meeting.title}${timeRange ? ` (${timeRange})` : ''}${attendeeList ? ` - ${attendeeList}` : ''}`}
      {...rest}
    >
      {/* Meeting content */}
      <div className="calendar-event__content">
        {/* Time indicator */}
        {showTime && timeRange && !compactMode && (
          <div className="calendar-event__time">
            <small className="text-muted">{timeRange}</small>
          </div>
        )}

        {/* Meeting title */}
        <div className="calendar-event__title">
          <span className="fw-medium">{displayTitle}</span>
        </div>

        {/* Attendees info */}
        {showAttendees && meeting.attendees && meeting.attendees.length > 0 && !compactMode && (
          <div className="calendar-event__attendees">
            <small className="text-muted">
              <i className="bi bi-people me-1" aria-hidden="true" />
              {meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? 's' : ''}
            </small>
          </div>
        )}

        {/* Status indicator */}
        <div className="calendar-event__status">
          <span
            className={`calendar-event__status-dot calendar-event__status-dot--${meetingStatus}`}
          />
        </div>
      </div>

      {/* Hover overlay */}
      {onClick && (
        <div className="calendar-event__hover-overlay">
          <i className="bi bi-eye" aria-hidden="true" />
        </div>
      )}
    </div>
  );
};

CalendarEvent.displayName = 'CalendarEvent';

export default CalendarEvent;
