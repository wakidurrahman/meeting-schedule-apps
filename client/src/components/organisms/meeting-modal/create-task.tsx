/**
 * Create Meeting Modal Component
 *
 * Full-featured meeting creation modal with:
 * - Form validation using react-hook-form + Zod
 * - Attendee selection with ReactSelectField
 * - Real-time conflict detection
 * - Time slot validation
 * - Optimistic updates
 */

import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import Alert from '@/components/atoms/alert';
import Button from '@/components/atoms/button';
import ReactSelectField from '@/components/atoms/react-select';
import TextField from '@/components/atoms/text-field';
import TextareaField from '@/components/atoms/textarea-field';
import Modal from '@/components/organisms/modal';
import {
  CREATE_MEETING,
  type CreateMeetingMutationData,
  type CreateMeetingMutationVariables,
} from '@/graphql/meeting/mutations';
import {
  CHECK_MEETING_CONFLICTS,
  GET_MEETINGS,
  type ConflictCheckQueryData,
} from '@/graphql/meeting/queries';
import { GET_USERS } from '@/graphql/user/queries';
import { MeetingEvent } from '@/types/meeting';
import {
  checkMeetingConflicts,
  getDefaultMeetingTimes,
  validateMeetingData,
} from '@/utils/meeting';
import { CreateMeetingEventSchema } from '@/utils/validation';

type CreateTaskFormData = z.infer<typeof CreateMeetingEventSchema>;

