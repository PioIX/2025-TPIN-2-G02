import React, { useState } from 'react';

function Popup({ showPopup, closePopup, children }) {
  if (!showPopup) {
    return null; // Don't render if not visible
  }

  return (
    <div onClick={closePopup} aria-hidden={!showPopup}>
      <div onClick={(e) => e.stopPropagation()}>
        {children} {/* Content of the popup */}
      </div>
    </div>
  );
}

export default Popup;