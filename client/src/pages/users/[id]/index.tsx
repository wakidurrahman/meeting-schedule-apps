import { useMutation, useQuery } from '@apollo/client';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Alert from '@/components/atoms/alert';
import Badge from '@/components/atoms/badge';
import Breadcrumb from '@/components/atoms/breadcrumb';
import Button from '@/components/atoms/button';
import Heading from '@/components/atoms/heading';
import Text from '@/components/atoms/text';
import Card from '@/components/molecules/card';
import { UserCardSkeleton } from '@/components/molecules/skeleton';
import Modal from '@/components/organisms/modal';
import BaseTemplate from '@/components/templates/base-templates';
import { paths } from '@/constants/paths';
import { DELETE_USER, type DeleteUserData } from '@/graphql/user/mutations';
import { GET_USER, GET_USERS, type UserQueryData } from '@/graphql/user/queries';
import { useToast } from '@/hooks/use-toast';
import { formatJST } from '@/utils/date';

export default function UserDetailPage(): JSX.Element {
  const navigate = useNavigate();
  const params = useParams();
  const { addSuccess, addError } = useToast();
  const userId = params.id!;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch user data
  const {
    data,
    loading: loadingUser,
    error: userError,
  } = useQuery<UserQueryData, { id: string }>(GET_USER, {
    variables: { id: userId },
    skip: !userId,
  });

  // Delete user mutation
  const [deleteUser, { loading: deleting }] = useMutation<DeleteUserData, { id: string }>(
    DELETE_USER,
    {
      refetchQueries: [{ query: GET_USERS }],
      onCompleted: () => {
        addSuccess({
          title: 'User Deleted!',
          subtitle: 'just now',
          children: `User "${data?.user?.name}" deleted successfully!`,
        });
        setShowDeleteModal(false);
        navigate(paths.users || '/users');
      },
      onError: (error) => {
        addError({
          title: 'User Deletion Failed!',
          subtitle: 'just now',
          children: `Failed to delete user: ${error.message}`,
        });
        setShowDeleteModal(false);
      },
    },
  );

  const handleDelete = async () => {
    try {
      await deleteUser({ variables: { id: userId } });
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  // Prepare data for rendering
  const user = data?.user;
  const breadcrumbItems = user
    ? [
        { label: 'Users', href: paths.users || '/users' },
        { label: user.name, active: true },
      ]
    : [
        { label: 'Users', href: paths.users || '/users' },
        { label: 'User Details', active: true },
      ];

  return (
    <BaseTemplate>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            {/* Page Header */}
            <div className="mb-4">
              <Heading level={1}>User Details</Heading>
              <Text className="text-muted">View and manage user information.</Text>
            </div>

            {/* Loading State */}
            {loadingUser && (
              <div className="mb-4">
                <UserCardSkeleton />
              </div>
            )}

            {/* Error State */}
            {userError && (
              <div className="mb-4">
                <Alert variant="danger">
                  <strong>Error loading user:</strong> {userError.message}
                </Alert>
              </div>
            )}

            {/* User Not Found */}
            {!loadingUser && !userError && !user && (
              <div className="mb-4">
                <Alert variant="warning">
                  <strong>User not found</strong>
                  <br />
                  The user you&apos;re looking for doesn&apos;t exist or may have been deleted.
                </Alert>
              </div>
            )}

            {/* User Data */}
            {!loadingUser && !userError && user && (
              <Card shadow="sm" className="mb-4">
                {/* Profile Image */}
                {user.imageUrl ? (
                  <Card.Image
                    src={user.imageUrl}
                    alt={user.name}
                    position="top"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <Card.Image
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name ?? 'U')}&background=random`}
                    alt={user.name}
                    position="top"
                  />
                )}

                <Card.Body>
                  <Card.Title level={5}>{user.name}</Card.Title>
                  <Card.Text>
                    <strong>Email:</strong> {user.email}
                  </Card.Text>
                  <Card.Text>
                    <strong>Role:</strong>{' '}
                    <Badge variant={user.role === 'ADMIN' ? 'danger' : 'primary'} pill>
                      {user.role}
                    </Badge>
                  </Card.Text>
                  <Card.Text>
                    <strong>Address:</strong> {user.address || '-'}
                  </Card.Text>
                  <Card.Text>
                    <strong>Date of Birth:</strong>{' '}
                    {user.dob ? formatJST(user.dob, 'yyyy-MM-dd') : '-'}
                  </Card.Text>
                  <Card.Text className="text-muted">
                    <strong>Created:</strong> {formatJST(user.createdAt, 'yyyy-MM-dd HH:mm')}
                  </Card.Text>
                  <Card.Text className="text-muted">
                    <strong>Updated:</strong> {formatJST(user.updatedAt, 'yyyy-MM-dd HH:mm')}
                  </Card.Text>
                </Card.Body>

                <Card.Footer variant="light">
                  <div className="d-flex gap-2 justify-content-end">
                    <Button variant="primary" outline href={`/users/${userId}/edit`}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      outline
                      onClick={() => setShowDeleteModal(true)}
                      disabled={deleting}
                    >
                      Delete
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            )}

            {/* Breadcrumb Navigation */}
            <Breadcrumb items={breadcrumbItems} className="mb-3 mt-5" />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal - Only show if user exists */}
      {user && (
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
          backdrop="static"
        >
          <Modal.Header closeButton onClose={() => setShowDeleteModal(false)}>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Text className="mb-3">
              Are you sure you want to delete user <strong>{user.name}</strong>?
            </Text>
            <Alert variant="warning">
              <i className="bi bi-exclamation-triangle-fill me-2" />
              This action cannot be undone.
            </Alert>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete User'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </BaseTemplate>
  );
}
