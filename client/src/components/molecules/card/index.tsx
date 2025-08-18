import React from 'react';

import {
  BaseComponentProps,
  BaseVariant,
  CardImagePosition,
  CardShadow,
  HeadingLevel,
} from '@/types/components-common';
import { buildClassNames, createVariantClass } from '@/utils/component';

export interface CardProps extends BaseComponentProps {
  shadow?: CardShadow;
}

export interface CardHeaderProps extends BaseComponentProps {
  variant?: BaseVariant;
}

export interface CardBodyProps extends BaseComponentProps {}

export interface CardFooterProps extends BaseComponentProps {
  variant?: BaseVariant;
}

export interface CardTitleProps extends BaseComponentProps {
  level?: HeadingLevel;
}

export interface CardTextProps extends BaseComponentProps {}

export interface CardImageProps {
  src: string;
  alt: string;
  position?: CardImagePosition;
  className?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

// Card Header
export const CardHeader: React.FC<CardHeaderProps> = ({ children, className, variant }) => {
  const variantClass = variant ? createVariantClass('bg', variant) : '';
  const classes = buildClassNames('card-header', variantClass, className);

  return <div className={classes}>{children}</div>;
};

// Card Body
export const CardBody: React.FC<CardBodyProps> = ({ children, className }) => {
  const classes = buildClassNames('card-body', className);
  return <div className={classes}>{children}</div>;
};

// Card Footer
export const CardFooter: React.FC<CardFooterProps> = ({ children, className, variant }) => {
  const variantClass = variant ? createVariantClass('bg', variant) : '';
  const classes = buildClassNames('card-footer', variantClass, className);

  return <div className={classes}>{children}</div>;
};

// Card Title
export const CardTitle: React.FC<CardTitleProps> = ({ children, className, level = 5 }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const classes = buildClassNames('card-title', className);

  return <Tag className={classes}>{children}</Tag>;
};

// Card Text
export const CardText: React.FC<CardTextProps> = ({ children, className }) => {
  const classes = buildClassNames('card-text', className);
  return <p className={classes}>{children}</p>;
};

// Card Image
export const CardImage: React.FC<CardImageProps> = ({
  src,
  alt,
  position = 'top',
  className,
  onError,
}) => {
  const classes = buildClassNames(`card-img-${position}`, className);

  return <img src={src} alt={alt} className={classes} onError={onError} />;
};

// Main Card Component with compound components
interface CardComponent extends React.FC<CardProps> {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
  Title: typeof CardTitle;
  Text: typeof CardText;
  Image: typeof CardImage;
}

// eslint-disable-next-line react/prop-types
const Card = (({ children, className, shadow = 'none' }) => {
  const shadowClass = shadow !== 'none' ? `shadow-${shadow}` : '';
  const classes = buildClassNames('card', shadowClass, className);

  return <div className={classes}>{children}</div>;
}) as CardComponent;

// Attach compound components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Title = CardTitle;
Card.Text = CardText;
Card.Image = CardImage;

export default Card;
