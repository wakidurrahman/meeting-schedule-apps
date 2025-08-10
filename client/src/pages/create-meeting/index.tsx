import Button from '@/components/atoms/button';
import SelectField from '@/components/atoms/select-field';
import TextField from '@/components/atoms/text-field';
import TextareaField from '@/components/atoms/textarea-field';
import BaseTemplate from '@/components/templates/base-templates';
import {
  CREATE_MEETING,
  type CreateMeetingMutationData,
  type CreateMeetingMutationVariables,
} from '@/graphql/mutations';
import { GET_USERS, type UsersQueryData } from '@/graphql/queries';
import { useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

const isValidObjectId = (value: string): boolean =>
  /^[0-9a-fA-F]{24}$/.test(value);

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startTime: z.string().min(1, 'Start time is required'), // datetime-local string
  endTime: z.string().min(1, 'End time is required'), // datetime-local string
  attendeeId: z
    .string()
    .optional()
    .refine((val) => !val || isValidObjectId(val), 'Invalid attendee'),
});

type FormValues = z.infer<typeof schema>;

export default function CreateMeeting(): JSX.Element {
  const navigate = useNavigate();
  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
  } = useQuery<UsersQueryData>(GET_USERS);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const [createMeeting, { loading, error }] = useMutation<
    CreateMeetingMutationData,
    CreateMeetingMutationVariables
  >(CREATE_MEETING, {
    onCompleted: () => navigate('/'),
  });

  const toIsoString = (value: string): string => {
    // Convert from input type="datetime-local" (local time) to ISO string
    // If value already ISO, new Date handles it
    const date = new Date(value);
    return date.toISOString();
  };

  const onSubmit = (values: FormValues) => {
    const attendeeIds = values.attendeeId ? [values.attendeeId] : [];
    return createMeeting({
      variables: {
        input: {
          title: values.title,
          description: values.description ?? null,
          startTime: toIsoString(values.startTime),
          endTime: toIsoString(values.endTime),
          attendeeIds,
        },
      },
    });
  };

  const userOptions = (usersData?.users ?? []).map((u) => ({
    value: u.id,
    label: u.name,
  }));

  // Attendees are managed by React Hook Form via attendeeId select

  return (
    <BaseTemplate>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <h2 className="mb-3">Create Meeting</h2>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                label="Title"
                required
                error={errors.title?.message}
                {...register('title')}
              />

              <TextareaField
                label="Description"
                rows={3}
                {...register('description')}
              />

              <div className="row">
                <div className="col-md-6">
                  <TextField
                    type="datetime-local"
                    label="Start time"
                    required
                    error={errors.startTime?.message}
                    {...register('startTime')}
                  />
                </div>
                <div className="col-md-6">
                  <TextField
                    type="datetime-local"
                    label="End time"
                    required
                    error={errors.endTime?.message}
                    {...register('endTime')}
                  />
                </div>
              </div>

              <Controller
                name="attendeeId"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Attendee (optional)"
                    error={errors.attendeeId?.message}
                    disabled={usersLoading}
                    options={[
                      {
                        value: '',
                        label: usersLoading ? 'Loading…' : 'Select a user',
                      },
                      ...userOptions,
                    ]}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />
              {usersError && (
                <div className="text-danger small mt-2">
                  Failed to load users
                </div>
              )}

              {error && (
                <div className="alert alert-danger">{error.message}</div>
              )}

              <div className="d-flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || isSubmitting}
                >
                  Create
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  outline
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </BaseTemplate>
  );
}
