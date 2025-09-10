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
  compactMode?: boolean;
  showTime?: boolean;
  showAttendees?: boolean;
  maxTitleLength?: number;
  onClick?: (meeting: MeetingEvent, event: React.MouseEvent) => void;
}

const CalendarEvent: React.FC<CalendarEventProps> = ({
  meeting,
  compactMode = false,
  showTime = true,
  showAttendees = false,
  maxTitleLength = 30,
  className,
  onClick,
  ...rest
}) => {
  // 1. Meeting status e.g. upcoming, ongoing, completed, cancelled
  const meetingStatus = getMeetingStatus(meeting);

  // 2. CSS classes
  const eventClasses = buildClassNames(
    'o-calendar-event',
    `o-calendar-event--${meetingStatus}`,
    compactMode && 'o-calendar-event--compact',
    onClick && 'o-calendar-event--clickable',
    className,
  );

  // 3. Format meeting details
  // Time range format e.g. 10:00 - 11:00
  const timeRange = showTime
    ? formatMeetingTimeRange(meeting.startTime, meeting.endTime, 'short')
    : '';

  // Attendee list format e.g. Jane Doe, John Doe (2 attendees)
  const attendeeList =
    showAttendees && meeting.attendees ? formatAttendeeList(meeting.attendees, 2) : '';

  //  Truncate title if needed
  const displayTitle =
    meeting.title.length > maxTitleLength
      ? `${meeting.title.substring(0, maxTitleLength)}...`
      : meeting.title;

  /**
   * All Event Handlers
   *
   * 1. handleClick (Meeting click)
   * 2. handleDoubleClick (Meeting double click)
   *
   * *This is a performance optimization.*
   * All of the event handlers are wrapped in useCallback to avoid unnecessary re-renders.
   * The useCallback hook is used to memoize the event handlers so that they are not recreated on every render.
   * This is important because the event handlers are passed to the child components and if they are recreated on every render,
   * the child components will also be recreated on every render.
   *
   */

  // 4. Meeting click handler
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      // Stop event propagation to prevent event from being triggered on the parent element
      event.stopPropagation();
      // Call the onClick handler with the meeting and event
      onClick?.(meeting, event);
    },
    [meeting, onClick],
  );

  return (
    <div
      className={eventClasses}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              console.log('e.key', e.key);
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
            <Text as="span" weight="normal" color="dark" className="m-0 small">
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
          <i className="bi bi-eye text-secondary" aria-hidden="true" />
        </div>
      )}
    </div>
  );
};

export default CalendarEvent;
