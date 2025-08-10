import React from 'react';

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
  const classes = [base, size ? `btn-${size}` : undefined, className]
    .filter(Boolean)
    .join(' ');

  if (isLink) {
    const {
      href: linkHref,
      variant: _variant,
      outline: _outline,
      size: _size,
      className: _className,
      children: _children,
      ...anchorProps
    } = props as ButtonAsLinkProps & CommonProps;
    return (
      <a href={linkHref} className={classes} {...anchorProps}>
        {children}
      </a>
    );
  }

  const {
    variant: _bVariant,
    outline: _bOutline,
    size: _bSize,
    className: _bClassName,
    children: _bChildren,
    href: _bHref,
    ...buttonProps
  } = props as ButtonAsButtonProps & CommonProps;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
