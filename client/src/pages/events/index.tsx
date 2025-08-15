import { useMutation, useQuery } from '@apollo/client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import CheckboxField from '@/components/atoms/checkbox-field';
import Heading from '@/components/atoms/heading';
import SelectField from '@/components/atoms/select-field';
import Spinner from '@/components/atoms/spinner';
import TextField from '@/components/atoms/text-field';
import Pagination from '@/components/molecules/pagination';
import Table from '@/components/molecules/table';
import BaseTemplate from '@/components/templates/base-templates';
import { paths } from '@/constants/paths';
import { useAuthContext } from '@/context/AuthContext';
import { DELETE_EVENT } from '@/graphql/event/mutations';
import { GET_EVENTS } from '@/graphql/event/queries';
import type { Event } from '@/types/event';

function computeDateRange(filter: string): { dateFrom?: string; dateTo?: string } | undefined {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  if (filter === 'today')
    return { dateFrom: startOfDay.toISOString(), dateTo: endOfDay.toISOString() };
  if (filter === 'upcoming') return { dateFrom: now.toISOString() };
  if (filter === 'past') return { dateTo: now.toISOString() };
  if (filter === 'this_week') {
    const day = now.getDay();
    const diffToMonday = (day + 6) % 7; // Monday as 0
    const start = new Date(startOfDay);
    start.setDate(start.getDate() - diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { dateFrom: start.toISOString(), dateTo: end.toISOString() };
  }
  if (filter === 'this_month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { dateFrom: start.toISOString(), dateTo: end.toISOString() };
  }
  return undefined;
}

export default function EventsPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { register, watch } = useForm<{ title: string }>();
  const [page, setPage] = React.useState(1);
  const [perPage] = React.useState(10);
  const [dateFilter, setDateFilter] = React.useState('all');
  const [createdByMe, setCreatedByMe] = React.useState(false);

  const dateRange = computeDateRange(dateFilter);
  const { data, loading, refetch } = useQuery(GET_EVENTS, {
    variables: {
      filter: {
        ...(createdByMe && user ? { createdById: user.id } : {}),
        ...(dateRange ?? {}),
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  const [deleteEvent] = useMutation(DELETE_EVENT, { onCompleted: () => refetch() });

  const titleFilter = (watch('title') || '').toLowerCase();
  const events: Event[] = (data?.events ?? []).filter((e: Event) =>
    e.title.toLowerCase().includes(titleFilter),
  );
  const pageCount = Math.max(1, Math.ceil(events.length / perPage));
  const rows = events.slice((page - 1) * perPage, page * perPage);

  return (
    <BaseTemplate>
      <div className="container py-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Heading level={2}>Events</Heading>
          <div className="d-flex gap-2">
            <Link to={paths.eventCreate} className="btn btn-primary btn-sm">
              Create Event
            </Link>
          </div>
        </div>
        <div className="row g-3 mb-3">
          <div className="col-sm-6 col-md-3">
            <SelectField
              label="Filter by date"
              value={dateFilter}
              onChange={(e) => {
                setPage(1);
                setDateFilter(e.target.value);
                refetch();
              }}
              options={[
                { value: 'all', label: 'All' },
                { value: 'today', label: 'Today' },
                { value: 'this_week', label: 'This Week' },
                { value: 'this_month', label: 'This Month' },
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'past', label: 'Past' },
              ]}
            />
          </div>
          <div className="col-sm-6 col-md-3">
            <TextField label="Search title" placeholder="e.g. Standup" {...register('title')} />
          </div>
          <div className="col-sm-6 col-md-3 d-flex align-items-end">
            <CheckboxField
              id="createdByMe"
              label="Created by me"
              checked={createdByMe}
              onChange={(e) => {
                setCreatedByMe(e.currentTarget.checked);
                setPage(1);
                refetch();
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="py-5 d-flex justify-content-center">
            <Spinner />
          </div>
        ) : (
          <>
            <Table
              columns={[
                { key: 'title', header: 'Title' },
                { key: 'description', header: 'Description' },
                { key: 'date', header: 'Date', render: (r) => new Date(r.date).toLocaleString() },
                { key: 'price', header: 'Price' },
                { key: 'createdBy', header: 'Created By', render: (r) => r.createdBy?.name },
              ]}
              data={rows}
              rowActions={(row) => [
                {
                  label: 'Edit',
                  variant: 'secondary',
                  onClick: () => navigate(`/events/${row.id}/edit`),
                },
                {
                  label: 'Delete',
                  variant: 'danger',
                  onClick: () => deleteEvent({ variables: { id: row.id } }),
                },
              ]}
            />
            <div className="d-flex justify-content-between align-items-center mt-2">
              <Pagination currentPage={page} pageCount={pageCount} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </BaseTemplate>
  );
}
