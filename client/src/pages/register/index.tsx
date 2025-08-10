import Button from '@/components/atoms/button';
import TextField from '@/components/atoms/text-field';
import BaseTemplate from '@/components/templates/base-templates';
import { REGISTER, type RegisterMutationData } from '@/graphql/mutations';
import type { UserRegisterInput } from '@/types/user';
import { registerSchema } from '@/utils/validation';
import { useMutation } from '@apollo/client';
import { DevTool } from '@hookform/devtools';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

export default function Register(): JSX.Element {
  const navigate = useNavigate();

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
            <h2 className="mb-3">Register</h2>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                label="Name"
                required
                error={errors.name?.message}
                {...register('name')}
              />
              <TextField
                type="email"
                label="Email"
                required
                error={errors.email?.message}
                {...register('email')}
              />
              <TextField
                type="password"
                label="Password"
                required
                error={errors.password?.message}
                {...register('password')}
              />
              {error && (
                <div className="alert alert-danger">{error.message}</div>
              )}
              <Button
                type="submit"
                variant="primary"
                disabled={loading || isSubmitting}
              >
                Create account
              </Button>
            </form>
            {process.env.NODE_ENV !== 'production' && (
              <DevTool control={control} />
            )}
          </div>
        </div>
      </div>
    </BaseTemplate>
  );
}
