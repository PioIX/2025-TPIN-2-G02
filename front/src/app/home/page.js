"use client"

import React, { useState, useEffect } from "react";
import Button from "../componentes/Button/Button";
import { useRouter } from "next/navigation";

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
    <div>
      <h1>Buscar Jugadores</h1>
      <select value={selectedJugador} onChange={e => setSelectedJugador(e.target.value)}>
        <option value="">Seleccionar jugador</option>
        {jugadores.map((jugador) => (
          <option key={jugador.id_jugador} value={jugador.id_jugador}>
            {jugador.nombre_jugador} {/* Asumiendo que cada jugador tiene un campo 'nombre' */}
          </option>
        ))}
      </select>
      <Button onClick={handleJugar} text={"seleccionar"}></Button>
    </div>
  );
};


