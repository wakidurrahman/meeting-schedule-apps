import { NAV_PATHS, paths, type NavPath } from '@/constants/paths';
import { useAuthContext } from '@/context/AuthContext';
import React from 'react';
import { Link, NavLink } from 'react-router-dom';

/**
 * Header component
 */
export default function Header(): JSX.Element {
  // Get the current user (do not call hooks conditionally)
  const { isAuthenticated, logout, user } = useAuthContext();
  // Get the visible paths
  const visiblePaths = NAV_PATHS.filter((p: NavPath) =>
    isAuthenticated ? p.isAuth : !p.isAuth
  );
  return (
    <header>
      <nav className="navbar navbar-expand-lg bg-body-tertiary mb-4">
        <div className="container">
          <Link
            to={paths.home}
            className="navbar-brand d-flex align-items-center"
          >
            <img
              src="https://getbootstrap.com/docs/5.3/assets/brand/bootstrap-logo.svg"
              alt="Logo"
              width={30}
              height={24}
              className="d-inline-block align-text-top me-2"
            />
            Meeting
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {visiblePaths.map((p: NavPath) => (
                <li key={p.to} className="nav-item">
                  <NavLink
                    to={p.to}
                    end={p.to === paths.home}
                    className={({ isActive }: { isActive: boolean }) =>
                      `nav-link${isActive ? ' active' : ''}`
                    }
                    aria-current={undefined}
                  >
                    {p.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {isAuthenticated && (
              <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle d-flex align-items-center"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.name?.[0] ?? 'U'
                      )}&background=random`}
                      alt="avatar"
                      width={24}
                      height={24}
                      className="rounded-circle me-2"
                    />
                    {user?.name ?? 'User'}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <NavLink
                        className={({ isActive }: { isActive: boolean }) =>
                          `dropdown-item${isActive ? ' active' : ''}`
                        }
                        to={paths.profile}
                        end
                      >
                        Profile
                      </NavLink>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <NavLink
                        className={({ isActive }: { isActive: boolean }) =>
                          `dropdown-item${isActive ? ' active' : ''}`
                        }
                        to={paths.createMeeting}
                        end
                      >
                        Create Meeting
                      </NavLink>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={logout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
