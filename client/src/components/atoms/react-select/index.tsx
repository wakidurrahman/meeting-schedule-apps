import { debounce } from 'lodash';
import React, { useMemo } from 'react';
import Select, { GroupBase, StylesConfig } from 'react-select';
import AsyncSelect from 'react-select/async';

import { FormComponentProps } from '@/types/components-common';
import { buildClassNames } from '@/utils/component';

// Option type for react-select
export interface SelectOption {
  value: string | number;
  label: string;
  isDisabled?: boolean;
}

// Base props interface
interface BaseReactSelectProps extends FormComponentProps {
  id?: string;
  label?: string;
  helpText?: string;
  placeholder?: string;
  isClearable?: boolean;
  isSearchable?: boolean;
  isMulti?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  value?: SelectOption | SelectOption[] | null;
  defaultValue?: SelectOption | SelectOption[] | null;
  onChange?: (value: SelectOption | SelectOption[] | null) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

// Standard Select Props
export interface ReactSelectProps extends BaseReactSelectProps {
  options: SelectOption[];
  async?: false;
}

// Async Select Props
export interface AsyncReactSelectProps extends BaseReactSelectProps {
  loadOptions: (inputValue: string) => Promise<SelectOption[]>;
  async: true;
  debounceMs?: number;
  cacheOptions?: boolean;
  defaultOptions?: boolean | SelectOption[];
}

// Union type for all props
export type ReactSelectComponentProps = ReactSelectProps | AsyncReactSelectProps;

/**
 * Bootstrap-styled React Select Component
 *
 * 🎯 Features Implemented
 * - Single Select (default):  Standard dropdown selection
 * - Multi-Select (isMulti prop): Select multiple options
 * - Searchable (isSearchable prop): Type-ahead search functionality
 * - Async Loading (async prop): Load options from API endpoints with configurable throttling (debounceMs)
 *
 * Advanced Features:
 * - Bootstrap Styling Integration - Fully styled with Bootstrap classes to match your design system
 * - Form Validation - Error states, required field indicators, help text
 * - Error handling: Error handling like Bootstrap form validation
 * - Debounced Search - Configurable debounce delay (default 300ms) for async loading
 * - Option Caching - Cache async results for better performance
 * - Loading States - Built-in loading indicators
 * - Disabled States - Full disability support
 * - TypeScript Support - Complete type safety with interfaces
 */
const ReactSelectField = React.forwardRef<HTMLDivElement, ReactSelectComponentProps>(
  (props, ref) => {
    const {
      id,
      label,
      helpText,
      error,
      required,
      className,
      placeholder = 'Select...',
      isClearable = true,
      isSearchable = true,
      isMulti = false,
      isDisabled = false,
      isLoading = false,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
    } = props;

    const controlId = id || `react-select-${Math.random().toString(36).substr(2, 9)}`;
    const isInvalid = Boolean(error);

    // Bootstrap-styled theme for react-select
    const customStyles: StylesConfig<SelectOption, boolean, GroupBase<SelectOption>> = useMemo(
      () => ({
        control: (provided, state) => ({
          ...provided,
          minHeight: '38px',
          border: `1px solid ${isInvalid ? '#dc3545' : state.isFocused ? '#86b7fe' : '#dee2e6'}`,
          borderRadius: '0.375rem',
          boxShadow: state.isFocused
            ? isInvalid
              ? '0 0 0 0.25rem rgba(220, 53, 69, 0.25)'
              : '0 0 0 0.25rem rgba(13, 110, 253, 0.25)'
            : 'none',
          backgroundColor: isDisabled ? '#e9ecef' : '#fff',
          fontSize: '1rem',
          '&:hover': {
            borderColor: isInvalid ? '#dc3545' : '#86b7fe',
          },
        }),

        valueContainer: (provided) => ({
          ...provided,
          padding: '2px 8px',
        }),

        input: (provided) => ({
          ...provided,
          margin: '0px',
          color: '#212529',
        }),

        placeholder: (provided) => ({
          ...provided,
          color: '#6c757d',
        }),

        singleValue: (provided) => ({
          ...provided,
          color: '#212529',
        }),

        multiValue: (provided) => ({
          ...provided,
          backgroundColor: '#e9ecef',
          borderRadius: '0.25rem',
        }),

        multiValueLabel: (provided) => ({
          ...provided,
          color: '#212529',
          fontSize: '0.875rem',
        }),

        multiValueRemove: (provided) => ({
          ...provided,
          color: '#6c757d',
          ':hover': {
            backgroundColor: '#dc3545',
            color: 'white',
          },
        }),

        menu: (provided) => ({
          ...provided,
          zIndex: 9999,
          border: '1px solid #dee2e6',
          borderRadius: '0.375rem',
          boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
        }),

        menuList: (provided) => ({
          ...provided,
          padding: '0',
        }),

        option: (provided, state) => ({
          ...provided,
          backgroundColor: state.isSelected
            ? '#0d6efd'
            : state.isFocused
              ? '#f8f9fa'
              : 'transparent',
          color: state.isSelected ? '#fff' : '#212529',
          padding: '8px 12px',
          fontSize: '1rem',
          cursor: 'pointer',
          ':hover': {
            backgroundColor: state.isSelected ? '#0d6efd' : '#f8f9fa',
          },
        }),

        indicatorSeparator: (provided) => ({
          ...provided,
          backgroundColor: '#dee2e6',
        }),

        dropdownIndicator: (provided) => ({
          ...provided,
          color: '#6c757d',
          ':hover': {
            color: '#495057',
          },
        }),

        clearIndicator: (provided) => ({
          ...provided,
          color: '#6c757d',
          ':hover': {
            color: '#dc3545',
          },
        }),

        loadingIndicator: (provided) => ({
          ...provided,
          color: '#0d6efd',
        }),

        noOptionsMessage: (provided) => ({
          ...provided,
          color: '#6c757d',
          fontSize: '1rem',
          padding: '12px',
        }),

        loadingMessage: (provided) => ({
          ...provided,
          color: '#6c757d',
          fontSize: '1rem',
          padding: '12px',
        }),
      }),
      [isInvalid, isDisabled],
    );

    // Check if this is an async select
    const isAsync = 'async' in props && props.async === true;

    // Create debounced load function for async select
    const debouncedLoadOptions = useMemo(() => {
      if (!isAsync) return undefined;

      const asyncProps = props as AsyncReactSelectProps;
      const debounceMs = asyncProps.debounceMs || 300;

      return debounce(async (inputValue: string, callback: (options: SelectOption[]) => void) => {
        try {
          const options = await asyncProps.loadOptions(inputValue);
          callback(options);
        } catch (error) {
          console.error('Error loading options:', error);
          callback([]);
        }
      }, debounceMs) as (inputValue: string, callback: (options: SelectOption[]) => void) => void;
    }, [isAsync, props]);

    // Common props for both Select and AsyncSelect
    const commonProps = {
      inputId: controlId,
      instanceId: controlId,
      styles: customStyles,
      placeholder,
      isClearable,
      isSearchable,
      isMulti,
      isDisabled,
      isLoading,
      value,
      defaultValue,
      onChange: (newValue: unknown) => onChange?.(newValue as SelectOption | SelectOption[] | null),
      onFocus,
      onBlur,
      className: buildClassNames('react-select-container', className),
      classNamePrefix: 'react-select',
      noOptionsMessage: () => 'No options found',
      loadingMessage: () => 'Loading...',
    };

    // Render the appropriate Select component
    const SelectComponent = isAsync ? (
      <AsyncSelect
        {...commonProps}
        loadOptions={debouncedLoadOptions}
        cacheOptions={(props as AsyncReactSelectProps).cacheOptions}
        defaultOptions={(props as AsyncReactSelectProps).defaultOptions}
      />
    ) : (
      <Select {...commonProps} options={(props as ReactSelectProps).options} />
    );

    return (
      <div ref={ref} className="mb-3">
        {label && (
          <label htmlFor={controlId} className="form-label">
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </label>
        )}

        {SelectComponent}

        {helpText && !isInvalid && <div className="form-text">{helpText}</div>}

        {isInvalid && <div className="invalid-feedback d-block">{error}</div>}
      </div>
    );
  },
);

ReactSelectField.displayName = 'ReactSelectField';

export default ReactSelectField;
