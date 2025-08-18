import React from 'react';

import { BaseComponentProps, TextColor } from '@/types/components-common';
import { buildClassNames } from '@/utils/components-helper';

type TextAlign = 'start' | 'center' | 'end';
type TextTransform = 'lowercase' | 'uppercase' | 'capitalize';
type TextWeight = 'lighter' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'bolder';
type ExtendedTextColor = TextColor | 'body';

export type TextProps<T extends keyof JSX.IntrinsicElements = 'p'> = BaseComponentProps & {
  as?: T;
  align?: TextAlign;
  transform?: TextTransform;
  weight?: TextWeight;
  color?: ExtendedTextColor;
  truncate?: boolean;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

/**
 * Text component
 * @param props - The props for the text
 * @returns The text component
 */
export default function Text<T extends keyof JSX.IntrinsicElements = 'p'>(
  props: TextProps<T>,
): JSX.Element {
  const { as, align, transform, weight, color, truncate, className, children, ...rest } =
    props as TextProps;

  const Element = (as || 'p') as keyof JSX.IntrinsicElements;
  const classes = buildClassNames(
    className,
    align ? `text-${align}` : undefined,
    transform ? `text-${transform}` : undefined,
    weight ? `fw-${weight}` : undefined,
    color ? (color === 'body' ? 'text-body' : `text-${color}`) : undefined,
    truncate ? 'text-truncate' : undefined,
  );

  return (
    <Element className={classes} {...(rest as Record<string, unknown>)}>
      {children}
    </Element>
  );
}
