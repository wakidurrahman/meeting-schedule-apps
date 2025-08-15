import { useMutation, useQuery } from '@apollo/client';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import Button from '@/components/atoms/button';
import Heading from '@/components/atoms/heading';
import TextField from '@/components/atoms/text-field';
import TextareaField from '@/components/atoms/textarea-field';
import BaseTemplate from '@/components/templates/base-templates';
import { UPDATE_EVENT } from '@/graphql/event/mutations';
import { GET_EVENT } from '@/graphql/event/queries';
import type { EventInput } from '@/types/event';

export default function EditEventPage(): JSX.Element {
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id as string;

  const { data } = useQuery(GET_EVENT, { variables: { id }, fetchPolicy: 'cache-and-network' });
  const { control, handleSubmit, reset } = useForm<EventInput>({
    defaultValues: { title: '', description: '', date: '', price: 0 },
  });

  React.useEffect(() => {
    const e = data?.event;
    if (e) {
      reset({
        title: e.title,
        description: e.description ?? '',
        date: e.date.slice(0, 16),
        price: e.price,
      });
    }
  }, [data, reset]);

  const [updateEvent, { loading }] = useMutation(UPDATE_EVENT, {
    onCompleted: () => navigate('/events'),
  });

  const onSubmit = handleSubmit((values) => updateEvent({ variables: { id, eventInput: values } }));

  return (
    <BaseTemplate>
      <div className="container py-3">
        <Heading level={2}>Edit Event</Heading>
        <form className="mt-3" onSubmit={onSubmit}>
          <Controller
            name="title"
            control={control}
            rules={{ required: 'Title is required' }}
            render={({ field, fieldState }) => (
              <TextField
                id="title"
                label="Title"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                required
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextareaField
                id="description"
                label="Description"
                value={field.value ?? ''}
                onChange={field.onChange}
              />
            )}
          />
          <div className="row g-3">
            <div className="col-sm-6">
              <Controller
                name="date"
                control={control}
                rules={{ required: 'Date is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    id="date"
                    type="datetime-local"
                    label="Date"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    required
                  />
                )}
              />
            </div>
            <div className="col-sm-6">
              <Controller
                name="price"
                control={control}
                rules={{ required: 'Price is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    id="price"
                    type="number"
                    label="Price"
                    value={String(field.value)}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    error={fieldState.error?.message}
                    required
                  />
                )}
              />
            </div>
          </div>
          <Button className="mt-2" variant="primary" disabled={loading} type="submit">
            Update
          </Button>
        </form>
      </div>
    </BaseTemplate>
  );
}
