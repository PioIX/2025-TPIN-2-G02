"use client";

import styles from "./Title.module.css";

// Componente de título reutilizable
// Recibe el texto a mostrar como prop 'text'
export default function Title(props) {
    // Renderiza un h1 estilizado con el texto recibido
    return <h1 className={styles.title}>{props.text}</h1>;
}

