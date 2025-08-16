import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  shadow?: 'none' | 'sm' | 'lg';
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'primary' | 'secondary';
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'primary' | 'secondary';
}

export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface CardTextProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardImageProps {
  src: string;
  alt: string;
  position?: 'top' | 'bottom';
  className?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

// Card Header
export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '', variant }) => {
  const variantClass = variant ? `bg-${variant}` : '';
  const classes = ['card-header', variantClass, className].filter(Boolean).join(' ');

  return <div className={classes}>{children}</div>;
};

// Card Body
export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
  const classes = ['card-body', className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
};

// Card Footer
export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '', variant }) => {
  const variantClass = variant ? `bg-${variant}` : '';
  const classes = ['card-footer', variantClass, className].filter(Boolean).join(' ');

  return <div className={classes}>{children}</div>;
};

// Card Title
export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '', level = 5 }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const classes = ['card-title', className].filter(Boolean).join(' ');

  return <Tag className={classes}>{children}</Tag>;
};

// Card Text
export const CardText: React.FC<CardTextProps> = ({ children, className = '' }) => {
  const classes = ['card-text', className].filter(Boolean).join(' ');
  return <p className={classes}>{children}</p>;
};

// Card Image
export const CardImage: React.FC<CardImageProps> = ({
  src,
  alt,
  position = 'top',
  className = '',
  onError,
}) => {
  const classes = [`card-img-${position}`, className].filter(Boolean).join(' ');

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
const Card = (({ children, className = '', shadow = 'none' }) => {
  const shadowClass = shadow !== 'none' ? `shadow-${shadow}` : '';
  const classes = ['card', shadowClass, className].filter(Boolean).join(' ');

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
