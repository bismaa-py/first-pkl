import { createContext, useContext, useState } from 'react';
import { X, AlertTriangle, Info } from 'lucide-react';

const PopupContext = createContext(null);

export function PopupProvider({ children }) {
  const [alertState, setAlertState] = useState(null); // { title, message, type, resolve }
  const [confirmState, setConfirmState] = useState(null); // { title, message, resolve }
  const [imageState, setImageState] = useState(null); // { url }

  const showAlert = (title, message, type = 'info') => {
    return new Promise((resolve) => {
      setAlertState({ title, message, type, resolve });
    });
  };

  const showConfirm = (title, message) => {
    return new Promise((resolve) => {
      setConfirmState({ title, message, resolve });
    });
  };

  const showImage = (url) => {
    setImageState({ url });
  };

  const closeAlert = () => {
    if (alertState?.resolve) alertState.resolve(true);
    setAlertState(null);
  };

  const handleConfirm = (value) => {
    if (confirmState?.resolve) confirmState.resolve(value);
    setConfirmState(null);
  };

  return (
    <PopupContext.Provider value={{ showAlert, showConfirm, showImage }}>
      {children}

      {/* Custom Alert Modal */}
      {alertState && (
        <div className="custom-popup-overlay" style={{ zIndex: 10000 }}>
          <div className="custom-popup-card animate-scale-in">
            <div className="custom-popup-header">
              <div className={`custom-popup-icon icon--${alertState.type}`}>
                {alertState.type === 'error' ? <X size={24} /> : <Info size={24} />}
              </div>
              <h3 className="custom-popup-title">{alertState.title}</h3>
            </div>
            <div className="custom-popup-body">
              <p>{alertState.message}</p>
            </div>
            <div className="custom-popup-footer">
              <button className="btn btn--primary" onClick={closeAlert}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal */}
      {confirmState && (
        <div className="custom-popup-overlay" style={{ zIndex: 10000 }}>
          <div className="custom-popup-card animate-scale-in">
            <div className="custom-popup-header">
              <div className="custom-popup-icon icon--warning">
                <AlertTriangle size={24} />
              </div>
              <h3 className="custom-popup-title">{confirmState.title}</h3>
            </div>
            <div className="custom-popup-body">
              <p>{confirmState.message}</p>
            </div>
            <div className="custom-popup-footer" style={{ justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn--ghost" onClick={() => handleConfirm(false)}>
                Batal
              </button>
              <button className="btn btn--primary" onClick={() => handleConfirm(true)}>
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Image Preview Modal */}
      {imageState && (
        <div className="custom-popup-overlay" style={{ zIndex: 10000 }} onClick={() => setImageState(null)}>
          <div className="custom-popup-image-container animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <button className="custom-popup-close-btn" onClick={() => setImageState(null)}>
              <X size={20} />
            </button>
            <img src={imageState.url} alt="Pratinjau Foto" className="custom-popup-image" />
          </div>
        </div>
      )}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (!context) throw new Error('usePopup must be used within a PopupProvider');
  return context;
}
