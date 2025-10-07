"use client";

import React from "react";
import styles from "./Button.module.css";

// Componente de botón reutilizable
// Props:
// - onClick: función a ejecutar al hacer click
// - text: texto a mostrar en el botón
// - extraClass: clases CSS adicionales
export default function Button(props) {
  return (
    <button 
      onClick={props.onClick} 
      className={`${styles.button} ${props.extraClass || ""}`}
    >
      {props.text}
    </button>
  );
}
