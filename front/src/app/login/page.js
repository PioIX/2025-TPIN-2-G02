"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Poppins } from "next/font/google";
import Title from "../componentes/Title/Title";
import Button from "../componentes/Button/Button";
import styles from "./login.module.css";

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
  const idLogged = searchParams.get("id_usuario");

  // 🔹 Manejar inicio de sesión
  async function handleLogin() {
    setError("");

    // Validación simple
    if (email.trim() === "" || password.trim() === "") {
      setError("Debes ingresar un email y contraseña válidos.");
      return;
    }

    try {
      // 🔹 Petición al backend para autenticar
      const res = await fetch("http://localhost:4000/usuarioLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gmail: email, contraseña: password })
      });

      const data = await res.json();


      if (data.ok) {
        router.push(`/inicio?idLogged=${idLogged}`);
      } else {
        // Si credenciales incorrectas
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

        {/* Mensaje de error */}
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.fields}>
          {/* Campo de email */}
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
