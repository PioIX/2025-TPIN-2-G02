"use client";

import Button from "@/app/componentes/Button/Button";
import Input from "@/app/componentes/Input/input"; 
import { useSocket } from "@/hooks/useSocket";
import { useEffect, useState } from "react";

export default function socketPage() {
    const { socket, isConnected } = useSocket();
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!socket) return;

        const handlePingAll = (recibido) => {
            console.log("PING RECIBIDO: ", recibido);
        };

        const handleNewMessage = (data) => {
            console.log("MENSAJE NUEVO: ", data);
        };

        socket.on("pingAll", handlePingAll);
        socket.on("newMessage", handleNewMessage);

        return () => {
            // Limpieza de eventos al desmontar el componente
            socket.off("pingAll", handlePingAll);
            socket.off("newMessage", handleNewMessage);
        };
    }, [socket]);

    function pingAll() {
        if (isConnected) {
            socket.emit("pingAll", { mensaje: "ping desde el front" });
        } else {
            console.error("Socket no está conectado");
        }
    }

    function joinRoom() {
        if (isConnected) {
            socket.emit("joinRoom", { room: "pio" });
        } else {
            console.error("Socket no está conectado");
        }
    }

    function handleInput(event) {
        setMessage(event.target.value);
    }

    function sendMessage() {
        if (isConnected && message.trim()) {
            socket.emit("sendMessage", { message, id: 1 });
            setMessage(""); // Limpiar el input después de enviar el mensaje
        } else {
            console.error("Socket no está conectado o el mensaje está vacío");
        }
    }

    return (
        <>
            <h1>Pagina del socket</h1>

            <Button text={"PingAll"} onClick={pingAll}></Button>
            <Button text={"JoinRoom"} onClick={joinRoom}></Button>

            <Input value={message} onChange={handleInput}></Input>
            <Button text={"SendMessage"} onClick={sendMessage}></Button>
        </>
    );
}