import React, { useEffect } from 'react';
import './SuccessModal.css';

const SuccessModal = ({ show, message, onClose, autoClose = true }) => {
  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, autoClose, onClose]);

  if (!show) return null;

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal" onClick={(e) => e.stopPropagation()}>
        <div className="success-icon-wrapper">
          <div className="success-checkmark">
            <div className="check-icon">
              <span className="icon-line line-tip"></span>
              <span className="icon-line line-long"></span>
              <div className="icon-circle"></div>
              <div className="icon-fix"></div>
            </div>
          </div>
        </div>
        <h2 className="success-title">Berhasil!</h2>
        <p className="success-message">{message}</p>
        <button className="success-button" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
