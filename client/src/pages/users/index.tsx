import { useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import Alert from '@/components/atoms/alert';
import Button from '@/components/atoms/button';
import Heading from '@/components/atoms/heading';
import SelectField from '@/components/atoms/select-field';
import Spinner from '@/components/atoms/spinner';
import Text from '@/components/atoms/text';
import TextField from '@/components/atoms/text-field';
import Pagination from '@/components/molecules/pagination';
import Table from '@/components/molecules/table';
import BaseTemplate from '@/components/templates/base-templates';
import { paths } from '@/constants/paths';
import { GET_USERS, type UsersQueryData, type UsersQueryVars } from '@/graphql/user/queries';
import type { UserProfile } from '@/types/user';
import { UserSearchSchema } from '@/utils/validation';

interface UserSearchForm {
  search?: string;
  role?: 'ALL' | 'ADMIN' | 'USER';
  sortField?: 'NAME' | 'CREATED_AT' | 'UPDATED_AT';
  sortDirection?: 'ASC' | 'DESC';
  page?: number;
}

export default function UsersPage(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentSort, setCurrentSort] = useState<{
    field: 'NAME' | 'CREATED_AT' | 'UPDATED_AT';
    direction: 'ASC' | 'DESC';
  }>({
    field: 'NAME',
    direction: 'ASC',
  });

  // Form state for search and filters
  const { control, setValue } = useForm<UserSearchForm>({
    resolver: zodResolver(UserSearchSchema),
    defaultValues: {
      search: searchParams.get('search') || '',
      role: (searchParams.get('role') as 'ALL' | 'ADMIN' | 'USER') || 'ALL',
      sortField: (searchParams.get('sortField') as 'NAME' | 'CREATED_AT' | 'UPDATED_AT') || 'NAME',
      sortDirection: (searchParams.get('sortDirection') as 'ASC' | 'DESC') || 'ASC',
      page: parseInt(searchParams.get('page') || '1', 10),
    },
  });

  const formValues = useWatch({ control });
  const [page, setPage] = useState(formValues.page || 1);
  const [debouncedSearch, setDebouncedSearch] = useState(formValues.search || '');
  const limit = 10;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(formValues.search || '');
      setPage(1); // Reset to first page on search change
    }, 300);

    return () => clearTimeout(timer);
  }, [formValues.search]);

  // Build GraphQL variables
  const variables: UsersQueryVars = useMemo(() => {
    return {
      where: {
        search: debouncedSearch || undefined,
        role: formValues.role === 'ALL' ? undefined : formValues.role,
      },
      orderBy: {
        field: currentSort.field,
        direction: currentSort.direction,
      },
      pagination: {
        limit,
        offset: (page - 1) * limit,
      },
    };
  }, [debouncedSearch, formValues.role, currentSort, page]);

  // GraphQL query
  const { data, loading, error } = useQuery<UsersQueryData, UsersQueryVars>(GET_USERS, {
    variables,
    fetchPolicy: 'cache-and-network',
  });

  const users = useMemo(() => data?.users?.nodes ?? [], [data?.users?.nodes]);
  const total = useMemo(() => data?.users?.total ?? 0, [data?.users?.total]);
  const totalPages = Math.ceil(total / limit);

  // Update URL search params when form changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (formValues.role && formValues.role !== 'ALL') params.set('role', formValues.role);
    if (currentSort.field !== 'NAME') params.set('sortField', currentSort.field);
    if (currentSort.direction !== 'ASC') params.set('sortDirection', currentSort.direction);
    if (page !== 1) params.set('page', page.toString());
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, formValues.role, currentSort, page, setSearchParams]);

  // Handle sort by column header click
  const handleSort = useCallback((field: 'NAME' | 'CREATED_AT' | 'UPDATED_AT') => {
    setCurrentSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'ASC' ? 'DESC' : 'ASC',
    }));
    setPage(1); // Reset to first page on sort change
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Table configuration
  const columns = [
    {
      key: 'name' as keyof UserProfile,
      header: (
        <button
          type="button"
          className="btn btn-link p-0 text-decoration-none fw-bold"
          onClick={() => handleSort('NAME')}
        >
          Name{' '}
          {currentSort.field === 'NAME' && (
            <span>
              {currentSort.direction === 'ASC' ? (
                <i className="bi bi-arrow-up-short" />
              ) : (
                <i className="bi bi-arrow-down-short" />
              )}
            </span>
          )}
        </button>
      ),
    },
    { key: 'email' as keyof UserProfile, header: 'Email' },
    { key: 'role' as keyof UserProfile, header: 'Role' },
    {
      key: 'createdAt' as keyof UserProfile,
      header: (
        <button
          type="button"
          className="btn btn-link p-0 text-decoration-none fw-bold"
          onClick={() => handleSort('CREATED_AT')}
        >
          Created{' '}
          {currentSort.field === 'CREATED_AT' && (
            <span>{currentSort.direction === 'ASC' ? '↑' : '↓'}</span>
          )}
        </button>
      ),
      render: (user: UserProfile) => new Date(user.createdAt).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      label: 'View',
      variant: 'primary' as const,
      onClick: (user: UserProfile) => navigate(`/users/${user.id}`),
    },
    {
      label: 'Edit',
      variant: 'secondary' as const,
      onClick: (user: UserProfile) => navigate(`/users/${user.id}/edit`),
    },
  ];

  if (error) {
    return (
      <BaseTemplate>
        <div className="container">
          <Alert variant="danger" className="mb-4">
            Error loading users: {error.message}
          </Alert>
        </div>
      </BaseTemplate>
    );
  }

  return (
    <BaseTemplate>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Heading level={1}>Users Management</Heading>
          <Link to={paths.userCreate || '/users/create'}>
            <Button variant="primary">Create User</Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="row mb-4">
          <div className="col-md-6">
            <Controller
              name="search"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Search by name or email"
                  placeholder="Enter name or email..."
                />
              )}
            />
          </div>
          <div className="col-md-3">
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <SelectField
                  {...field}
                  label="Filter by role"
                  options={[
                    { value: 'ALL', label: 'All Roles' },
                    { value: 'ADMIN', label: 'Admin' },
                    { value: 'USER', label: 'User' },
                  ]}
                />
              )}
            />
          </div>
          <div className="col-md-3 d-flex align-items-end mb-3">
            <Button
              variant="primary"
              outline
              onClick={() => {
                setValue('search', '');
                setValue('role', 'ALL');
                setCurrentSort({ field: 'NAME', direction: 'ASC' });
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-3">
          <Text color="body" weight="medium">
            Showing {users.length} of {total} users
            {debouncedSearch && ` matching "${debouncedSearch}"`}
            {formValues.role && formValues.role !== 'ALL' && ` with role "${formValues.role}"`}
          </Text>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            <Spinner size="sm" />
          </div>
        )}

        {/* Table */}
        {!loading && (
          <>
            <Table data={users} columns={columns} actions={actions} />

            {totalPages > 1 && (
              <div className="d-flex justify-content-end mt-4">
                <Pagination
                  currentPage={page}
                  pageCount={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && users.length === 0 && (
          <div className="text-center py-5">
            <p className="text-muted">No users found.</p>
            {(debouncedSearch || (formValues.role && formValues.role !== 'ALL')) && (
              <Button
                variant="primary"
                outline
                onClick={() => {
                  setValue('search', '');
                  setValue('role', 'ALL');
                  setPage(1);
                }}
              >
                Clear filters to see all users
              </Button>
            )}
          </div>
        )}
      </div>
    </BaseTemplate>
  );
}
