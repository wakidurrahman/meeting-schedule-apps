import { useMutation, useQuery } from '@apollo/client';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import Button from '@/components/atoms/button';
import Heading from '@/components/atoms/heading';
import SelectField from '@/components/atoms/select-field';
import Spinner from '@/components/atoms/spinner';
import Table from '@/components/molecules/table';
import BaseTemplate from '@/components/templates/base-templates';
import { BOOK_EVENT, CANCEL_BOOKING } from '@/graphql/mutations';
import { GET_BOOKINGS, GET_EVENTS, GET_USERS } from '@/graphql/queries';
import type { Booking } from '@/types/booking';

export default function BookingsPage(): JSX.Element {
  const { control, handleSubmit, watch, reset } = useForm<{ eventId: string }>({
    defaultValues: { eventId: '' },
  });

  const { data: eventsData, loading: eventsLoading } = useQuery(GET_EVENTS, {
    fetchPolicy: 'cache-and-network',
  });
  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS, {
    fetchPolicy: 'cache-and-network',
  });
  const {
    data: bookingsData,
    loading: bookingsLoading,
    refetch,
  } = useQuery(GET_BOOKINGS, {
    fetchPolicy: 'cache-and-network',
  });

  const [bookEvent, { loading }] = useMutation(BOOK_EVENT, {
    onCompleted: () => {
      refetch();
      reset();
    },
  });
  const [cancelBooking] = useMutation(CANCEL_BOOKING, { onCompleted: () => refetch() });

  const onSubmit = handleSubmit((values) => {
    if (!values.eventId) return;
    bookEvent({ variables: { eventId: values.eventId } });
  });

  const bookings: Booking[] = bookingsData?.bookings ?? [];

  return (
    <BaseTemplate>
      <div className="container py-3">
        <Heading level={2}>Event Bookings</Heading>
        <form className="row g-3 align-items-end mt-2" onSubmit={onSubmit}>
          <div className="col-sm-6 col-md-4">
            <Controller
              name="eventId"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="Select Event"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={[
                    { value: '', label: 'Choose…' },
                    ...(eventsData?.events ?? []).map(
                      (e: { id: string; title: string; date: string }) => ({
                        value: e.id,
                        label: `${e.title} (${new Date(e.date).toLocaleString()})`,
                      }),
                    ),
                  ]}
                />
              )}
            />
          </div>
          <div className="col-sm-6 col-md-4">
            <SelectField
              label="Users"
              value={''}
              disabled
              options={[{ value: '', label: `${usersData?.users?.length ?? 0} users fetched` }]}
            />
          </div>
          <div className="col-auto">
            <Button variant="primary" disabled={loading || !watch('eventId')} type="submit">
              Book
            </Button>
          </div>
        </form>

        <div className="mt-4">
          <Table
            columns={[
              { key: 'event', header: 'Event', render: (b) => `${b.event.title}` },
              { key: 'user', header: 'User', render: (b) => `${b.user.name}` },
              {
                key: 'createdAt',
                header: 'Created',
                render: (b) => new Date(b.createdAt).toLocaleString(),
              },
            ]}
            data={bookings}
            rowActions={(b) => [
              {
                label: 'Cancel',
                variant: 'danger',
                onClick: () => cancelBooking({ variables: { bookingId: b.id } }),
              },
            ]}
          />
          {(eventsLoading || usersLoading || bookingsLoading) && (
            <div className="py-3 d-flex justify-content-center">
              <Spinner />
            </div>
          )}
        </div>
      </div>
    </BaseTemplate>
  );
}
