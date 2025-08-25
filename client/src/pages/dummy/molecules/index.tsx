import React, { useState } from 'react';

// Import your actual molecular components

// Import atomic components for demos
import Alert from '@/components/atoms/alert';
import Badge from '@/components/atoms/badge';
import Button from '@/components/atoms/button';
import Heading from '@/components/atoms/heading';
import Text from '@/components/atoms/text';
import Card from '@/components/molecules/card';
import Pagination from '@/components/molecules/pagination';
import Table from '@/components/molecules/table';

/**
 * Molecules Demo Page
 * Showcases your actual molecular components
 */
export default function MoleculesDemo(): JSX.Element {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Sample data for your Table component
  const tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Active', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Inactive', role: 'User' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'Active', role: 'Moderator' },
  ];

  // Column configuration for your Table component
  const tableColumns = [
    { key: 'id' as keyof (typeof tableData)[0], header: 'ID' },
    { key: 'name' as keyof (typeof tableData)[0], header: 'Name' },
    { key: 'email' as keyof (typeof tableData)[0], header: 'Email' },
    {
      key: 'status' as keyof (typeof tableData)[0],
      header: 'Status',
      render: (row: (typeof tableData)[0]) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'secondary'}>{row.status}</Badge>
      ),
    },
    { key: 'role' as keyof (typeof tableData)[0], header: 'Role' },
  ];

  // Row actions for your Table component
  const rowActions = (row: (typeof tableData)[0]) => [
    { label: 'Edit', variant: 'primary' as const, onClick: () => console.log('Edit', row) },
    { label: 'Delete', variant: 'danger' as const, onClick: () => console.log('Delete', row) },
  ];

  const toggleLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="container py-5">
      <Heading level={1} className="mb-4">
        Molecules Demo
      </Heading>
      <Text color="secondary" className="mb-5">
        Showcasing your actual molecular components (combinations of atoms)
      </Text>

      {/* Card Component Demo */}
      <section className="mb-5">
        <Heading level={2} className="mb-3">
          Card Component
        </Heading>
        <Alert variant="info" className="mb-3">
          <strong>Your Card Component:</strong> A flexible container with Header, Body, and Footer
          subcomponents.
        </Alert>

        <div className="row g-4">
          {/* Basic Card */}
          <div className="col-md-4">
            <Card>
              <Card.Header>
                <Heading level={4} className="mb-0">
                  Basic Card
                </Heading>
              </Card.Header>
              <Card.Body>
                <Text className="mb-3">
                  This is your Card component with Header and Body sections.
                </Text>
                <Button variant="primary" size="sm">
                  Action
                </Button>
              </Card.Body>
            </Card>
          </div>

          {/* Card with Footer */}
          <div className="col-md-4">
            <Card>
              <Card.Header>
                <Heading level={4} className="mb-0">
                  Card with Footer
                </Heading>
              </Card.Header>
              <Card.Body>
                <Text className="mb-3">
                  Your Card component supports Header, Body, and Footer sections.
                </Text>
              </Card.Body>
              <Card.Footer className="text-muted">
                <small>Card footer content</small>
              </Card.Footer>
            </Card>
          </div>

          {/* Card with Custom Classes */}
          <div className="col-md-4">
            <Card className="border-primary">
              <Card.Body className="text-center">
                <Heading level={4} className="mb-3">
                  Custom Card
                </Heading>
                <Text className="mb-3">Your Card accepts custom className props for styling.</Text>
                <Button variant="outline-primary" size="sm">
                  Learn More
                </Button>
              </Card.Body>
            </Card>
          </div>
        </div>
      </section>

      {/* Table Component Demo */}
      <section className="mb-5">
        <Heading level={2} className="mb-3">
          Table Component
        </Heading>
        <Alert variant="success" className="mb-3">
          <strong>Your Table Component:</strong> A powerful data table with loading states, actions,
          and custom renderers.
        </Alert>

        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <Heading level={4} className="mb-0">
                Table Demo
              </Heading>
              <Button variant="outline-primary" size="sm" onClick={toggleLoading}>
                {loading ? 'Loading...' : 'Toggle Loading'}
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <Table
              columns={tableColumns}
              data={tableData}
              rowActions={rowActions}
              loading={loading}
              skeletonRows={3}
            />
          </Card.Body>
        </Card>

        <Card className="mt-4">
          <Card.Header>
            <Heading level={5} className="mb-0">
              Table Features
            </Heading>
          </Card.Header>
          <Card.Body>
            <div className="row g-3">
              <div className="col-md-6">
                <Text weight="bold" className="mb-2">
                  Props:
                </Text>
                <ul className="small">
                  <li>columns (with custom render)</li>
                  <li>data</li>
                  <li>rowActions function</li>
                  <li>loading state</li>
                  <li>skeletonRows count</li>
                </ul>
              </div>
              <div className="col-md-6">
                <Text weight="bold" className="mb-2">
                  Features:
                </Text>
                <ul className="small">
                  <li>Loading skeleton animation</li>
                  <li>Custom cell renderers</li>
                  <li>Row actions with variants</li>
                  <li>Empty state handling</li>
                  <li>Responsive table wrapper</li>
                </ul>
              </div>
            </div>
          </Card.Body>
        </Card>
      </section>

      {/* Pagination Component Demo */}
      <section className="mb-5">
        <Heading level={2} className="mb-3">
          Pagination Component
        </Heading>
        <Alert variant="warning" className="mb-3">
          <strong>Your Pagination Component:</strong> Navigation component for paginated data with
          proper accessibility.
        </Alert>

        <Card>
          <Card.Header>
            <Heading level={4} className="mb-0">
              Pagination Demo
            </Heading>
          </Card.Header>
          <Card.Body>
            <Text className="mb-4">
              Current page: <Badge variant="primary">{currentPage}</Badge>
            </Text>

            <div className="d-flex justify-content-center">
              <Pagination
                currentPage={currentPage}
                pageCount={5}
                onPageChange={setCurrentPage}
                ariaLabel="Demo pagination"
              />
            </div>
          </Card.Body>
        </Card>

        <Card className="mt-4">
          <Card.Header>
            <Heading level={5} className="mb-0">
              Pagination Features
            </Heading>
          </Card.Header>
          <Card.Body>
            <div className="row g-3">
              <div className="col-md-6">
                <Text weight="bold" className="mb-2">
                  Props:
                </Text>
                <ul className="small">
                  <li>currentPage</li>
                  <li>pageCount</li>
                  <li>onPageChange callback</li>
                  <li>ariaLabel for accessibility</li>
                </ul>
              </div>
              <div className="col-md-6">
                <Text weight="bold" className="mb-2">
                  Features:
                </Text>
                <ul className="small">
                  <li>Previous/Next navigation</li>
                  <li>Direct page selection</li>
                  <li>Disabled state handling</li>
                  <li>ARIA accessibility support</li>
                  <li>Automatic bounds checking</li>
                </ul>
              </div>
            </div>
          </Card.Body>
        </Card>
      </section>
    </div>
  );
}
