import React, { useState } from 'react';

// Import all atomic components
import Alert from '@/components/atoms/alert';
import Badge from '@/components/atoms/badge';
import Button from '@/components/atoms/button';
import CheckboxField from '@/components/atoms/checkbox-field';
import Heading from '@/components/atoms/heading';
import SelectField from '@/components/atoms/select-field';
import Spinner from '@/components/atoms/spinner';
import Text from '@/components/atoms/text';
import TextField from '@/components/atoms/text-field';
import TextareaField from '@/components/atoms/textarea-field';
// Types for demo
import type { AlertVariant, BadgeVariant, ButtonVariant } from '@/types/components-common';

/**
 * Atoms Demo Page
 * Showcases all atomic components with their variations
 */
export default function AtomsDemo(): JSX.Element {
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  // Demo data
  const alertVariants: AlertVariant[] = [
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'light',
    'dark',
  ];
  const badgeVariants: BadgeVariant[] = [
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'light',
    'dark',
  ];
  const buttonVariants: ButtonVariant[] = [
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'light',
    'dark',
    'link',
  ];
  const headingLevels = [1, 2, 3, 4, 5, 6] as const;
  const selectOptions = [
    { value: '', label: 'Choose an option...' },
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  return (
    <div className="container py-5">
      <Heading level={1} className="mb-5">
        Atomic Components Demo
      </Heading>

      {/* Alert Components */}
      <section className="mb-5">
        <Heading level={2} className="mb-3">
          Alerts
        </Heading>
        <div className="row g-3">
          {alertVariants.map((variant) => (
            <div key={variant} className="col-md-6">
              <Alert variant={variant}>This is a {variant} alert with some sample text.</Alert>
            </div>
          ))}
        </div>

        <Heading level={3} className="mt-4 mb-3">
          Dismissible Alerts
        </Heading>
        <div className="row g-3">
          <div className="col-md-6">
            <Alert variant="warning" dismissible onClose={() => console.log('Alert dismissed')}>
              This is a dismissible warning alert.
            </Alert>
          </div>
          <div className="col-md-6">
            <Alert variant="info" dismissible onClose={() => console.log('Alert dismissed')}>
              This is a dismissible info alert.
            </Alert>
          </div>
        </div>
      </section>

      {/* Badge Components */}
      <section className="mb-5">
        <Heading level={2} className="mb-3">
          Badges
        </Heading>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {badgeVariants.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>

        <Heading level={3} className="mb-3">
          Pill Badges
        </Heading>
        <div className="d-flex flex-wrap gap-2">
          {badgeVariants.map((variant) => (
            <Badge key={`pill-${variant}`} variant={variant} pill>
              {variant}
            </Badge>
          ))}
        </div>
      </section>

      {/* Button Components */}
      <section className="mb-5">
        <Heading level={2} className="mb-3">
          Buttons
        </Heading>

        <Heading level={3} className="mb-3">
          Standard Buttons
        </Heading>
        <div className="d-flex flex-wrap gap-2 mb-4">
          {buttonVariants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>

        <Heading level={3} className="mb-3">
          Outline Buttons
        </Heading>
        <div className="d-flex flex-wrap gap-2 mb-4">
          {buttonVariants
            .filter((v) => v !== 'link')
            .map((variant) => (
              <Button key={`outline-${variant}`} variant={variant} outline>
                {variant}
              </Button>
            ))}
        </div>

        <Heading level={3} className="mb-3">
          Button Sizes
        </Heading>
        <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary">Default</Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
        </div>

        <Heading level={3} className="mb-3">
          Button States
        </Heading>
        <div className="d-flex flex-wrap gap-2">
          <Button variant="primary">Normal</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </section>

      {/* Heading Components */}
      <section className="mb-5">
        <Heading level={2} className="mb-3">
          Headings
        </Heading>
        {headingLevels.map((level) => (
          <Heading key={level} level={level} className="mb-2">
            Heading Level {level}
          </Heading>
        ))}
      </section>

      {/* Text Components */}
      <section className="mb-5">
        <Heading level={2} className="mb-3">
          Text Components
        </Heading>

        <Heading level={3} className="mb-3">
          Text Colors
        </Heading>
        <div className="mb-3">
          <Text color="primary">Primary text</Text>
          <Text color="secondary">Secondary text</Text>
          <Text color="success">Success text</Text>
          <Text color="danger">Danger text</Text>
          <Text color="warning">Warning text</Text>
          <Text color="info">Info text</Text>
          <Text color="body">Body text</Text>
        </div>

        <Heading level={3} className="mb-3">
          Text Weights
        </Heading>
        <div className="mb-3">
          <Text weight="light">Light text</Text>
          <Text weight="normal">Normal text</Text>
          <Text weight="bold">Bold text</Text>
          <Text weight="bolder">Bolder text</Text>
        </div>

        <Heading level={3} className="mb-3">
          Text Transforms
        </Heading>
        <div className="mb-3">
          <Text transform="lowercase">LOWERCASE TEXT</Text>
          <Text transform="uppercase">uppercase text</Text>
          <Text transform="capitalize">capitalize text</Text>
        </div>

        <Heading level={3} className="mb-3">
          Text Alignment
        </Heading>
        <div className="mb-3">
          <Text align="start">Start aligned text</Text>
          <Text align="center">Center aligned text</Text>
          <Text align="end">End aligned text</Text>
        </div>
      </section>

      {/* Spinner Components */}
      <section className="mb-5">
        <Heading level={2} className="mb-3">
          Spinners
        </Heading>

        <Heading level={3} className="mb-3">
          Border Spinners
        </Heading>
        <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
          <Spinner variant="border" />
          <Spinner variant="border" color="primary" />
          <Spinner variant="border" color="success" />
          <Spinner variant="border" color="danger" />
        </div>

        <Heading level={3} className="mb-3">
          Grow Spinners
        </Heading>
        <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
          <Spinner variant="grow" />
          <Spinner variant="grow" color="primary" />
          <Spinner variant="grow" color="success" />
          <Spinner variant="grow" color="danger" />
        </div>

        <Heading level={3} className="mb-3">
          Spinner Sizes
        </Heading>
        <div className="d-flex flex-wrap align-items-center gap-3">
          <Spinner variant="border" size="sm" />
          <Spinner variant="border" />
          <Spinner variant="border" size="lg" />
        </div>
      </section>

      {/* Form Components */}
      <section className="mb-5">
        <Heading level={2} className="mb-3">
          Form Components
        </Heading>

        <div className="row">
          <div className="col-md-6">
            <TextField
              label="Text Field"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Enter some text..."
              helpText="This is a help text for the field"
            />

            <TextField
              label="Text Field with Error"
              value=""
              error="This field is required"
              placeholder="This field has an error"
            />

            <TextareaField
              label="Textarea Field"
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              placeholder="Enter multiple lines of text..."
              rows={4}
              helpText="This is a textarea for longer content"
            />
          </div>

          <div className="col-md-6">
            <SelectField
              label="Select Field"
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              options={selectOptions}
              helpText="Choose one of the available options"
            />

            <SelectField
              label="Select Field with Error"
              value=""
              options={selectOptions}
              error="Please select an option"
            />

            <CheckboxField
              label="Checkbox Field"
              checked={checkboxValue}
              onChange={(e) => setCheckboxValue(e.target.checked)}
              helpText="Check this box to agree"
            />

            <CheckboxField
              label="Checkbox with Error"
              checked={false}
              error="You must agree to continue"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
