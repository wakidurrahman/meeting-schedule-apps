/**
 * Feature: Products Page with AG Grid
 *
 * Displays products from DummyJSON API using AG Grid React
 * Features:
 * - Server-side pagination
 * - Sortable columns
 * - Filterable columns
 * - Resizable columns
 * - Product details view
 */

import { useQuery } from '@apollo/client';
import type { ColDef } from 'ag-grid-community';
import React, { useMemo, useState } from 'react';

import Alert from '@/components/atoms/alert';
import Button from '@/components/atoms/button';
import Heading from '@/components/atoms/heading';
import Spinner from '@/components/atoms/spinner';
import AgGridTable from '@/components/molecules/AgGridTable';
import BaseTemplate from '@/components/templates/base-templates';
import { GET_PRODUCTS, type ProductsQueryData, type ProductsQueryVars } from '@/graphql';
import type { Product } from '@/types/product';

export default function ProductsPage(): JSX.Element {
  const [page, setPage] = useState(0);
  const limit = 30;

  // GraphQL query for products
  const { data, loading, error, refetch } = useQuery<ProductsQueryData, ProductsQueryVars>(
    GET_PRODUCTS,
    {
      variables: {
        input: {
          limit,
          skip: page * limit,
        },
      },
      fetchPolicy: 'cache-and-network',
    },
  );

  // Column definitions for AG Grid
  const columnDefs = useMemo<ColDef<Product>[]>(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        width: 80,
        filter: 'agNumberColumnFilter',
      },
      {
        field: 'thumbnail',
        headerName: 'Image',
        width: 100,
        cellRenderer: (params: { value?: string; data?: Product }) => {
          if (!params.value) return null;
          return (
            <img
              src={params.value}
              alt={params.data?.title || 'Product'}
              style={{
                width: '50px',
                height: '50px',
                objectFit: 'cover',
                borderRadius: '4px',
              }}
            />
          );
        },
        filter: false,
        sortable: false,
      },
      {
        field: 'title',
        headerName: 'Title',
        flex: 1,
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'brand',
        headerName: 'Brand',
        width: 120,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'category',
        headerName: 'Category',
        width: 130,
        filter: 'agSetColumnFilter',
      },
      {
        field: 'price',
        headerName: 'Price',
        width: 100,
        valueFormatter: (params) => `$${params.value?.toFixed(2) || '0.00'}`,
        filter: 'agNumberColumnFilter',
      },
      {
        field: 'discountPercentage',
        headerName: 'Discount %',
        width: 120,
        valueFormatter: (params) => `${params.value?.toFixed(2) || '0'}%`,
        filter: 'agNumberColumnFilter',
      },
      {
        field: 'rating',
        headerName: 'Rating',
        width: 100,
        valueFormatter: (params) => `⭐ ${params.value?.toFixed(1) || '0'}`,
        filter: 'agNumberColumnFilter',
      },
      {
        field: 'stock',
        headerName: 'Stock',
        width: 100,
        filter: 'agNumberColumnFilter',
        cellStyle: (params) => {
          if (params.value <= 10) {
            return { color: 'red', fontWeight: 'bold' };
          }
          return null;
        },
      },
      {
        field: 'availabilityStatus',
        headerName: 'Status',
        width: 130,
        filter: 'agSetColumnFilter',
        cellStyle: (params) => {
          if (params.value === 'Low Stock') {
            return { color: 'orange' };
          }
          if (params.value === 'In Stock') {
            return { color: 'green' };
          }
          return null;
        },
      },
    ],
    [],
  );

  // Get products data
  const products = data?.products?.products || [];
  const total = data?.products?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <BaseTemplate>
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Heading variant="h1" className="mb-0">
            Products
          </Heading>
          <Button variant="secondary" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>

        {/* Info Bar */}
        <div className="mb-3">
          <Alert variant="info" className="mb-0">
            <strong>Data Source:</strong> DummyJSON API ({total} total products) | Page {page + 1}{' '}
            of {totalPages}
          </Alert>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="danger" className="mb-3">
            Error loading products: {error.message}
          </Alert>
        )}

        {/* Loading State */}
        {loading && products.length === 0 ? (
          <div className="text-center py-5">
            <Spinner />
            <p className="mt-3">Loading products...</p>
          </div>
        ) : (
          <>
            {/* AG Grid Table */}
            <div className="mb-4">
              <AgGridTable<Product>
                columnDefs={columnDefs}
                rowData={products}
                pagination={false}
                height="600px"
                loading={loading}
                theme="alpine"
              />
            </div>

            {/* Pagination Controls */}
            <div className="d-flex justify-content-between align-items-center">
              <div>
                Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total}{' '}
                products
              </div>
              <div className="btn-group">
                <Button
                  variant="outline-primary"
                  disabled={page === 0}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline-primary"
                  disabled={page >= totalPages - 1}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </BaseTemplate>
  );
}
