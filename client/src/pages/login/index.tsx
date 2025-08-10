import Button from '@/components/atoms/button';
import TextField from '@/components/atoms/text-field';
import BaseTemplate from '@/components/templates/base-templates';
import { useAuthContext } from '@/context/AuthContext';
import { LOGIN, type LoginMutationData } from '@/graphql/mutations';
import type { UserLoginInput } from '@/types/user';
import { useMutation } from '@apollo/client';
import { DevTool } from '@hookform/devtools';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

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
            <h2 className="mb-3">Login</h2>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
                Login
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
