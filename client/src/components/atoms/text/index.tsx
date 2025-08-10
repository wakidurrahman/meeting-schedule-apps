import React from 'react';

type TextAlign = 'start' | 'center' | 'end';
type TextTransform = 'lowercase' | 'uppercase' | 'capitalize';
type TextWeight =
  | 'lighter'
  | 'light'
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'bolder';
type TextColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'light'
  | 'dark'
  | 'body';

export type TextProps<T extends keyof JSX.IntrinsicElements = 'p'> = {
  as?: T;
  align?: TextAlign;
  transform?: TextTransform;
  weight?: TextWeight;
  color?: TextColor;
  truncate?: boolean;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

export default function Text<T extends keyof JSX.IntrinsicElements = 'p'>(
  props: TextProps<T>
): JSX.Element {
  const {
    as,
    align,
    transform,
    weight,
    color,
    truncate,
    className,
    children,
    ...rest
  } = props as TextProps;

  const Element = (as || 'p') as any;
  const classes = [
    className,
    align ? `text-${align}` : undefined,
    transform ? `text-${transform}` : undefined,
    weight ? `fw-${weight}` : undefined,
    color ? (color === 'body' ? 'text-body' : `text-${color}`) : undefined,
    truncate ? 'text-truncate' : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Element className={classes} {...(rest as any)}>
      {children}
    </Element>
  );
}
