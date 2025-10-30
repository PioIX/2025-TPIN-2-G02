"use client";

import Button from "@/app/componentes/Button/Button";
import Input from "@/app/componentes/Input/input";
import Title from "@/app/componentes/Title/Title";
import styles from "./home.module.css";
import { useSocket } from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function socketPage() {
    const { socket, isConnected } = useSocket();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [salas, setSalas] = useState([]);
    const idLogged = searchParams.get("id_usuario");
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
            router.push("/jugador");
        }

        socket.on("pingAll", handlePingAll);
        socket.on("newMessage", handleNewMessage);
        socket.on('userJoined', handleUserJoined);

        return () => {
            // Limpieza de eventos al desmontar el componente
            socket.off("pingAll", handlePingAll);
            socket.off("newMessage", handleNewMessage);
            socket.off('userJoined', handleUserJoined);
        };
    }, [socket]);

    async function getSalas() {
        let result = await fetch("http://localhost:4000/Salas");
        let response = await result.json();
        setSalas(response.sala);
    }


    function pingAll() {
        if (isConnected) {
            socket.emit("pingAll", { mensaje: "ping desde el front" });
        } else {
            console.error("Socket no está conectado");
        }
    }

    function joinRoom(id) {

        if (isConnected) {
            socket.emit("joinRoom", { room: id, idLogged: idLogged });
            console.log("Usuario unido: ", idLogged)
            router.push(`/jugador?idLogged=${idLogged}&room=${selectedRoom}`);
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
                        <Button text={"Unirse"} onClick={() => joinRoom(sala.id)} />
                    </div>
                ))}

            </div>
        </div>
    );
}