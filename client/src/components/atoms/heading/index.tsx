import React from 'react';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingProps = {
  level?: HeadingLevel;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<'h1'>, 'children' | 'className'>;

/**
 * Heading component
 * @param props - The props for the heading
 * @returns The heading component
 */
const Heading: React.FC<HeadingProps> = ({ level = 1, className, children, ...rest }) => {
  const finalTag = `h${level}` as unknown as keyof JSX.IntrinsicElements;
  return React.createElement(finalTag, { className, ...rest }, children);
};

export default Heading;
