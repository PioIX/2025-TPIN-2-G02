// Componente de formulario reutilizable para email y password
// Props:
// - onChangeEmail: función para manejar cambios en el email
// - placeholderEmail: placeholder para el input de email
// - onChangePassword: función para manejar cambios en el password
// - placeholderPassword: placeholder para el input de password
"use client";

import { useState } from "react";
import styles from "./Forms.module.css";

export default function Forms({
  onChangeEmail,
  placeholderEmail,
  onChangePassword,
  placeholderPassword,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.form}>
      <input
        type="email"
        onChange={onChangeEmail}
        placeholder={placeholderEmail}
        className={styles.input}
      />

      <div className={styles.passwordWrapper}>
        <input
          type={showPassword ? "text" : "password"}
          onChange={onChangePassword}
          placeholder={placeholderPassword}
          className={styles.input}
        />
        <span
          className={styles.toggle}
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "🙈" : "👁️"}
        </span>
      </div>
    </div>
  );
}

