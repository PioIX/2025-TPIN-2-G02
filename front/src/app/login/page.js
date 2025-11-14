"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Poppins } from "next/font/google";
import Title from "../componentes/Title/Title";
import Button from "../componentes/Button/Button";
import styles from "./login.module.css";
import { useIp } from "@/hooks/useIp";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { ip } = useIp();

  async function handleLogin() {
    setError("");

    if (email.trim() === "" || password.trim() === "") {
      setError("Debes ingresar un email y contraseña válidos.");
      return;
    }

    try {
      const res = await fetch(`http://${ip}:4000/usuarioLogin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gmail: email, contraseña: password })
      });

      const data = await res.json();
      console.log("DATA USUARIO",data.usuario.id_usuario)

      if (data.ok) {
        localStorage.setItem("idLogged", data.usuario.id_usuario)
        router.push(`/inicio?idLogged=${data.usuario.id_usuario}`);
      } else {
        setError(data.mensaje || "Usuario o contraseña incorrectos");
      }
      
    } catch (err) {
      console.error("Error en el login:", err);
      setError("Error al conectar con el servidor");
    }
  }

  return (
    <div className={`${styles.container} ${poppins.className}`}>
      <div className={styles.card}>
        <Title text="INICIO DE SESIÓN" />

        <div className={styles.fields}>
          <input
            type="email"
            placeholder="Ingresa tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Campo de contraseña con ícono para mostrar/ocultar */}
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className={styles.eye}
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? "🚫" : "👁"}
            </span>
          </div>
        </div>

        <Button text="ENTRAR" onClick={handleLogin} variant="primary" />

        <p className={styles.footer}>
          ¿No tienes cuenta?{" "}
          <span
            className={styles.link}
            onClick={() => router.push("/register")}
          >
            REGÍSTRATE
          </span>
        </p>
      </div>
    </div>
  );
}
