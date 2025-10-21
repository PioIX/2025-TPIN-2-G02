"use client";

import React, { useState, useEffect } from "react";
import Button from "../componentes/Button/Button";
import Input from "../componentes/Input/input"; 
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import styles from "@/app/jugador/jugador.module.css";

export default function Home() {
  const [jugadores, setJugadores] = useState([]);
  const [selectedJugador, setSelectedJugador] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { socket, isConnected } = useSocket();
  const router = useRouter();

  useEffect(() => {
    getJugadores();
  }, []);

  async function getJugadores() {
    let result = await fetch("http://localhost:4000/jugadores");
    let response = await result.json();
    setJugadores(response.players);
  }

  const filteredJugadores = jugadores.filter(jugador => 
    jugador.nombre_jugador.toLowerCase().includes(searchTerm.toLowerCase()) //filtra los jugadores que contengan lo que escribí
  );

  // Manejar cambio en el input de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Resetear la selección cuando se escribe
    setSelectedJugador("");
  };


    function handleJugar(){
          // Guardar en localStorage 
          if (selectedJugador) {
            localStorage.setItem('selectedJugador', selectedJugador);
          } else {
            localStorage.removeItem('selectedJugador');
          }
          router.push(`/chats?jugador=${selectedJugador}`);
    }
  

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ELIJA SU JUGADOR PARA COMENZAR</h1>
      
      <div className={styles.searchBox}>
        <Input
          type="text"
          placeholder="Buscar jugador..."
          value={searchTerm}
          onChange={handleSearchChange}
          name="searchJugador"
        />
      </div>

      {searchTerm && (
        <div className={styles.searchBox}>
          <select
            className={styles.select}
            value={selectedJugador}
            onChange={e => setSelectedJugador(e.target.value)}
            size={Math.min(filteredJugadores.length + 1, 4)} //muestra máximo 4 opciones asi el select no ocupa toda la pantalla
          >
            
            {filteredJugadores.map(jugador => (
              <option key={jugador.id_jugador} value={jugador.id_jugador}>
                {jugador.nombre_jugador}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedJugador && (
        <div className={styles.selectedInfo}>
          <strong>Jugador seleccionado:</strong> {jugadores.find(j => j.id_jugador === parseInt(selectedJugador))?.nombre_jugador}
          {/*Busca el jugador por ID, conviértelo a número y muestra su nombre (si existe)*/}
        </div>
      )}

      <div>
        <Button onClick={handleJugar} text={"SELECCIONAR"}/>
      </div>
    </div>
  );
}