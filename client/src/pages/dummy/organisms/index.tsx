import React, { useState } from 'react';

// Import your actual organism components
import Modal from '@/components/organisms/modal';

// Import other components for demos
import Alert from '@/components/atoms/alert';
import Button from '@/components/atoms/button';
import Heading from '@/components/atoms/heading';
import Text from '@/components/atoms/text';
import TextField from '@/components/atoms/text-field';
import Card from '@/components/molecules/card';

/**
 * Organisms Demo Page
 * Showcases your actual organism components
 */
export default function OrganismsDemo(): JSX.Element {
  const [showBasicModal, setShowBasicModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showSizesModal, setShowSizesModal] = useState('');

  return (
    <div className="container py-5">
      <Heading level={1} className="mb-4">
        Organisms Demo
      </Heading>
      <Text color="secondary" className="mb-5">
        Showcasing your actual organism components (complex UI sections)
      </Text>

      {/* Header Organism Demo */}
      <section className="mb-5">
        <Heading level={2} className="mb-3">
          Header Organism
        </Heading>
        <Alert variant="info" className="mb-3">
          <strong>Your Header Component:</strong> The header organism is shown at the top of this
          page and includes navigation, branding, and user controls.
        </Alert>

        <Card>
          <Card.Body>
            <Text className="mb-3">Your Header organism is a complex component that combines:</Text>
            <ul>
              <li>Navigation menu items</li>
              <li>Brand logo/title</li>
              <li>User authentication controls</li>
              <li>Responsive mobile menu</li>
            </ul>
            <Text className="small text-muted">
              The actual Header is visible at the top of this page.
            </Text>
          </Card.Body>
        </Card>
      </section>

      {/* Footer Organism Demo */}
      <section className="mb-5">
        <Heading level={2} className="mb-3">
          Footer Organism
        </Heading>
        <Alert variant="success" className="mb-3">
          <strong>Your Footer Component:</strong> The footer organism appears at the bottom of pages
          and contains links and copyright information.
        </Alert>

        <Card>
          <Card.Body>
            <Text className="mb-3">Your Footer organism typically includes:</Text>
            <ul>
              <li>Footer navigation links</li>
              <li>Copyright information</li>
              <li>Contact details</li>
              <li>Social media links</li>
            </ul>
            <Text className="small text-muted">
              The actual Footer is visible at the bottom of this page.
            </Text>
          </Card.Body>
        </Card>
      </section>

      {/* Modal Organism Demo */}
      <section className="mb-5">
        <Heading level={2} className="mb-3">
          Modal Organism
        </Heading>
        <Alert variant="warning" className="mb-3">
          <strong>Your Modal Component:</strong> A complex modal system with Header, Body, Footer,
          and Title subcomponents.
        </Alert>

        <div className="row g-3 mb-4">
          <div className="col-auto">
            <Button variant="primary" onClick={() => setShowBasicModal(true)}>
              Basic Modal
            </Button>
          </div>
          <div className="col-auto">
            <Button variant="success" onClick={() => setShowFormModal(true)}>
              Form Modal
            </Button>
          </div>
          <div className="col-auto">
            <Button variant="info" onClick={() => setShowSizesModal('sm')}>
              Small Modal
            </Button>
          </div>
          <div className="col-auto">
            <Button variant="warning" onClick={() => setShowSizesModal('lg')}>
              Large Modal
            </Button>
          </div>
        </div>

        {/* Basic Modal */}
        <Modal show={showBasicModal} onHide={() => setShowBasicModal(false)}>
          <Modal.Header closeButton onClose={() => setShowBasicModal(false)}>
            <Modal.Title>Your Modal Component</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Text className="mb-3">This is your actual Modal organism component with:</Text>
            <ul className="mb-3">
              <li>Modal.Header with close button</li>
              <li>Modal.Title for the heading</li>
              <li>Modal.Body for content</li>
              <li>Modal.Footer for actions</li>
            </ul>
            <Alert variant="info">
              Your Modal supports different sizes, backdrop options, and keyboard controls.
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowBasicModal(false)}>
              Close
            </Button>
            <Button variant="primary">Save Changes</Button>
          </Modal.Footer>
        </Modal>

        {/* Form Modal */}
        <Modal show={showFormModal} onHide={() => setShowFormModal(false)} size="lg">
          <Modal.Header closeButton onClose={() => setShowFormModal(false)}>
            <Modal.Title>Modal with Form</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Text className="mb-4">
              Your Modal component can contain forms and other complex content:
            </Text>
            <div className="row g-3">
              <div className="col-md-6">
                <TextField label="Name" placeholder="Enter your name" />
              </div>
              <div className="col-md-6">
                <TextField label="Email" type="email" placeholder="Enter your email" />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowFormModal(false)}>
              Cancel
            </Button>
            <Button variant="primary">Submit</Button>
          </Modal.Footer>
        </Modal>

        {/* Size Modals */}
        <Modal
          show={!!showSizesModal}
          onHide={() => setShowSizesModal('')}
          size={showSizesModal as 'sm' | 'lg'}
        >
          <Modal.Header closeButton onClose={() => setShowSizesModal('')}>
            <Modal.Title>{showSizesModal === 'sm' ? 'Small' : 'Large'} Modal</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Text>Your Modal component supports different sizes: sm, default, lg, and xl.</Text>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => setShowSizesModal('')}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Card>
          <Card.Header>
            <Heading level={4} className="mb-0">
              Modal Features
            </Heading>
          </Card.Header>
          <Card.Body>
            <div className="row g-3">
              <div className="col-md-6">
                <Text weight="bold" className="mb-2">
                  Props:
                </Text>
                <ul className="small">
                  <li>show, onHide</li>
                  <li>size (sm, lg, xl)</li>
                  <li>centered</li>
                  <li>backdrop (true, false, 'static')</li>
                  <li>keyboard</li>
                </ul>
              </div>
              <div className="col-md-6">
                <Text weight="bold" className="mb-2">
                  Subcomponents:
                </Text>
                <ul className="small">
                  <li>Modal.Header</li>
                  <li>Modal.Title</li>
                  <li>Modal.Body</li>
                  <li>Modal.Footer</li>
                </ul>
              </div>
            </div>
          </Card.Body>
        </Card>
      </section>
    </div>
  );
}
