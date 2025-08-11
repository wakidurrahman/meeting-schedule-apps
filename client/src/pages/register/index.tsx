/**
 * Register Page – end‑to‑end flow and state documentation
 *
 * Purpose
 * - Collect new user credentials and create an account through the "GraphQL API".
 *
 * Visual structure
 * - Card layout with three inputs: "name", "email", "password".
 * - Submit button centered; inline error alert shows server errors when present.
 *
 * Form state management (React Hook Form + Zod)
 * - useForm is configured with:
 *   - resolver: zodResolver(RegisterSchema) → schema validation for all fields
 *   - mode: 'onChange' → validate as the user types
 *   - criteriaMode: 'all' → collect all issues per field (not just first)
 *   - shouldFocusError: true → focus first invalid field on submit
 * - Derived state used by the UI:
 *   - errors: field‑level messages bound to inputs
 *   - isSubmitting: true while submit promise is in flight
 *   - isDirty / isValid: reflect current validation state for helper UI
 *
 * Transport (Apollo useMutation)
 * - Mutation: REGISTER
 * - Variables: { input: { name, email, password } }
 * - Loading: `loading` signals network in‑flight (disables inputs & button)
 * - Error: `error` from Apollo becomes an inline <Alert> and a toast
 *
 * Outcomes
 * - Success: toast “Registration Successful” then navigate → /login
 * - Failure: toast “Registration Failed” and keep user on the form
 *
 * Accessibility and UX
 * - Inputs use `error` props to render invalid styles and messages
 * - Submit button disabled while `loading || isSubmitting`
 * - Dev tools: RHF DevTool is rendered only in non‑production builds
 */
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
import { useToast } from '@/hooks/use-toast';
import type { UserRegisterInput } from '@/types/user';
import { RegisterSchema } from '@/utils/validation';

export default function Register(): JSX.Element {
  // Navigate user to login page after successful registration
  const navigate = useNavigate();
  // Toast
  const { addSuccess, addError } = useToast();
  // Zod form values
  type FormValues = z.infer<typeof RegisterSchema>;

  // RHF instance
  const {
    register, // RHF register function
    handleSubmit, // RHF handle submit function
    control, // RHF control function
    formState: { errors, isSubmitting, isDirty, isValid }, // RHF form state
  } = useForm<FormValues>({
    resolver: zodResolver(RegisterSchema),
    mode: 'onChange', // validate on change
    criteriaMode: 'all', // validate all fields
    shouldFocusError: true, // focus on the first error
  });
  // Register mutation hook with Apollo Client
  const [registerMutation, { loading, error }] = useMutation<
    RegisterMutationData,
    { input: UserRegisterInput }
  >(REGISTER, {
    onCompleted: () => {
      addSuccess({
        title: 'Registration Successful!',
        subtitle: 'just now',
        children: 'Account created successfully. Attempting auto-login...',
        autohide: true,
        delay: 3000,
      });
      navigate('/login');
    },
    onError: (error) => {
      addError({
        title: 'Registration Failed!',
        subtitle: 'just now',
        children: error.message,
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    console.log('register values', values);
    registerMutation({ variables: { input: values } });
  };

  return (
    <BaseTemplate>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            {/* Register card */}
            <div className="card">
              <div className="card-body">
                <Heading level={5} className="mb-3">
                  Register
                </Heading>
                {/* Register form */}
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <TextField
                    label="Name"
                    placeholder="Enter your name"
                    disabled={loading}
                    error={errors.name?.message}
                    helpText="Please enter your name"
                    {...register('name')}
                  />
                  <TextField
                    type="email"
                    label="Email"
                    placeholder="Enter your email"
                    disabled={loading}
                    error={errors.email?.message}
                    helpText="Please enter your email. Example email: zain@example.com"
                    isDirty={isDirty}
                    isValid={isValid}
                    {...register('email')}
                  />
                  <TextField
                    type="password"
                    label="Password"
                    placeholder="Enter your password"
                    disabled={loading}
                    error={errors.password?.message}
                    helpText="Example password base on the following: e.g. Zain123@, Min_123$"
                    {...register('password')}
                  />
                  {/* Error message from server state */}
                  {error && <Alert variant="danger">{error.message}</Alert>}
                  {/* Submit button */}
                  <div className="d-flex justify-content-center">
                    <Button type="submit" variant="primary" disabled={loading || isSubmitting}>
                      {loading ? 'Loading...' : 'Create account'}
                    </Button>
                  </div>
                </form>
                {/* DevTools */}
                {process.env.NODE_ENV !== 'production' && <DevTool control={control} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseTemplate>
  );
}
