import React from 'react';
import { Link, NavLink } from 'react-router-dom';

import LogoImage from '@/assets/images/logos/favicon-32x32.png';
import Image from '@/components/atoms/image';
import { NAV_PATHS, paths, pathsWithAuth, type NavPath } from '@/constants/paths';
import { useAuthContext } from '@/context/AuthContext';

/**
 * Header component
 */
export default function Header(): JSX.Element {
  // Get the current user (do not call hooks conditionally)
  const { isAuthenticated, logout, user } = useAuthContext();
  // Get the visible paths
  const visiblePaths = NAV_PATHS.filter((p: NavPath) => (isAuthenticated ? p.isAuth : !p.isAuth));
  return (
    <header>
      <nav className="navbar navbar-expand-lg shadow-sm">
        <div className="container">
          <Link to={paths.home} className="navbar-brand d-flex align-items-center">
            <Image
              src={LogoImage}
              loading="lazy"
              objectFit="contain"
              alt="Logo"
              width={32}
              height={32}
              className="d-inline-block align-text-top me-2"
            />
            X-Scheduler
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
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              {visiblePaths.map((p: NavPath) => (
                <li key={p.to} className="nav-item fs-6 fw-bold">
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
                  <button
                    type="button"
                    className="nav-link dropdown-toggle d-flex align-items-center btn btn-link"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.name?.[0] ?? 'U',
                      )}&background=random`}
                      alt="avatar"
                      width={24}
                      height={24}
                      className="rounded-circle me-2"
                    />
                    {user?.name ?? 'User'}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <NavLink
                        className={({ isActive }: { isActive: boolean }) =>
                          `dropdown-item${isActive ? ' active' : ''}`
                        }
                        to={pathsWithAuth.profile}
                        end
                      >
                        Profile
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
