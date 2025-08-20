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

import React, { useCallback } from 'react';

import Text from '@/components/atoms/text';
import { BaseComponentProps } from '@/types/components-common';
import type { MeetingEvent } from '@/types/meeting';
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
  /**
   * All Event Handlers
   *
   * *This is a performance optimization.*
   * All of the event handlers are wrapped in useCallback to avoid unnecessary re-renders.
   * The useCallback hook is used to memoize the event handlers so that they are not recreated on every render.
   * This is important because the event handlers are passed to the child components and if they are recreated on every render,
   * the child components will also be recreated on every render.
   *
   * 1. handleClick (Meeting click)
   * 2. handleDoubleClick (Meeting double click)
   */

  // 1. Meeting click handler
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onClick?.(meeting, event);
    },
    [meeting, onClick],
  );

  // 2. Meeting double click handler
  const handleDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onDoubleClick?.(meeting, event);
    },
    [meeting, onDoubleClick],
  );

  // 3. Format meeting details
  const timeRange = showTime
    ? formatMeetingTimeRange(meeting.startTime, meeting.endTime, 'short')
    : '';
  const attendeeList =
    showAttendees && meeting.attendees ? formatAttendeeList(meeting.attendees, 2) : '';
  const meetingStatus = getMeetingStatus(meeting);

  // 4. Truncate title if needed
  const displayTitle =
    meeting.title.length > maxTitleLength
      ? `${meeting.title.substring(0, maxTitleLength)}...`
      : meeting.title;

  // 5. CSS classes
  const eventClasses = buildClassNames(
    'o-calendar-event',
    `o-calendar-event--${meetingStatus}`,
    compactMode && 'o-calendar-event--compact',
    onClick && 'o-calendar-event--clickable',
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
      <div className="o-calendar-event__content">
        {/* Time indicator */}
        {showTime && timeRange && !compactMode && (
          <div className="o-calendar-event__time">
            <Text as="small" weight="normal" color="dark" className="m-0">
              {timeRange}
            </Text>
          </div>
        )}

        {/* Meeting title */}
        <div className="o-calendar-event__title">
          <Text as="span" weight="medium" color="dark" className="m-0">
            {displayTitle}
          </Text>
        </div>

        {/* Attendees info */}
        {showAttendees && meeting.attendees && meeting.attendees.length > 0 && !compactMode && (
          <div className="o-calendar-event__attendees">
            <Text as="small" weight="normal" color="dark" className="m-0">
              <i className="bi bi-people me-1 text-info" aria-hidden="true" />
              {meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? 's' : ''}
            </Text>
          </div>
        )}

        {/* Status indicator */}
        <div className="o-calendar-event__status">
          <span
            className={`o-calendar-event__status-dot o-calendar-event__status-dot--${meetingStatus}`}
          />
        </div>
      </div>

      {/* Hover overlay */}
      {onClick && (
        <div className="o-calendar-event__hover-overlay">
          <i className="bi bi-eye" aria-hidden="true" />
        </div>
      )}
    </div>
  );
};

export default CalendarEvent;
