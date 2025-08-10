import Button from '@/components/atoms/button';
import TextField from '@/components/atoms/text-field';
import BaseTemplate from '@/components/templates/base-templates';
import { useAuthContext, useAuthUser } from '@/context/AuthContext';
import React, { useMemo, useRef, useState } from 'react';

export default function Profile(): JSX.Element {
  const authUser = useAuthUser();
  const { logout } = useAuthContext();
  const [name, setName] = useState(authUser.name);
  const [email] = useState(authUser.email);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const avatarUrl = useMemo(() => {
    // Placeholder avatar using first letter
    const letter = (authUser.name || 'U').charAt(0).toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      letter
    )}&background=random`;
  }, [authUser.name]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // TODO: Wire to backend mutation when available
    await new Promise((r) => setTimeout(r, 600));
    setIsSaving(false);
    setMessage('Profile updated (local only for now)');
  };

  const onUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setMessage(`Selected file: ${file.name} (upload wiring pending)`);
  };

  const onDelete = async () => {
    // TODO: Wire delete account when available
    setMessage('Delete profile not yet implemented');
  };

  return (
    <BaseTemplate>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <h2 className="mb-3">Your Profile</h2>
            <div className="d-flex align-items-center gap-3 mb-3">
              <img
                src={avatarUrl}
                alt="Avatar"
                width={64}
                height={64}
                className="rounded-circle border"
              />
              <div>
                <div className="small text-muted">Logged in as</div>
                <div>{authUser.email}</div>
              </div>
            </div>

            <form onSubmit={onSave} noValidate>
              <TextField
                label="Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField label="Email" value={email} readOnly disabled />

              <div className="mb-3">
                <label className="form-label">Profile picture</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={onUpload}
                />
              </div>

              {message && (
                <div className="alert alert-info py-2 small">{message}</div>
              )}

              <div className="d-flex gap-2">
                <Button type="submit" variant="primary" disabled={isSaving}>
                  Save changes
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  outline
                  onClick={onDelete}
                >
                  Delete profile
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  outline
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </BaseTemplate>
  );
}
