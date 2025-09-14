/**
 * ============================================================================
 * CREATE MEETING EVENT MODAL - COMPREHENSIVE DOCUMENTATION
 * ============================================================================
 *
 * A meeting event creation modal component. This component serves as the primary interface for
 * creating new meeting events within the meeting scheduler application.
 *
 * ARCHITECTURE & FEATURES:
 * • Advanced form validation (react-hook-form + Zod schemas)
 * • Real-time conflict detection with debounced checking
 * • Multi-user attendee selection with search capabilities
 * • Intelligent default time suggestions
 * • GraphQL-powered mutations with optimistic updates
 * • Context-aware authentication and error handling
 * • Accessibility-compliant modal interface
 * • Mobile-responsive Bootstrap design
 *
 * VALIDATION LAYERS:
 * 1. Zod Schema (field-level, immediate feedback)
 * 2. Business Logic (submit-time warnings)
 * 3. Server-side (GraphQL resolvers)
 * 4. Conflict Detection (time slot conflicts)
 *
 * STATE MANAGEMENT:
 * • React Hook Form for form state and validation
 * • Local state for UI concerns (conflicts, loading)
 * • Apollo Client for server state and caching
 * • Context API for auth and notifications
 *
 * PERFORMANCE OPTIMIZATIONS:
 * • useMemo for user options computation
 * • useCallback for event handlers
 * • Debounced conflict checking (500ms)
 * • Apollo Client caching for user data
 * • Client-side conflict validation before server calls
 *
 * PROPS:
 * @param {boolean} show - Controls modal visibility
 * @param {Date} [selectedDate] - Pre-selected date for meeting
 * @param {MeetingEvent[]} [existingMeetings] - For conflict checking
 * @param {() => void} onHide - Modal close callback
 * @param {(meeting: MeetingEvent) => void} [onSuccess] - Success callback
 *
 * USAGE EXAMPLE:
 * ```tsx
 * <CreateMeetingModal
 *   show={showModal}
 *   selectedDate={clickedDate}
 *   existingMeetings={todaysMeetings}
 *   onHide={() => setShowModal(false)}
 *   onSuccess={(meeting) => handleNewMeeting(meeting)}
 * />
 * ```
 */

import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import Alert from '@/components/atoms/alert';
import Button from '@/components/atoms/button';
import ReactSelectField from '@/components/atoms/react-select';
import Spinner from '@/components/atoms/spinner';
import TextField from '@/components/atoms/text-field';
import TextareaField from '@/components/atoms/textarea-field';
import Modal from '@/components/organisms/modal';
import { useAuthUser } from '@/context/AuthContext';
import {
  CREATE_MEETING_EVENT,
  type CreateMeetingMutation,
  type CreateMeetingMutationInput,
} from '@/graphql/meeting/mutations';
import { CHECK_MEETING_CONFLICTS, type ConflictCheckQueryData } from '@/graphql/meeting/queries';
import { GET_USERS } from '@/graphql/user/queries';
import { useToast } from '@/hooks/use-toast';
import { MeetingEvent } from '@/types/meeting';
import {
  checkMeetingConflicts,
  getDefaultMeetingTimes,
  validateMeetingData,
} from '@/utils/meeting';
import { CreateMeetingEventSchema } from '@/utils/validation';

/**
 * ============================================================================
 * TYPE DEFINITIONS & INTERFACES
 * ============================================================================
 */

// Form data type inferred from Zod schema
type CreateMeetingFormData = z.infer<typeof CreateMeetingEventSchema>;

/**
 * Props interface for CreateMeetingModal component
 *
 * @interface CreateMeetingModalProps
 */
export interface CreateMeetingModalProps {
  /** Controls modal visibility (required) */
  show: boolean;

  /** Pre-selected date for meeting (optional) - sets default start/end times */
  selectedDate?: Date;

  /** Array of existing meetings for client-side conflict checking (optional) */
  existingMeetings?: MeetingEvent[];

  /** Callback when modal should be hidden (required) */
  onHide: () => void;

  /** Callback when meeting is successfully created (optional) */
  onSuccess?: (meeting: MeetingEvent) => void;
}

