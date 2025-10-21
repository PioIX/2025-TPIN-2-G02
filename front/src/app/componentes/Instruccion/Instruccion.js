import React from "react";
import styles from "./Instruccion.module.css";

const instrucciones = `📍 Instrucciones\n\nElegi tu jugador secreto.\nCada persona selecciona un jugador del buscador sin decirle al otro quién es. Ese será tu personaje durante toda la partida.\n\nComienza el turno de preguntas.\nUno de los oponentes inicia haciendo una pregunta que solo pueda responderse con “sí” o “no”.\n👉 Ejemplo: “¿Juega en Europa?” o “¿Tiene barba?”\n\nTu rival responde sinceramente.\nEl otro jugador solo puede decir “sí” o “no” según las características del jugador que eligió.\n\nDescartá jugadores mentalmente.\nCon cada respuesta, vas eliminando de tu mente (o visualmente en el tablero) a los jugadores que no coinciden con las pistas que obtuviste.\n\nTurnos alternados.\nDespués de responder, el turno pasa al otro jugador, que ahora hace su pregunta. Así continúan hasta que alguno crea saber quién es el jugador rival.\n\nAdiviná el jugador.\nCuando estés seguro, escribí en el chat: “Tu jugador es [nombre del jugador]”.\nSi acertás, aparece en pantalla que ganaste 🎉(cuando el rival ponga “sí”).\nSi te equivocás, el juego sigue y perdés el turno (cuando el rival ponga “no”).\n\nFin del juego.\nGana el primero que adivina correctamente el jugador del rival.\nNo hay segundas oportunidades, así que pensá bien tus preguntas😬.`;

export default function Instruccion({ onClose }) {
  return (
    <div className={styles.fondoInstruccion}>
      <div className={styles.contenedor}>
        <button className={styles.cruz} onClick={onClose} title="Cerrar instrucciones" aria-label="Cerrar">×</button>
        <div className={styles.texto}>
          {instrucciones.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
