import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  ariaLabel?: string;
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  ariaLabel = 'breadcrumb',
  className = '',
}) => {
  return (
    <nav aria-label={ariaLabel} className={className}>
      <ol className="breadcrumb">
        {items.map((item, index) => (
          <li
            key={index}
            className={`breadcrumb-item ${item.active ? 'active' : ''}`}
            {...(item.active && { 'aria-current': 'page' })}
          >
            {item.active || !item.href ? (
              item.label
            ) : (
              <Link to={item.href} className="text-decoration-none">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
