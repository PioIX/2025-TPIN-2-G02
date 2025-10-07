"use client";

import React from "react";
import styles from "./Input.module.css";

// Componente de input reutilizable
// Props:
// - type: tipo de input (text, password, email, etc)
// - placeholder: texto de ayuda
// - value: valor controlado
// - name: nombre del input
// - onChange: función para manejar cambios
export default function Input(props) {
  return (
    <input
      type={props.type}
      placeholder={props.placeholder}
      value={props.value}
      name={props.name}
      onChange={props.onChange}
      className={styles.input}
    />
  );
}


