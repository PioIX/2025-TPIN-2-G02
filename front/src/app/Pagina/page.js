"use client"

import React, { useEffect, useState } from 'react';
import Producto from '../componentes/Producto';

export default function Pagina() {
    const [productos, setProductos] = useState([]);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");


    useEffect(() => {
        async function getProductos() {
            const res = await fetch('http://localhost:4000/productos');
            const req = await res.json();
            setProductos(req.productos)
        }
        getProductos();
    }, []);

    async function postProducto() {
        const res = await fetch('http://localhost:4000/crearProducto', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: nombre,
                descripcion: descripcion
            })
        });
        const req = await res.json();
        setProductos([...productos, req.producto]);
        setNombre("");
        setDescripcion("");
    }


    return (
        <div>
            <h1>Productos</h1>
            <label>
                <input
                    type="checkbox"
                    checked={mostrarFormulario}
                    onChange={() => setMostrarFormulario(!mostrarFormulario)}
                />
                Agregar nuevo producto
            </label>

            <hr />

            {mostrarFormulario ? (
                <div>
                    <h2>Nuevo Producto</h2>
                    <input
                        type="text"
                        placeholder="Nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Descripción"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    /><br /><br />

                    <button onClick={postProducto}>Agregar Producto</button>
                </div>
            ) : (

                <div>
                    {productos.map((producto) => (
                        <Producto
                            key={producto.id}
                            titulo={producto.nombre}
                            descripcion={producto.descripcion}
                        ></Producto>
                    ))}
                </div>
            )}

        </div>
    );

}


"use client";
import { useState, useEffect } from "react";
import Producto from "../componentes/Producto";

export default function PaginaRepaso() {

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [mostrarInput, setMostrarInput] = useState(false);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    async function getProductos() {
      const res = await fetch("http://localhost:4000/productos");
      const req = await res.json();
      setProductos(req.productos);
    }
    getProductos();
  }, []);

  async function crearProducto() {
    const res = await fetch("http://localhost:4000/crearProducto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nombre,
        descripcion: descripcion
      })
    });

    const req = await res.json();

    setProductos(prev => [...prev, req.producto]);

    setNombre("");
    setDescripcion("");
    setMostrarInput(false);
  }

  return (
    <div>
      <h1>Pagina de Repaso</h1>

      <label>
        <input
          type="checkbox"
          checked={mostrarInput}
          onChange={(e) => setMostrarInput(e.target.checked)}
        />
        Mostrar inputs
      </label>

      {mostrarInput ? (
        <div>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />

          <button onClick={crearProducto}>Agregar</button>
        </div>
      ) : (
        <div>
          {productos.map(p => (
            <Producto
              key={p.id}
              nombre={p.nombre}
              descripcion={p.descripcion}
            />
          ))}
        </div>
      )}
    </div>
  );
}
