/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useEffect, useRef } from 'react';

export interface ModalProps {
  show: boolean;
  onHide: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'lg' | 'xl';
  centered?: boolean;
  backdrop?: boolean | 'static';
  keyboard?: boolean;
  className?: string;
}

export interface ModalHeaderProps {
  children: React.ReactNode;
  closeButton?: boolean;
  onClose?: () => void;
  className?: string;
}

export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export interface ModalTitleProps {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

// Modal Header
export const ModalHeader: React.FC<ModalHeaderProps> = ({
  children,
  closeButton = true,
  onClose,
  className = '',
}) => {
  const classes = ['modal-header', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
      {closeButton && (
        <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
      )}
    </div>
  );
};

// Modal Body
export const ModalBody: React.FC<ModalBodyProps> = ({ children, className = '' }) => {
  const classes = ['modal-body', className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
};

// Modal Footer
export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className = '' }) => {
  const classes = ['modal-footer', className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
};

// Modal Title
export const ModalTitle: React.FC<ModalTitleProps> = ({ children, className = '', level = 5 }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const classes = ['modal-title', className].filter(Boolean).join(' ');

  return <Tag className={classes}>{children}</Tag>;
};

// Main Modal Component with compound components
interface ModalComponent extends React.FC<ModalProps> {
  Header: typeof ModalHeader;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
  Title: typeof ModalTitle;
}

// eslint-disable-next-line react/prop-types
const Modal = (({
  show,
  onHide,
  children,
  size,
  centered = false,
  backdrop = true,
  keyboard = true,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const modalId = useRef(`modal-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const modalElement = modalRef.current;
    if (!modalElement || !window.bootstrap) return;

    // Bootstrap Modal instance
    const bootstrapModal = new window.bootstrap.Modal(modalElement, {
      backdrop: backdrop === 'static' ? 'static' : backdrop,
      keyboard,
      focus: true,
    });

    if (show) {
      bootstrapModal.show();
    } else {
      bootstrapModal.hide();
    }

    // Listen for Bootstrap modal events
    const handleHidden = () => {
      onHide();
    };

    modalElement.addEventListener('hidden.bs.modal', handleHidden);

    return () => {
      modalElement.removeEventListener('hidden.bs.modal', handleHidden);
      bootstrapModal.dispose();
    };
  }, [show, backdrop, keyboard, onHide]);

  // Fallback effect for when Bootstrap isn't available
  useEffect(() => {
    if (typeof window.bootstrap !== 'undefined') return;

    const modalElement = modalRef.current;
    if (!modalElement) return;

    // Fallback behavior without Bootstrap JavaScript
    if (show) {
      modalElement.style.display = 'block';
      modalElement.classList.add('show');
      document.body.style.overflow = 'hidden';

      // Create backdrop manually
      const backdropElement = document.createElement('div');
      backdropElement.className = 'modal-backdrop fade show';
      backdropElement.onclick = () => {
        if (backdrop !== 'static') {
          onHide();
        }
      };
      document.body.appendChild(backdropElement);
      modalElement.dataset.backdropId = backdropElement.id = `backdrop-${modalId.current}`;
    } else {
      modalElement.style.display = 'none';
      modalElement.classList.remove('show');
      document.body.style.overflow = 'unset';

      // Remove backdrop
      const backdropId = modalElement.dataset.backdropId;
      if (backdropId) {
        const backdrop = document.getElementById(backdropId);
        if (backdrop) {
          backdrop.remove();
        }
      }
    }

    // Handle ESC key
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && keyboard && show) {
        onHide();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      // Cleanup on unmount
      const backdropId = modalElement?.dataset.backdropId;
      if (backdropId) {
        const backdrop = document.getElementById(backdropId);
        if (backdrop) {
          backdrop.remove();
        }
      }
      if (modalElement) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [show, backdrop, keyboard, onHide]);

  const sizeClass = size ? `modal-${size}` : '';
  const centeredClass = centered ? 'modal-dialog-centered' : '';
  const dialogClasses = ['modal-dialog', sizeClass, centeredClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={modalRef}
      className="modal fade"
      id={modalId.current}
      tabIndex={-1}
      aria-labelledby={`${modalId.current}Label`}
      aria-hidden={!show}
      data-bs-backdrop={backdrop === 'static' ? 'static' : backdrop}
      data-bs-keyboard={keyboard}
    >
      <div className={dialogClasses}>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}) as ModalComponent;

// Attach compound components
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.Title = ModalTitle;

export default Modal;
