//  Error Page 404

import React from 'react';

import Button from '@/components/atoms/button';
import Heading from '@/components/atoms/heading';
import Text from '@/components/atoms/text';
import BaseTemplate from '@/components/templates/base-templates';

const ErrorPage = () => {
  return (
    <BaseTemplate>
      <div className="container py-5">
        <Heading level={1}>Oops! Page not found. 404</Heading>
        <Text className="text-muted">The page you are looking for does not exist.</Text>
        <Button href="/">
          <i className="bi bi-arrow-left"></i> Go to Homepage
        </Button>
      </div>
    </BaseTemplate>
  );
};

export default ErrorPage;
