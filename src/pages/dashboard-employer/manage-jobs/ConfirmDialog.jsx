import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

export default function ConfirmDialog({ title, description, confirmText, variant, onConfirm, children, showReasonField = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [portalElement, setPortalElement] = useState(null);

  // Common rejection reasons
  const rejectionReasons = [
    { value: "", label: "Select a reason" },
    { value: "not_qualified", label: "Not qualified for the position" },
    { value: "experience_mismatch", label: "Experience doesn't match our requirements" },
    { value: "skills_mismatch", label: "Skills don't match our requirements" },
    { value: "education_mismatch", label: "Education doesn't match our requirements" },
    { value: "cultural_fit", label: "Not a cultural fit for our team" },
    { value: "position_filled", label: "Position has been filled" },
    { value: "application_incomplete", label: "Application was incomplete" },
    { value: "other", label: "Other (please specify)" }
  ];

  // Tạo portal element khi component được mount
  useEffect(() => {
    let element = document.getElementById('confirm-dialog-root');
    if (!element) {
      element = document.createElement('div');
      element.id = 'confirm-dialog-root';
      document.body.appendChild(element);
    }
    setPortalElement(element);
    
    return () => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, []);

  // Khóa scroll khi modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      
      // Thêm class cho body khi modal mở
      document.body.classList.add('modal-open');
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      
      // Xóa class khi modal đóng
      document.body.classList.remove('modal-open');
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  const handleOpen = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setIsOpen(true);
  };

  const handleClose = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setIsOpen(false);
  };

  const handleOverlayClick = (e) => {
    // Dừng sự kiện lan truyền và bubble
    e.stopPropagation();
    e.preventDefault();
    
    // Đóng modal khi click vào overlay (tùy chọn)
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleModalClick = (e) => {
    // Dừng sự kiện lan truyền và bubble
    e.stopPropagation();
  };

  const handleConfirm = (e) => {
    e.stopPropagation();
    
    if (showReasonField && selectedReason === "") {
      return;
    }
    
    let finalReason = "";
    if (selectedReason === "other") {
      finalReason = customReason;
    } else if (selectedReason) {
      finalReason = rejectionReasons.find(r => r.value === selectedReason)?.label || "";
    }
    
    onConfirm(finalReason);
    handleClose();
    setSelectedReason("");
    setCustomReason("");
  };

  const handleReasonChange = (e) => {
    const value = e.target.value;
    setSelectedReason(value);
  };

  // Tạo modal trong portal
  const renderModal = () => {
    if (!isOpen || !portalElement) return null;
    
    return ReactDOM.createPortal(
      <div 
        className="modal-overlay" 
        onClick={handleOverlayClick}
        onTouchStart={handleOverlayClick}
      >
        <div 
          className="modal-container"
          onClick={handleModalClick}
          onTouchStart={handleModalClick}
        >
          <div className="modal-header">
            <h3>{title}</h3>
            <button className="close-btn" onClick={handleClose}>×</button>
          </div>
          <div className="modal-body">
            <p>{description}</p>
            
            {showReasonField && (
              <div className="reason-field">
                <label htmlFor="rejection-reason">Reason for rejection:</label>
                <select 
                  id="rejection-reason"
                  value={selectedReason} 
                  onChange={handleReasonChange}
                  className="reason-select"
                >
                  {rejectionReasons.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                
                {selectedReason === "other" && (
                  <textarea
                    placeholder="Please specify the rejection reason"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="custom-reason"
                    rows={3}
                  />
                )}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="cancel-btn" onClick={handleClose}>
              Cancel
            </button>
            <button 
              className={`confirm-btn ${variant}`}
              onClick={handleConfirm}
              disabled={showReasonField && (selectedReason === "" || (selectedReason === "other" && customReason === ""))}
            >
              {confirmText}
            </button>
          </div>
          
          <style jsx>{`
            .modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              width: 100vw;
              height: 100vh;
              background-color: rgba(0, 0, 0, 0.5);
              display: flex;
              justify-content: center;
              align-items: center;
              z-index: 9999;
              backdrop-filter: blur(2px);
              isolation: isolate;
            }
            
            .modal-container {
              background-color: white;
              border-radius: 8px;
              width: 90%;
              max-width: 500px;
              box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
              display: flex;
              flex-direction: column;
              position: relative;
              z-index: 10000;
              animation: fadeIn 0.2s ease-out;
              isolation: isolate;
            }
            
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            
            .modal-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 15px 20px;
              border-bottom: 1px solid #e9ecef;
            }
            
            .modal-header h3 {
              margin: 0;
              font-size: 18px;
              font-weight: 600;
            }
            
            .close-btn {
              background: none;
              border: none;
              font-size: 24px;
              cursor: pointer;
              color: #6c757d;
            }
            
            .close-btn:hover {
              color: #343a40;
            }
            
            .modal-body {
              padding: 20px;
              border-bottom: 1px solid #e9ecef;
            }
            
            .reason-field {
              margin-top: 15px;
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            
            .reason-select {
              padding: 10px;
              border: 1px solid #ced4da;
              border-radius: 4px;
              font-size: 14px;
            }
            
            .custom-reason {
              margin-top: 10px;
              padding: 10px;
              border: 1px solid #ced4da;
              border-radius: 4px;
              font-size: 14px;
              resize: vertical;
            }
            
            .modal-footer {
              padding: 15px 20px;
              display: flex;
              justify-content: flex-end;
              gap: 10px;
            }
            
            .cancel-btn {
              padding: 8px 16px;
              background-color: #f8f9fa;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-weight: 500;
              cursor: pointer;
              transition: background-color 0.2s;
            }
            
            .cancel-btn:hover {
              background-color: #e9ecef;
            }
            
            .confirm-btn {
              padding: 8px 16px;
              border: none;
              border-radius: 4px;
              font-weight: 500;
              color: white;
              cursor: pointer;
              transition: background-color 0.2s;
            }
            
            .confirm-btn:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
            
            .confirm-btn.primary {
              background-color: #3498db;
            }
            
            .confirm-btn.primary:hover:not(:disabled) {
              background-color: #2980b9;
            }
            
            .confirm-btn.destructive {
              background-color: #dc3545;
            }
            
            .confirm-btn.destructive:hover:not(:disabled) {
              background-color: #c82333;
            }
          `}</style>
        </div>
      </div>,
      portalElement
    );
  };

  return (
    <>
      <div 
        onClick={handleOpen} 
        style={{ cursor: 'pointer', display: 'inline-block' }}
      >
        {children}
      </div>
      
      {renderModal()}
      
      <style jsx global>{`
        body.modal-open {
          overflow: hidden;
          touch-action: none;
        }
      `}</style>
    </>
  );
}