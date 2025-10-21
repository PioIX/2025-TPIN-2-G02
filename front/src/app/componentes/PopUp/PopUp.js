import React, { useState } from 'react';

function Popup({ showPopup, closePopup, children }) {
  if (!showPopup) {
    return null; // Don't render if not visible
  }

  return (
    <div  onClick={closePopup}> {/* Click outside to close */}
      <div  onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking inside */}
        <button  onClick={closePopup}>X</button>
        {children} {/* Content of the popup */}
      </div>
    </div>
  );
}

export default Popup;