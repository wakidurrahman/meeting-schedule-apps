import Pagination from '@/components/molecules/pagination';
import Table from '@/components/molecules/table';
import BaseTemplate from '@/components/templates/base-templates';
import { GET_USERS, type UsersQueryData } from '@/graphql/queries';
import { useQuery } from '@apollo/client';
import React, { useMemo, useState } from 'react';

export default function UsersPage(): JSX.Element {
  const { data } = useQuery<UsersQueryData>(GET_USERS);
  const users = data?.users ?? [];
  const [page, setPage] = useState(1);
  const pageSize = 5; // controlled here (can be lifted to parent later)
  const pageCount = Math.max(1, Math.ceil(users.length / pageSize));
  const current = useMemo(() => {
    const start = (page - 1) * pageSize;
    return users.slice(start, start + pageSize);
  }, [users, page]);

  return (
    <BaseTemplate>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Users</h2>
        </div>

        <Table
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'email', header: 'Email' },
          ]}
          data={current}
          actions={[
            { label: 'Edit', variant: 'secondary' },
            { label: 'Delete', variant: 'danger' },
          ]}
        />

        <div className="mt-3">
          <Pagination
            currentPage={page}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </div>
      </div>
    </BaseTemplate>
  );
}
