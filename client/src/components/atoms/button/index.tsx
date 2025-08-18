import React from 'react';
import { Link } from 'react-router-dom';

import {
  ButtonVariant,
  ComponentSize,
  SizeComponentProps,
  VariantComponentProps,
} from '@/types/components-common';
import { createButtonClasses, omitProps } from '@/utils/components-helper';

type ButtonSize = Exclude<ComponentSize, 'md'>; // Buttons only support sm and lg

type CommonProps = VariantComponentProps<ButtonVariant> &
  SizeComponentProps & {
    outline?: boolean; // Whether the button is an outline button
    size?: ButtonSize; // The size of the button
  };

// Button as button props
type ButtonAsButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
    href?: undefined;
  };

// Button as link props
type ButtonAsLinkProps = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> & {
    href: string;
  };

// Button props
export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

/**
 * Button component
 * @param props - The props for the button
 * @returns The button component
 */
const Button: React.FC<ButtonProps> = (props) => {
  const { variant = 'primary', outline, size, className, children } = props;
  const isLink = (props as ButtonAsLinkProps).href !== undefined;

  // The class name of the button
  const classes = createButtonClasses(variant, outline, size, className);

  // If the button is a link, return a link component
  if (isLink) {
    const linkHref = (props as ButtonAsLinkProps).href;

    // The props for the link component
    const anchorProps = omitProps(
      props as Record<string, unknown>,
      ['variant', 'outline', 'size', 'className', 'children', 'href'] as const,
    ) as React.AnchorHTMLAttributes<HTMLAnchorElement>;

    // Return the link component
    return (
      <Link to={linkHref} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  // The props for the button component
  const buttonProps = omitProps(
    props as Record<string, unknown>,
    ['variant', 'outline', 'size', 'className', 'children'] as const,
  ) as React.ButtonHTMLAttributes<HTMLButtonElement>;

  // Return the button component
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
};

export default Button;
