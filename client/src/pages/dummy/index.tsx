import React, { useState } from 'react';

// Import demo components
import AtomsDemo from './atoms';
import MoleculesDemo from './molecules';
import OrganismsDemo from './organisms';
import TemplatesDemo from './templates';

// Import components for navigation
import Badge from '@/components/atoms/badge';
import Button from '@/components/atoms/button';
import Heading from '@/components/atoms/heading';
import Text from '@/components/atoms/text';
import Card from '@/components/molecules/card';
import type { ButtonVariant } from '@/types/components-common';

type DemoSection = 'overview' | 'atoms' | 'molecules' | 'organisms' | 'templates';

/**
 * Design System Demo Hub
 * Navigation hub for all atomic design components
 */
export default function DesignSystemDemo(): JSX.Element {
  const [activeSection, setActiveSection] = useState<DemoSection>('overview');

  const sections = [
    {
      id: 'atoms' as const,
      title: 'Atoms',
      description: 'Basic building blocks: buttons, inputs, text, etc.',
      icon: '⚛️',
      color: 'primary',
      components: ['Alert', 'Badge', 'Button', 'Heading', 'Spinner', 'Text', 'Form Fields'],
    },
    {
      id: 'molecules' as const,
      title: 'Molecules',
      description: 'Simple combinations of atoms: cards, tables, etc.',
      icon: '🧬',
      color: 'success',
      components: ['Card', 'Table', 'Pagination', 'Form Groups'],
    },
    {
      id: 'organisms' as const,
      title: 'Organisms',
      description: 'Complex UI sections: headers, modals, etc.',
      icon: '🦠',
      color: 'warning',
      components: ['Header', 'Footer', 'Modal', 'Navigation', 'Data Tables'],
    },
    {
      id: 'templates' as const,
      title: 'Templates',
      description: 'Page layouts and structures',
      icon: '📋',
      color: 'info',
      components: ['Dashboard', 'List View', 'Form Layout', 'Split Layout'],
    },
  ];

  const renderOverview = () => (
    <div className="container py-5">
      <div className="text-center mb-5">
        <Heading level={1} className="mb-3">
          🎨 Design System Demo
        </Heading>
        <Text className="lead text-muted mb-4">
          Explore our atomic design system components - from basic atoms to complete templates
        </Text>
        <Badge variant="primary" className="mb-4">
          Storybook Alternative
        </Badge>
      </div>

      <div className="row g-4 mb-5">
        {sections.map((section) => (
          <div key={section.id} className="col-md-6 col-lg-3">
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div className="mb-3" style={{ fontSize: '3rem' }}>
                  {section.icon}
                </div>
                <Heading level={4} className="mb-3">
                  {section.title}
                </Heading>
                <Text color="secondary" className="mb-4">
                  {section.description}
                </Text>
                <div className="d-flex flex-wrap gap-1 justify-content-center mb-4">
                  {section.components.slice(0, 3).map((component) => (
                    <Badge key={component} variant="light" className="small">
                      {component}
                    </Badge>
                  ))}
                  {section.components.length > 3 && (
                    <Badge variant="light" className="small">
                      +{section.components.length - 3} more
                    </Badge>
                  )}
                </div>
                <Button
                  variant={section.color as ButtonVariant}
                  onClick={() => setActiveSection(section.id)}
                  className="w-100"
                >
                  View {section.title}
                </Button>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <Card className="text-center border-0 bg-light">
            <Card.Body>
              <Heading level={2} color="primary" className="mb-1">
                10+
              </Heading>
              <Text color="secondary">Atomic Components</Text>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center border-0 bg-light">
            <Card.Body>
              <Heading level={2} color="success" className="mb-1">
                5+
              </Heading>
              <Text color="secondary">Molecular Components</Text>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center border-0 bg-light">
            <Card.Body>
              <Heading level={2} color="warning" className="mb-1">
                8+
              </Heading>
              <Text color="secondary">Organism Components</Text>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center border-0 bg-light">
            <Card.Body>
              <Heading level={2} color="info" className="mb-1">
                4+
              </Heading>
              <Text color="secondary">Template Layouts</Text>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Features */}
      <Card className="border-0 bg-primary text-white">
        <Card.Body className="p-5">
          <div className="row align-items-center">
            <div className="col-md-8">
              <Heading level={3} className="text-white mb-3">
                Design System Features
              </Heading>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-2">
                    <span>✅</span>
                    <Text className="text-white">TypeScript Support</Text>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-2">
                    <span>✅</span>
                    <Text className="text-white">Bootstrap Integration</Text>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-2">
                    <span>✅</span>
                    <Text className="text-white">Responsive Design</Text>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-2">
                    <span>✅</span>
                    <Text className="text-white">Accessibility Ready</Text>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-2">
                    <span>✅</span>
                    <Text className="text-white">Form Validation</Text>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-2">
                    <span>✅</span>
                    <Text className="text-white">Dark Mode Support</Text>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4 text-center">
              <div style={{ fontSize: '5rem' }}>🚀</div>
              <Text className="text-white">Ready to Use!</Text>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );

  const renderNavigation = () => (
    <div className="bg-light border-bottom sticky-top">
      <div className="container">
        <div className="d-flex align-items-center py-3">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setActiveSection('overview')}
            className="me-3"
          >
            ← Back to Overview
          </Button>

          <div className="d-flex gap-2 flex-wrap">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={
                  activeSection === section.id
                    ? (section.color as ButtonVariant)
                    : 'outline-secondary'
                }
                size="sm"
                onClick={() => setActiveSection(section.id)}
              >
                {section.icon} {section.title}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-vh-100">
      {activeSection !== 'overview' && renderNavigation()}

      {activeSection === 'overview' && renderOverview()}
      {activeSection === 'atoms' && <AtomsDemo />}
      {activeSection === 'molecules' && <MoleculesDemo />}
      {activeSection === 'organisms' && <OrganismsDemo />}
      {activeSection === 'templates' && <TemplatesDemo />}
    </div>
  );
}
