"use client";

import Button from "@/app/componentes/Button/Button";
import Input from "@/app/componentes/Input/input";
import Title from "@/app/componentes/Title/Title";
import styles from "./home.module.css";
import { useSocket } from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function socketPage() {
    const { socket, isConnected } = useSocket();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [salas, setSalas] = useState([]);
    const idLogged = searchParams.get("idLogged");
    const selectedRoom = searchParams.get("nombre_sala");
    useEffect(() => {
        getSalas()
        if (!socket) return;

        const handlePingAll = (recibido) => {
            console.log("PING RECIBIDO: ", recibido);
        };

        const handleNewMessage = (data) => {
            console.log("MENSAJE NUEVO: ", data);
        };

        const handleUserJoined = (data) => {
            console.log("Usuario unido: ", data)
        }

        const handleCantJugadores = (data) => {
            console.log("Cantidad de jugadores actualizada: ", data);
            setSalas((prevSalas) =>
                prevSalas.map((sala) =>
                    sala.id_sala === data.id_sala
                        ? { ...sala, cantidad_participantes: data.cantidad_participantes }
                        : sala
                )
            );
        }

        socket.on("pingAll", handlePingAll);
        socket.on("newMessage", handleNewMessage);
        socket.on('userJoined', handleUserJoined);
        socket.on('cantJugadores', handleCantJugadores);

        return () => {
            // Limpieza de eventos al desmontar el componente
            socket.off("pingAll", handlePingAll);
            socket.off("newMessage", handleNewMessage);
            socket.off('userJoined', handleUserJoined);
            socket.off('cantJugadores', handleCantJugadores);
        };
    }, [socket]);

    async function getSalas() {
        let result = await fetch("http://localhost:4000/Salas");
        let response = await result.json();
        console.log("SALAS!!", response)
        setSalas(response.sala);
    }

    function joinRoom(idSala) {
        let sala = {};
        if (isConnected) {
            // Emitir evento para unirse a la sala
            socket.emit("joinRoom", { room: idSala, idLogged: idLogged });

            // Actualizar la UI de las salas
            for (let i = 0; i < salas.length; i++) {
                if (salas[i].id_sala === idSala) {
                    sala = salas[i];
                    break;
                }
            }
            // Guardar en localStorage
            localStorage.setItem("sala", JSON.stringify(sala));

            // Redirigir al jugador
            router.push(`/jugador?idLogged=${idLogged}&room=${idSala}`);
        } else {
            console.error("Socket no está conectado");
        }
    }


    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <Title text={"Bienvenido"} />

                <p className={styles.notice}>Conecta con el servidor para jugar.</p>

                {salas.map((sala) => (
                    <div key={sala.id_sala} className={styles.sala}>
                        <p>{sala.nombre}</p>
                        <p>{sala.cantidad_participantes} / {sala.max_jugadores} </p>
                        {
                            (sala.cantidad_participantes < sala.max_jugadores) ?
                                <Button text={"Unirse"} onClick={() => joinRoom(sala.id_sala)} />
                                :
                                <p>Sala llena</p>
                        }
                    </div>
                ))}

            </div>
        </div>
    );
}