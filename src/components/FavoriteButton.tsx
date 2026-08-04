"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type FavoriteButtonProps = {
  itemId: string;
  favoritadoInicial: boolean;
  autenticado: boolean;
};

export default function FavoriteButton({
  itemId,
  favoritadoInicial,
  autenticado,
}: FavoriteButtonProps) {
  const [favoritado, setFavoritado] = useState(favoritadoInicial);
  const [pendente, iniciarTransicao] = useTransition();
  const router = useRouter();

  async function alternar() {
    if (!autenticado) {
      router.push("/login");
      return;
    }

    const proximoEstado = !favoritado;
    setFavoritado(proximoEstado);

    iniciarTransicao(async () => {
      const resposta = await fetch("/api/favoritos", {
        method: proximoEstado ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });

      if (!resposta.ok) {
        // reverte em caso de falha
        setFavoritado(!proximoEstado);
      }

      router.refresh();
    });
  }

  return (
    <button
      onClick={alternar}
      disabled={pendente}
      className="btn btn-secundario"
      aria-pressed={favoritado}
      style={favoritado ? { borderColor: "var(--acento)", color: "var(--acento)" } : undefined}
    >
      {favoritado ? "★ Favoritado" : "☆ Favoritar"}
    </button>
  );
}
