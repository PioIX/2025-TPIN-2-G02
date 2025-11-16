import React from 'react';

function Popup({ showPopup, closePopup, children }) {
  if (!showPopup) return null;

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999
  };

  const popupStyle = {
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    maxWidth: "400px",
    width: "80%",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
  };

  return (
    <div style={overlayStyle} onClick={closePopup}>
      <div style={popupStyle} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default Popup;
