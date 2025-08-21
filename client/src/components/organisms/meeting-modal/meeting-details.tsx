/**
 * Meeting Details Modal Component
 *
 * Displays meeting information with options to:
 * - View meeting details
 * - Edit meeting (inline or navigate to edit page)
 * - Delete meeting with confirmation
 * - Join meeting (if has meeting URL)
 * - Copy meeting link
 */

import { useMutation } from '@apollo/client';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Alert from '@/components/atoms/alert';
import Badge from '@/components/atoms/badge';
import Button from '@/components/atoms/button';
import Modal from '@/components/organisms/modal';
import {
  DELETE_MEETING,
  type DeleteMeetingMutationEvent,
  type DeleteMeetingMutationEventInput,
} from '@/graphql/meeting/mutations';
import { GET_MEETINGS } from '@/graphql/meeting/queries';
import { useToast } from '@/hooks/use-toast';
import type { MeetingEvent } from '@/types/meeting';
import { formatJST } from '@/utils/date';
import {
  calculateMeetingDuration,
  formatMeetingTimeRange,
  getMeetingStatus,
} from '@/utils/meeting';

export interface MeetingDetailsModalProps {
  show: boolean;
  meeting: MeetingEvent | null;
  onHide: () => void;
  onEdit?: (meeting: MeetingEvent) => void;
  onDelete?: (meetingId: string) => void;
}

