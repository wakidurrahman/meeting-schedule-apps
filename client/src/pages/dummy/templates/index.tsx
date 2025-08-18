import React, { useState } from 'react';

// Import components for demos
import Alert from '@/components/atoms/alert';
import Button from '@/components/atoms/button';
import Heading from '@/components/atoms/heading';
import Text from '@/components/atoms/text';
import Card from '@/components/molecules/card';
// Import your actual template component
import BaseTemplate from '@/components/templates/base-templates';

/**
 * Templates Demo Page
 * Demonstrates your BaseTemplate component with different content layouts
 */
export default function TemplatesDemo(): JSX.Element {
  const [currentDemo, setCurrentDemo] = useState('basic');

  return (
    <div className="container py-5">
      <Heading level={1} className="mb-4">
        Templates Demo
      </Heading>
      <Text color="secondary" className="mb-4">
        Showcasing your BaseTemplate component with different content layouts
      </Text>

      {/* Demo Navigation */}
      <div className="mb-4">
        <Button
          variant={currentDemo === 'basic' ? 'primary' : 'outline-secondary'}
          size="sm"
          className="me-2"
          onClick={() => setCurrentDemo('basic')}
        >
          Basic Layout
        </Button>
        <Button
          variant={currentDemo === 'dashboard' ? 'primary' : 'outline-secondary'}
          size="sm"
          className="me-2"
          onClick={() => setCurrentDemo('dashboard')}
        >
          Dashboard Layout
        </Button>
        <Button
          variant={currentDemo === 'content' ? 'primary' : 'outline-secondary'}
          size="sm"
          onClick={() => setCurrentDemo('content')}
        >
          Content Layout
        </Button>
      </div>

      {/* Template Demos */}
      {currentDemo === 'basic' && (
        <div>
          <Alert variant="info" className="mb-4">
            <strong>BaseTemplate Component:</strong> Your template includes Header and Footer
            organisms with a main content area.
          </Alert>

          <Card>
            <Card.Header>
              <Heading level={3} className="mb-0">
                BaseTemplate Preview
              </Heading>
            </Card.Header>
            <Card.Body>
              <Text className="mb-3">
                This shows how your BaseTemplate component wraps content with Header and Footer
                organisms.
              </Text>
              <div className="border rounded p-3 bg-light">
                <Text weight="bold" className="mb-2">
                  Template Structure:
                </Text>
                <ul className="mb-0">
                  <li>Header Organism (Navigation, Branding)</li>
                  <li>Main Content Area (This content)</li>
                  <li>Footer Organism (Footer links, Copyright)</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}

      {currentDemo === 'dashboard' && (
        <BaseTemplate>
          <div className="container">
            <Heading level={2} className="mb-4">
              Dashboard Content
            </Heading>
            <div className="row g-4">
              <div className="col-md-4">
                <Card>
                  <Card.Body className="text-center">
                    <Heading level={3} color="primary">
                      1,234
                    </Heading>
                    <Text color="secondary">Total Users</Text>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-4">
                <Card>
                  <Card.Body className="text-center">
                    <Heading level={3} color="success">
                      567
                    </Heading>
                    <Text color="secondary">Active Sessions</Text>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-4">
                <Card>
                  <Card.Body className="text-center">
                    <Heading level={3} color="warning">
                      89
                    </Heading>
                    <Text color="secondary">Pending Tasks</Text>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </div>
        </BaseTemplate>
      )}

      {currentDemo === 'content' && (
        <BaseTemplate>
          <div className="container">
            <Heading level={2} className="mb-4">
              Content Page Layout
            </Heading>
            <div className="row">
              <div className="col-md-8">
                <Card>
                  <Card.Header>
                    <Heading level={4} className="mb-0">
                      Main Content
                    </Heading>
                  </Card.Header>
                  <Card.Body>
                    <Text className="mb-3">
                      This demonstrates how your BaseTemplate component can be used for content
                      pages. The Header and Footer are automatically included.
                    </Text>
                    <Text>
                      Your BaseTemplate provides a consistent layout structure across all pages
                      while allowing flexible content in the main area.
                    </Text>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-4">
                <Card>
                  <Card.Header>
                    <Heading level={5} className="mb-0">
                      Sidebar
                    </Heading>
                  </Card.Header>
                  <Card.Body>
                    <Text>Sidebar content can be added within the BaseTemplate.</Text>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </div>
        </BaseTemplate>
      )}
    </div>
  );
}
