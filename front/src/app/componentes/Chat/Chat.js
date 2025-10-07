"use client";

import Title from "./Title";
import styles from "./Chat.module.css";

// Componente para mostrar un chat individual
// Props:
// - nombre: nombre del chat o usuario
// - description: descripción o subtítulo
export default function Chat(props) {
  return (
    <div className={styles.chat}>
      {/* Título del chat */}
      <Title text={props.nombre} />
      {/* Descripción del chat */}
      <h2 className={styles.description}>{props.description}</h2>
    </div>
  );
}