export interface CreateTaskModalProps {
  show: boolean;
  onHide: () => void;
  selectedDate?: Date;
  onSuccess?: (meeting: MeetingEvent) => void;
  existingMeetings?: MeetingEvent[];
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  show,
  onHide,
  selectedDate,
  onSuccess,
  existingMeetings = [],
}) => {
  // State
  const [conflicts, setConflicts] = useState<Array<{ severity: string; message: string }>>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);

  // GraphQL hooks: Create meeting mutation.
  const [createMeeting, { loading: isCreating }] = useMutation<
    CreateMeetingMutationData,
    CreateMeetingMutationVariables
  >(CREATE_MEETING, {
    refetchQueries: [{ query: GET_MEETINGS }],
    onCompleted: (data) => {
      const meetingEvent: MeetingEvent = {
        id: data.createMeeting.id,
        title: data.createMeeting.title,
        description: data.createMeeting.description || undefined,
        startTime: new Date(data.createMeeting.startTime),
        endTime: new Date(data.createMeeting.endTime),
        attendees:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.createMeeting.attendees?.map((a: any) => ({ id: a.id, name: a.name })) || [],
      };
      onSuccess?.(meetingEvent);
      handleClose();
    },
  });

  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS);

  // GraphQL hooks: Check meeting conflicts.
  const [checkConflicts] = useLazyQuery<ConflictCheckQueryData>(CHECK_MEETING_CONFLICTS, {
    onCompleted: (data) => {
      setIsCheckingConflicts(false);
      setConflicts(data.checkMeetingConflicts.conflicts);
      setWarnings(data.checkMeetingConflicts.warnings);
    },
    onError: () => {
      setIsCheckingConflicts(false);
    },
  });

  // Form setup: Default times.
  const defaultTimes = useMemo(() => {
    return getDefaultMeetingTimes(selectedDate);
  }, [selectedDate]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(CreateMeetingEventSchema),
    defaultValues: {
      title: '',
      description: '',
      startTime: defaultTimes.startTime,
      endTime: defaultTimes.endTime,
      attendeeIds: [],
    },
  });

  // Watch form values for conflict checking.
  const watchedValues = watch(['startTime', 'endTime', 'attendeeIds']);

  // Debounced conflict checking.
  useEffect(() => {
    const [startTime, endTime, attendeeIds] = watchedValues;

    if (!startTime || !endTime || !attendeeIds) return;

    const timer = setTimeout(() => {
      setIsCheckingConflicts(true);

      // Client-side conflict check first
      const clientConflicts = checkMeetingConflicts(
        { title: '', startTime, endTime, attendeeIds },
        existingMeetings,
      );

      if (clientConflicts.length > 0) {
        setConflicts(clientConflicts);
        setIsCheckingConflicts(false);
        return;
      }

      // Server-side conflict check
      checkConflicts({
        variables: {
          input: {
            startTime,
            endTime,
            attendeeIds: attendeeIds || [],
          },
        },
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [watchedValues, existingMeetings, checkConflicts]);

  // User options for attendee selection.
  const userOptions = useMemo(() => {
    if (!usersData?.users?.usersList) return [];

    return usersData.users.usersList.map((user) => ({
      value: user.id,
      label: `${user.name} (${user.email})`,
    }));
  }, [usersData]);

  // Handlers: Close modal.
  const handleClose = useCallback(() => {
    reset();
    setConflicts([]);
    setWarnings([]);
    onHide();
  }, [reset, onHide]);

  const onSubmit = async (data: CreateTaskFormData) => {
    try {
      // Final validation
      const validation = validateMeetingData({
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        attendeeIds: data.attendeeIds,
      });

      if (!validation.isValid) {
        console.error('Validation failed:', validation.errors);
        return;
      }

      // Check for blocking conflicts
      const blockingConflicts = conflicts.filter(
        (c) => c.severity === 'error' || c.severity === 'ERROR',
      );
      if (blockingConflicts.length > 0) {
        console.error('Cannot create meeting due to conflicts');
        return;
      }

      await createMeeting({
        variables: {
          input: {
            title: data.title,
            description: data.description || undefined,
            startTime: data.startTime,
            endTime: data.endTime,
            attendeeIds: data.attendeeIds || [],
          },
        },
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  const hasBlockingConflicts = conflicts.some(
    (c) => c.severity === 'error' || c.severity === 'ERROR',
  );

  return (
    <Modal show={show} centered onHide={handleClose} size="md">
      <Modal.Header closeButton onClose={handleClose}>
        <Modal.Title level={5}>Create Task</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Meeting Title */}
          <TextField
            label="Meeting Title"
            placeholder="Enter meeting title"
            required
            error={errors.title?.message}
            {...register('title')}
          />

          {/* Meeting Description */}
          <TextareaField
            label="Description (Optional)"
            placeholder="Add meeting details, agenda, etc."
            rows={3}
            error={errors.description?.message}
            {...register('description')}
          />

          {/* Date & Time */}
          <div className="row">
            <div className="col-md-6">
              <TextField
                type="datetime-local"
                label="Start Time"
                required
                error={errors.startTime?.message}
                {...register('startTime')}
              />
            </div>
            <div className="col-md-6">
              <TextField
                type="datetime-local"
                label="End Time"
                required
                error={errors.endTime?.message}
                {...register('endTime')}
              />
            </div>
          </div>

          {/* Attendees Selection */}
          <Controller
            name="attendeeIds"
            control={control}
            render={({ field }) => (
              <ReactSelectField
                label="Attendees (Optional)"
                placeholder="Search and select attendees..."
                isMulti
                isSearchable
                isClearable
                isLoading={usersLoading}
                options={userOptions}
                value={userOptions.filter((option) =>
                  (field.value || []).includes(option.value as string),
                )}
                onChange={(selectedOptions) => {
                  const values = Array.isArray(selectedOptions)
                    ? selectedOptions.map((option) => option.value as string)
                    : [];
                  field.onChange(values);
                }}
                error={errors.attendeeIds?.message}
                helpText="Only registered users can be invited"
              />
            )}
          />

          {/* Conflict Detection Results */}
          {isCheckingConflicts && (
            <Alert variant="info" className="d-flex align-items-center">
              <div className="spinner-border spinner-border-sm me-2" />
              Checking for conflicts...
            </Alert>
          )}

          {conflicts.length > 0 && (
            <Alert variant={hasBlockingConflicts ? 'danger' : 'warning'}>
              <h6 className="mb-2">
                {hasBlockingConflicts ? 'Meeting Conflicts Detected' : 'Potential Issues'}
              </h6>
              <ul className="mb-0">
                {conflicts.map((conflict, index) => (
                  <li key={index}>{conflict.message}</li>
                ))}
              </ul>
            </Alert>
          )}

          {warnings.length > 0 && (
            <Alert variant="warning">
              <h6 className="mb-2">Recommendations</h6>
              <ul className="mb-0">
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </Alert>
          )}
        </form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting || isCreating}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || isCreating || hasBlockingConflicts}
        >
          {isCreating ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" />
              Creating...
            </>
          ) : (
            'Create Meeting'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateTaskModal;