const MeetingDetailsModal: React.FC<MeetingDetailsModalProps> = ({
  show,
  meeting,
  onHide,
  onEdit,
  onDelete,
}) => {
  // State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log('meeting', meeting);
  const navigate = useNavigate();
  const { addError, addSuccess } = useToast();

  // GraphQL mutations
  const [deleteMeeting, { loading: isDeleting }] = useMutation<
    DeleteMeetingMutationEvent,
    DeleteMeetingMutationEventInput
  >(DELETE_MEETING, {
    refetchQueries: [{ query: GET_MEETINGS }],
    onCompleted: () => {
      addSuccess({
        title: 'Success',
        subtitle: 'just now',
        children: `Meeting deleted successfully`,
      });
      onDelete?.(meeting?.id || '');
      handleClose();
    },
    onError: (error) => {
      addError({
        title: 'Error',
        subtitle: 'just now',
        children: `Failed to delete meeting: ${error.message}`,
      });
      setError(error.message);
    },
  });

  // Meeting details
  const meetingDetails = useMemo(() => {
    if (!meeting) return null;

    const status = getMeetingStatus(meeting);
    const duration = calculateMeetingDuration(meeting.startTime, meeting.endTime);
    const canEdit = true; // Add logic for permission checking
    const canDelete = true; // Add logic for permission checking

    return {
      status,
      duration,
      canEdit,
      canDelete,
      formattedStartTime: formatJST(meeting.startTime, "EEEE, MMMM d, yyyy 'at' HH:mm"),
      formattedEndTime: formatJST(meeting.endTime, 'HH:mm'),
      timeRange: formatMeetingTimeRange(meeting.startTime, meeting.endTime, 'long'),
      attendeeCount: meeting.attendees?.length || 0,
    };
  }, [meeting]);

  // Handlers
  const handleClose = useCallback(() => {
    setError(null);
    setShowDeleteConfirm(false);
    onHide();
  }, [onHide]);

  const handleEdit = useCallback(() => {
    if (meeting && onEdit) {
      navigate(`/calendar/edit/${meeting.id}`);
      onEdit(meeting);
    }
  }, [meeting, onEdit, navigate]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!meeting) return;

    try {
      await deleteMeeting({
        variables: { id: meeting.id },
      });
    } catch (error) {
      console.error('Error deleting meeting:', error);
    }
  }, [meeting, deleteMeeting]);

  const handleCopyLink = useCallback(() => {
    if (meeting) {
      const meetingUrl = `${window.location.origin}/meeting/${meeting.id}`;
      navigator.clipboard.writeText(meetingUrl);
      addSuccess({
        title: 'Success',
        subtitle: 'just now',
        children: `Meeting link copied to clipboard`,
      });
    }
  }, [meeting]);

  const handleJoinMeeting = useCallback(() => {
    // Logic to join meeting (open meeting URL, launch app, etc.)
    console.log('Joining meeting:', meeting?.id);
    addSuccess({
      title: 'Success',
      subtitle: 'just now',
      children: `Joining meeting...${meeting?.id}`,
    });
  }, [meeting]);

  const statusVariants = {
    upcoming: 'primary',
    ongoing: 'success',
    completed: 'secondary',
    cancelled: 'danger',
  } as const;

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton onClose={handleClose}>
        <Modal.Title className="d-flex align-items-center gap-2" level={5}>
          Meeting Details
          {meetingDetails && (
            <Badge variant={statusVariants[meetingDetails.status]}>{meetingDetails.status}</Badge>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            <h6>Error</h6>
            <p className="mb-0">{error}</p>
          </Alert>
        )}

        {!showDeleteConfirm ? (
          <div>
            {/* Meeting Title */}
            <div className="mb-4">
              <h5 className="mb-2">{meeting.title}</h5>
              {meeting.description && <p className="text-muted mb-0">{meeting.description}</p>}
            </div>

            {/* Meeting Time */}
            <div className="mb-4">
              <h6 className="text-primary">
                <i className="bi bi-calendar-event me-2" />
                Date & Time
              </h6>
              <div className="ps-4">
                <div className="fw-medium">{meetingDetails.formattedStartTime}</div>
                <div className="text-muted">
                  Ends at {meetingDetails.formattedEndTime} ({meetingDetails.duration})
                </div>
              </div>
            </div>

            {/* Attendees */}
            {meetingDetails.attendeeCount > 0 && (
              <div className="mb-4">
                <h6 className="text-primary">
                  <i className="bi bi-people me-2" />
                  Attendees ({meetingDetails.attendeeCount})
                </h6>
                <div className="ps-4">
                  <div className="d-flex flex-wrap gap-2">
                    {meeting.attendees?.map((attendee) => (
                      <span key={attendee.id} className="badge bg-light text-dark border">
                        {attendee.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Meeting Actions */}
            {meetingDetails.status === 'ongoing' && (
              <div className="mb-4">
                <h6 className="text-success">
                  <i className="bi bi-video me-2" />
                  Meeting is Live
                </h6>
                <div className="ps-4">
                  <Button variant="success" size="sm" onClick={handleJoinMeeting} className="me-2">
                    <i className="bi bi-camera-video me-1" />
                    Join Meeting
                  </Button>
                  <Button variant="outline-secondary" size="sm" onClick={handleCopyLink}>
                    <i className="bi bi-link-45deg me-1" />
                    Copy Link
                  </Button>
                </div>
              </div>
            )}

            {/* Meeting Info */}
            <div className="row text-center">
              <div className="col-md-4">
                <div className="border rounded p-3">
                  <div className="h4 mb-1 text-primary">{meetingDetails.duration}</div>
                  <small className="text-muted">Duration</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="border rounded p-3">
                  <div className="h4 mb-1 text-success">{meetingDetails.attendeeCount}</div>
                  <small className="text-muted">Attendees</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="border rounded p-3">
                  <div className="h4 mb-1 text-info">
                    <i className="bi bi-calendar-check" />
                  </div>
                  <small className="text-muted">Scheduled</small>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Delete Confirmation
          <div className="text-center py-4">
            <div className="mb-3">
              <i className="bi bi-exclamation-triangle fs-1 text-warning" />
            </div>
            <h5 className="mb-3">Delete Meeting?</h5>
            <p className="text-muted mb-4">
              Are you sure you want to delete &quot;{meeting.title}&quot;?
              <br />
              This action cannot be undone and all attendees will be notified.
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" />
                    Deleting...
                  </>
                ) : (
                  'Delete Meeting'
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal.Body>

      {!showDeleteConfirm && (
        <Modal.Footer>
          <div className="d-flex justify-content-between w-100">
            <div>
              <Button variant="outline-secondary" onClick={handleCopyLink}>
                <i className="bi bi-link-45deg me-1" />
                Copy Link
              </Button>
            </div>
            <div className="d-flex gap-2">
              {meetingDetails.canDelete && (
                <Button variant="outline-danger" onClick={handleDeleteClick} disabled={isDeleting}>
                  <i className="bi bi-trash me-1" />
                  Delete
                </Button>
              )}
              {meetingDetails.canEdit && (
                <Button variant="outline-primary" onClick={handleEdit}>
                  <i className="bi bi-pencil me-1" />
                  Edit
                </Button>
              )}
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default MeetingDetailsModal;
