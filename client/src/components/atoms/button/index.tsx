import React from 'react';
import { Link } from 'react-router-dom';

function omitProps<T extends Record<string, unknown>, K extends readonly (keyof T)[]>(
  obj: T,
  keys: K,
): Omit<T, K[number]> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!keys.includes(key as keyof T)) {
      result[key] = value;
    }
  }
  return result as Omit<T, K[number]>;
}

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark'
  | 'link';
type ButtonOutlineVariant = Exclude<ButtonVariant, 'link'>;
type ButtonSize = 'sm' | 'lg';

type CommonProps = {
  variant?: ButtonVariant;
  outline?: boolean;
  size?: ButtonSize;
  className?: string;
  children?: React.ReactNode;
};

type ButtonAsButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
    href?: undefined;
  };

type ButtonAsLinkProps = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> & {
    href: string;
  };

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export default function Button(props: ButtonProps): JSX.Element {
  const { variant = 'primary', outline, size, className, children } = props;
  const isLink = (props as ButtonAsLinkProps).href !== undefined;

  const base = outline
    ? `btn btn-outline-${variant as ButtonOutlineVariant}`
    : `btn btn-${variant}`;
  const classes = [base, size ? `btn-${size}` : undefined, className].filter(Boolean).join(' ');

  if (isLink) {
    const linkHref = (props as ButtonAsLinkProps).href;
    const anchorProps = omitProps(
      props as ButtonAsLinkProps & CommonProps,
      ['variant', 'outline', 'size', 'className', 'children', 'href'] as const,
    ) as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <Link to={linkHref} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = omitProps(
    props as ButtonAsButtonProps & CommonProps,
    ['variant', 'outline', 'size', 'className', 'children'] as const,
  ) as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
