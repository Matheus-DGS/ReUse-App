import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/auth";
import ItemCard from "@/components/ItemCard";
import styles from "../materiais/materiais.module.css";

export default async function FavoritosPage() {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/login?redirecionar=/favoritos");

  const favoritos = await prisma.favorito.findMany({
    where: { usuarioId: usuario.id },
    orderBy: { dataFavorito: "desc" },
    include: {
      item: {
        include: { fotos: { where: { principal: true }, take: 1 } },
      },
    },
  });

  return (
    <div className={`wrap ${styles.pagina}`}>
      <header className={styles.cabecalho}>
        <p className="eyebrow">Sua conta</p>
        <h1 className={styles.titulo}>Meus favoritos</h1>
        <p className={styles.descricao}>
          Materiais que você salvou para consultar depois. Toque em ★ Favoritado na página do
          material para removê-lo desta lista.
        </p>
      </header>

      {favoritos.length > 0 ? (
        <div className={styles.grade}>
          {favoritos.map((f) => (
            <ItemCard
              key={f.id}
              id={f.item.id}
              nomeItem={f.item.nomeItem}
              descricao={f.item.descricao}
              categoria={f.item.categoria}
              foto={f.item.fotos[0]?.urlFoto}
            />
          ))}
        </div>
      ) : (
        <p className={styles.vazio}>
          Você ainda não favoritou nenhum material. Explore o catálogo e favorite o que for do seu
          interesse.
        </p>
      )}
    </div>
  );
}
