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
import { useAuthContext } from '@/context/AuthContext';
import { LOGIN, type LoginMutationData } from '@/graphql/mutations';
import type { UserLoginInput } from '@/types/user';

export default function Login(): JSX.Element {
  const navigate = useNavigate();
  const { login: setAuth } = useAuthContext();

  const schema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    criteriaMode: 'all',
    shouldFocusError: true,
  });
  const [loginMutation, { loading, error }] = useMutation<
    LoginMutationData,
    { input: UserLoginInput }
  >(LOGIN, {
    onCompleted: (data) => {
      const { token, user } = data.login;
      setAuth(token, user);
      navigate('/');
    },
  });

  const onSubmit = (values: FormValues) => {
    loginMutation({ variables: { input: values } });
  };

  return (
    <BaseTemplate>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <Heading level={5} className="mb-3">
                  Login
                </Heading>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
                      Login
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
