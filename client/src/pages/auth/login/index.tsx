/**
 * Login Page – flow and state documentation
 *
 * Purpose
 * - Authenticate an existing user and establish an application session.
 *
 * Form + validation
 * - React Hook Form with Zod (`LoginSchema`).
 * - mode: 'onChange' for realtime validation; `shouldFocusError` focuses first invalid field.
 * - State used by UI: `errors`, `isSubmitting`.
 *
 * Transport (Apollo useMutation)
 * - Mutation: LOGIN with variables `{ input: { email, password } }`.
 * - On success: receive `{ token, user }` → store via `AuthContext.login`, show success toast, navigate `/`.
 * - On error: show error toast and inline `<Alert>`.
 * - `loading` disables inputs and submit button.
 *
 * Security & UX
 * - Token is attached by Apollo authLink on subsequent requests.
 * - Minimal layout with two fields and a primary action.
 * - RHF DevTool enabled only in non‑production for debugging.
 */
import { useMutation } from '@apollo/client';
import { DevTool } from '@hookform/devtools';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import LogoImage from '@/assets/images/logos/android-chrome-192x192.png';
import Alert from '@/components/atoms/alert';
import Button from '@/components/atoms/button';
import Image from '@/components/atoms/image';
import TextField from '@/components/atoms/text-field';
import Card from '@/components/molecules/card';
import BaseTemplate from '@/components/templates/base-templates';
import { ToastMessages as TM } from '@/constants/messages';
import { useAuthContext } from '@/context/AuthContext';
import { LOGIN, type LoginMutationData } from '@/graphql/auth/mutations';
import { useToast } from '@/hooks/use-toast';
import type { UserLoginInput } from '@/types/user';
import { LoginSchema } from '@/utils/validation';

export default function Login(): JSX.Element {
  const navigate = useNavigate();
  const { login: setAuth } = useAuthContext();
  // Toast
  const { addSuccess, addError } = useToast();
  // form values
  type FormValues = z.infer<typeof LoginSchema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(LoginSchema),
    mode: 'onChange', // validate on change
    criteriaMode: 'all', // validate all fields
    shouldFocusError: true, // focus on the first error
  });
  // Login mutation hook with Apollo Client
  const [loginMutation, { loading, error }] = useMutation<
    LoginMutationData,
    { input: UserLoginInput }
  >(LOGIN, {
    onCompleted: (data) => {
      const { token, user } = data.login;
      setAuth(token, user);
      addSuccess({
        title: TM.loginSuccessfulTitle,
        subtitle: TM.loginSuccessfulSubtitle,
        children: TM.loginSuccessfulChildren,
        autohide: true,
        delay: 3000,
      });
      navigate('/'); // navigate user to home page after successful login
    },
    onError: (error) => {
      addError({
        title: TM.loginFailedTitle,
        subtitle: TM.loginFailedSubtitle,
        children: error.message,
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    loginMutation({ variables: { input: values } });
  };

  return (
    <BaseTemplate>
      <div className="container">
        <div
          className="row justify-content-center align-items-center"
          style={{ minHeight: 'calc(100vh - 172px)' }}
        >
          <div className="col-12 col-sm-8 col-md-6 col-lg-5 col-xl-4">
            <Card className="border-0">
              <Card.Body>
                <Image
                  src={LogoImage}
                  loading="lazy"
                  width={80}
                  height={80}
                  alt="X-Scheduler Apps"
                  objectFit="contain"
                />
                <Card.Title level={4} className="mt-3">
                  Login
                </Card.Title>
                <Card.Text className="text-muted fs-6">
                  Welcome back! Please enter your email and password to sign in.
                </Card.Text>
                <hr className="my-3" />
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <TextField
                    type="email"
                    label="Email"
                    placeholder="Enter your email"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  <TextField
                    type="password"
                    label="Password"
                    placeholder="Enter your password"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  {error && <Alert variant="danger">{error.message}</Alert>}
                  <div className="d-flex justify-content-center mt-4">
                    <Button
                      type="submit"
                      className="w-100 shadow-sm"
                      variant="primary"
                      disabled={loading || isSubmitting}
                    >
                      {loading ? 'Loading...' : 'Sign In'}
                    </Button>
                  </div>
                </form>
                <hr className="my-4" />
                <div className="btn-group gap-2 w-100 justify-content-center">
                  <Link to="#" className="btn btn-outline-dark rounded-1" aria-current="page">
                    <i className="bi bi-google text-primary"></i>
                  </Link>
                  <Link to="#" className="btn btn-outline-dark rounded-1">
                    <i className="bi bi-facebook text-primary"></i>
                  </Link>
                  <Link to="#" className="btn btn-outline-dark rounded-1">
                    <i className="bi bi-apple text-primary"></i>
                  </Link>
                  <Link to="#" className="btn btn-outline-dark rounded-1">
                    <i className="bi bi-twitter text-primary"></i>
                  </Link>
                </div>
                <p className="text-muted text-center mt-4">
                  Don&apos;t have an account? <Link to="/register">Sign up</Link>
                </p>
                {process.env.NODE_ENV !== 'production' && <DevTool control={control} />}
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </BaseTemplate>
  );
}
