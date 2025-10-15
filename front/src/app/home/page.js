"use client"

import React, { useState, useEffect } from "react";
import Button from "../componentes/Button/Button";
import { useRouter } from "next/navigation";
import styles from "@/app/home/home.module.css";

export default function Home(){
  const [jugadores, setJugadores] = useState([]);  // Almacenamos los jugadores
  const [selectedJugador, setSelectedJugador] = useState("");  // Almacenamos el jugador seleccionado
  const router = useRouter()

  // Función para obtener los jugadores desde la API
  useEffect(() => {
    getJugadores();
  }, []); // Solo se ejecuta una vez al montar el componente

  async function getJugadores() {
    let result = await fetch("http://localhost:4000/jugadores");
    let response = await result.json()
    setJugadores(response.players)
    return response;
    }   

    function handleJugar(){
        router.push("/chats")
    }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Buscar Jugadores</h1>
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
      {/* El botón ya tiene su propio estilo, pero lo centramos */}
      <div>
        <Button onClick={handleJugar} text={"seleccionar"}></Button>
      </div>
    </div>
  );
};


