import React from 'react';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingProps = {
  level?: HeadingLevel;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<'h1'>, 'children' | 'className'>;

export default function Heading({
  level = 1,
  className,
  children,
  ...rest
}: HeadingProps) {
  const Tag = `h${level}` as unknown as keyof JSX.IntrinsicElements;
  return (
    <Tag className={className} {...(rest as any)}>
      {children}
    </Tag>
  );
}
