import { useMutation, useQuery } from '@apollo/client';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Alert from '@/components/atoms/alert';
import Button from '@/components/atoms/button';
import Heading from '@/components/atoms/heading';
import Spinner from '@/components/atoms/spinner';
import Text from '@/components/atoms/text';
import BaseTemplate from '@/components/templates/base-templates';
import { paths } from '@/constants/paths';
import { DELETE_USER, type DeleteUserData } from '@/graphql/user/mutations';
import { GET_USER, GET_USERS, type UserQueryData } from '@/graphql/user/queries';
import { useToast } from '@/hooks/use-toast';

export default function UserDetailPage(): JSX.Element {
  const navigate = useNavigate();
  const params = useParams();
  const { showToast } = useToast();
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
        showToast({
          type: 'success',
          message: `User "${data?.user?.name}" deleted successfully!`,
        });
        navigate(paths.users || '/users');
      },
      onError: (error) => {
        showToast({
          type: 'error',
          message: `Failed to delete user: ${error.message}`,
        });
      },
    },
  );

  const handleDelete = async () => {
    try {
      await deleteUser({ variables: { id: userId } });
    } catch (err) {
      console.error('Error deleting user:', err);
    } finally {
      setShowDeleteModal(false);
    }
  };

  if (loadingUser) {
    return (
      <BaseTemplate>
        <div className="container-fluid">
          <div className="text-center py-5">
            <Spinner />
            <p className="mt-2">Loading user details...</p>
          </div>
        </div>
      </BaseTemplate>
    );
  }

  if (userError) {
    return (
      <BaseTemplate>
        <div className="container-fluid">
          <Alert type="error">Error loading user: {userError.message}</Alert>
        </div>
      </BaseTemplate>
    );
  }

  if (!data?.user) {
    return (
      <BaseTemplate>
        <div className="container-fluid">
          <Alert type="error">User not found</Alert>
        </div>
      </BaseTemplate>
    );
  }

  const user = data.user;

  return (
    <BaseTemplate>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <Heading level={1}>User Details</Heading>
                <Text className="text-muted">View and manage user information</Text>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  onClick={() => navigate(`/users/${userId}/edit`)}
                  disabled={deleting}
                >
                  Edit
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={deleting}
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* User Card */}
            <div className="card">
              <div className="card-body">
                <div className="row">
                  {/* Profile Image */}
                  {user.imageUrl && (
                    <div className="col-md-4 text-center mb-3">
                      <img
                        src={user.imageUrl}
                        alt={user.name}
                        className="img-fluid rounded-circle"
                        style={{ maxWidth: '150px', maxHeight: '150px' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* User Information */}
                  <div className={user.imageUrl ? 'col-md-8' : 'col-12'}>
                    <div className="row g-3">
                      <div className="col-12">
                        <strong>Name:</strong>
                        <br />
                        <Text>{user.name}</Text>
                      </div>

                      <div className="col-12">
                        <strong>Email:</strong>
                        <br />
                        <Text>
                          <a href={`mailto:${user.email}`} className="text-decoration-none">
                            {user.email}
                          </a>
                        </Text>
                      </div>

                      <div className="col-12">
                        <strong>Role:</strong>
                        <br />
                        <span
                          className={`badge ${user.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}
                        >
                          {user.role}
                        </span>
                      </div>

                      {user.address && (
                        <div className="col-12">
                          <strong>Address:</strong>
                          <br />
                          <Text>{user.address}</Text>
                        </div>
                      )}

                      {user.dob && (
                        <div className="col-12">
                          <strong>Date of Birth:</strong>
                          <br />
                          <Text>{new Date(user.dob).toLocaleDateString()}</Text>
                        </div>
                      )}

                      <div className="col-sm-6">
                        <strong>Created:</strong>
                        <br />
                        <Text className="text-muted">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Text>
                      </div>

                      <div className="col-sm-6">
                        <strong>Last Updated:</strong>
                        <br />
                        <Text className="text-muted">
                          {new Date(user.updatedAt).toLocaleDateString()}
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-4">
              <Button variant="outline-secondary" onClick={() => navigate(paths.users || '/users')}>
                ← Back to Users
              </Button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div
            className="modal show d-block"
            tabIndex={-1}
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleting}
                  />
                </div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to delete user <strong>{user.name}</strong>?
                  </p>
                  <p className="text-danger">This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
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
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseTemplate>
  );
}