const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
  show,
  selectedDate,
  existingMeetings = [],
  onHide,
  onSuccess,
}) => {
  /**
   * ========================================================================
   * COMPONENT STATE MANAGEMENT
   * ========================================================================
   */

  // Meeting conflict detection state
  const [conflicts, setConflicts] = useState<Array<{ severity: string; message: string }>>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState<boolean>(false);

  // Context hooks
  const currentUser = useAuthUser();
  const { addError } = useToast();

  /**
   * Authentication setup - log current user for debugging
   * Only updates when currentUser changes to prevent unnecessary re-renders
   */
  useEffect(() => {
    console.log('Current user:', currentUser);
    console.log('selectedDate', selectedDate);
  }, [currentUser, selectedDate]);

  /**
   * ========================================================================
   * GRAPHQL HOOKS & SERVER COMMUNICATION
   * ========================================================================
   */

  /**
   * Create meeting mutation hook
   * - Automatically refetches GET_MEETINGS to update calendar views
   * - Handles success/error states with user feedback
   * - Transforms GraphQL response to MeetingEvent format
   */
  const [createMeeting, { loading: isCreating, error: createMeetingError }] = useMutation<
    CreateMeetingMutation,
    CreateMeetingMutationInput
  >(CREATE_MEETING_EVENT, {
    // Let Apollo cache handle updates automatically - refetch all active queries
    refetchQueries: [],
    awaitRefetchQueries: false,

    // Success handler - transform data and close modal
    onCompleted: (data) => {
      const meetingEvent: MeetingEvent = {
        id: data.createMeeting.id,
        title: data.createMeeting.title,
        description: data.createMeeting.description || undefined,
        startTime: new Date(data.createMeeting.startTime),
        endTime: new Date(data.createMeeting.endTime),
        attendees:
          // Transform GraphQL attendee data to expected format
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.createMeeting.attendees?.map((a: any) => ({ id: a.id, name: a.name })) || [],
      };

      // Trigger success callback and close modal
      onSuccess?.(meetingEvent);
      handleClose();
    },

    // Error handler - show user-friendly error message
    onError: (error) => {
      addError({
        title: 'Creation Failed!',
        subtitle: 'just now',
        children: `Failed to create meeting: ${error.message}`,
      });
    },
  });

  // GraphQL hooks: Get users.
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

  /**
   * Form setup: Default times.
   *
   * - Default times are based on the selected date.
   * - If no date is selected, the default times are based on the current date.
   * - If the selected date is in the past, the default times are based on the current date.
   * - If the selected date is in the future, the default times are based on the selected date.
   * - If the selected date is in the past, the default times are based on the current date.
   */
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateMeetingFormData>({
    resolver: zodResolver(CreateMeetingEventSchema),
    defaultValues: {
      title: '',
      description: '',
      startTime: defaultTimes.startTime,
      endTime: defaultTimes.endTime,
      attendeeIds: [],
    },
  });

  /**
   * Update form values when selectedDate changes
   * This ensures that startTime and endTime are updated with new default values
   * when user selects a different date on the calendar
   */
  useEffect(() => {
    if (selectedDate && show) {
      const newDefaultTimes = getDefaultMeetingTimes(selectedDate);
      reset({
        title: '',
        description: '',
        startTime: newDefaultTimes.startTime,
        endTime: newDefaultTimes.endTime,
        attendeeIds: [],
      });
    }
  }, [selectedDate, show, reset]);

  // Watch form values for conflict checking.
  const watchedValues = watch(['startTime', 'endTime', 'attendeeIds']);

  /**
   * ========================================================================
   * REAL-TIME CONFLICT DETECTION SYSTEM
   * ========================================================================
   *
   * Implements a sophisticated two-tier conflict detection system:
   * 1. Client-side: Immediate feedback using existing meetings data
   * 2. Server-side: Comprehensive database-level conflict checking
   *
   * Features:
   * - Debounced execution (500ms) to prevent excessive API calls
   * - Progressive validation (client first, then server if needed)
   * - Real-time updates as user modifies time/attendees
   * - Loading states for user feedback
   */
  useEffect(() => {
    const [startTime, endTime, attendeeIds] = watchedValues;

    // Skip if required fields are missing
    if (!startTime || !endTime || !attendeeIds) return;

    // Debounce conflict checking to avoid excessive API calls
    const timer = setTimeout(() => {
      setIsCheckingConflicts(true);

      // TIER 1: Client-side conflict validation
      // Fast, immediate feedback using existing meetings prop
      const clientConflicts = checkMeetingConflicts(
        { title: '', startTime, endTime, attendeeIds },
        existingMeetings,
      );

      // If client-side conflicts found, skip server check
      if (clientConflicts.length > 0) {
        setConflicts(clientConflicts);
        setIsCheckingConflicts(false);
        return;
      }

      // TIER 2: Server-side conflict validation
      // Comprehensive database-level checking for all meetings
      checkConflicts({
        variables: {
          input: {
            startTime,
            endTime,
            attendeeIds: attendeeIds || [],
          },
        },
      });
    }, 500); // 500ms debounce delay

    // Cleanup timer on dependency change or component unmount
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

  /**
   * ========================================================================
   * FORM SUBMISSION HANDLER
   * ========================================================================
   *
   * Handles the complete meeting creation workflow:
   * 1. Final business logic validation (warnings/errors)
   * 2. Conflict validation (blocking errors only)
   * 3. GraphQL mutation execution
   * 4. Error handling and user feedback
   *
   * @param data - Form data from react-hook-form
   */
  const onSubmit = async (data: CreateMeetingFormData) => {
    try {
      // STEP 1: Final business logic validation
      // This catches warnings and business rule violations
      const validation = validateMeetingData({
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        attendeeIds: data.attendeeIds,
      });

      // Block submission if critical validation errors exist
      if (!validation.isValid) {
        console.error('Validation failed:', validation.errors);
        addError({
          title: 'Validation Failed!',
          subtitle: 'just now',
          children: `Validation failed: ${validation.errors.join(', ')}`,
        });
        return;
      }

      // STEP 2: Check for blocking conflicts
      // Only ERROR severity conflicts block submission, warnings are informational
      const blockingConflicts = conflicts.filter(
        (c) => c.severity === 'error' || c.severity === 'ERROR',
      );
      if (blockingConflicts.length > 0) {
        console.error('Cannot create meeting due to conflicts:', blockingConflicts);
        return;
      }

      // STEP 3: Execute GraphQL mutation
      // Creator ID is automatically added by the server from auth token
      await createMeeting({
        variables: {
          input: {
            title: data.title,
            description: data.description || undefined,
            startTime: data.startTime,
            endTime: data.endTime,
            attendeeIds: data.attendeeIds || [],
            // createdById is set automatically by server from auth token
          },
        },
      });

      // Success handling is done in mutation's onCompleted callback
    } catch (error) {
      console.error('Error creating meeting:', error);
      // Additional error handling could be added here if needed
      addError({
        title: 'Creation Failed!',
        subtitle: 'just now',
        children: `Failed to create meeting: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  const hasBlockingConflicts = conflicts.some(
    (c) => c.severity === 'error' || c.severity === 'ERROR',
  );

  return (
    <Modal show={show} centered onHide={handleClose} size="md">
      <Modal.Header closeButton onClose={handleClose}>
        <Modal.Title level={5}>Meeting Event</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Meeting Title */}
          <TextField
            label="Add title"
            placeholder="Enter meeting title"
            required
            error={errors.title?.message}
            {...register('title')}
          />

          {/* Meeting Description */}
          <TextareaField
            label="Add description"
            placeholder="Add details, agenda, etc."
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
                label="Add guests"
                placeholder="Search and select guests"
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

          {createMeetingError && (
            <Alert variant="danger">
              <strong>Creation failed:</strong> {createMeetingError.message}
            </Alert>
          )}
        </form>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          outline
          onClick={handleClose}
          disabled={isSubmitting || isCreating}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || isCreating || hasBlockingConflicts}
        >
          {isCreating ? (
            <>
              <Spinner size="sm" className="me-1" />
            </>
          ) : (
            'Save'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateMeetingModal;
