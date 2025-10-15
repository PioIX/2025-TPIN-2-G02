"use client"

import React, { useState, useEffect } from "react";
import Button from "../componentes/Button/Button";
import { useRouter } from "next/navigation";
import styles from "@/app/home/home.module.css";

export default function Home(){
  const [jugadores, setJugadores] = useState([]);  // Almacenamos los jugadores
  const [selectedJugador, setSelectedJugador] = useState("");  // Almacenamos el jugador seleccionado
  const router = useRouter()
  // El array jugadores ya está ordenado en getJugadores

  // Función para obtener los jugadores desde la API
  useEffect(() => {
    getJugadores();
  }, []); // Solo se ejecuta una vez al montar el componente

  async function getJugadores() {
    let result = await fetch("http://localhost:4000/jugadores");
    let response = await result.json();
    // para ordenar los jugadopres alfabéticamente
    const jugadoresOrdenados = response.players.sort((a, b) => {
      const nombreA = a.nombre_jugador?.toLowerCase() || "";
      const nombreB = b.nombre_jugador?.toLowerCase() || "";
      return nombreA.localeCompare(nombreB);
    });
    setJugadores(jugadoresOrdenados);
    return response;
  }

    function handleJugar(){
        router.push("/chats")
    }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ELIJA SU JUGADOR PARA COMENZAR </h1>
      <div className={styles.searchBox}>
        <select className={styles.select} value={selectedJugador} onChange={e => setSelectedJugador(e.target.value)}>
          <option value="">Seleccionar jugador</option>
          {jugadores.map((jugador) => (
            <option key={jugador.id_jugador} value={jugador.id_jugador}>
              {jugador.nombre_jugador}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Button onClick={handleJugar} text={"SELECCIONAR"}></Button>
      </div>
    </div>
  );
};


