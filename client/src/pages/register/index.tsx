import { useMutation } from '@apollo/client';
import { DevTool } from '@hookform/devtools';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import Alert from '@/components/atoms/alert';
import Button from '@/components/atoms/button';
import Heading from '@/components/atoms/heading';
import TextField from '@/components/atoms/text-field';
import BaseTemplate from '@/components/templates/base-templates';
import { REGISTER, type RegisterMutationData } from '@/graphql/mutations';
import type { UserRegisterInput } from '@/types/user';
import { registerSchema } from '@/utils/validation';

export default function Register(): JSX.Element {
  // navigate user to login page after successful registration
  const navigate = useNavigate();
  // Zod form values
  type FormValues = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    criteriaMode: 'all',
    shouldFocusError: true,
  });
  const [registerMutation, { loading, error }] = useMutation<
    RegisterMutationData,
    { input: UserRegisterInput }
  >(REGISTER, {
    onCompleted: () => {
      navigate('/login');
    },
  });

  const onSubmit = (values: FormValues) => {
    registerMutation({ variables: { input: values } });
  };

  return (
    <BaseTemplate>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <Heading level={5} className="mb-3">
                  Register
                </Heading>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <TextField
                    label="Name"
                    placeholder="Enter your name"
                    required
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <TextField
                    type="email"
                    label="Email"
                    placeholder="Enter your email"
                    required
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  <TextField
                    type="password"
                    label="Password"
                    placeholder="Enter your password"
                    required
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  {error && <Alert variant="danger">{error.message}</Alert>}
                  <div className="d-flex justify-content-center">
                    <Button type="submit" variant="primary" disabled={loading || isSubmitting}>
                      Create account
                    </Button>
                  </div>
                </form>
                {process.env.NODE_ENV !== 'production' && <DevTool control={control} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseTemplate>
  );
}
