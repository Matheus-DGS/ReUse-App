import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/auth";
import { infoCategoria } from "@/lib/categorias";
import FavoriteButton from "@/components/FavoriteButton";
import styles from "./item.module.css";

export default async function ItemDetalhePage({ params }: { params: { id: string } }) {
  const item = await prisma.item.findUnique({
    where: { id: params.id },
    include: {
      fotos: { orderBy: { principal: "desc" } },
      usuario: { select: { nome: true } },
    },
  });

  if (!item) notFound();

  const usuario = await usuarioAtual();

  const favoritoExistente = usuario
    ? await prisma.favorito.findUnique({
        where: { usuarioId_itemId: { usuarioId: usuario.id, itemId: item.id } },
      })
    : null;

  const cat = infoCategoria(item.categoria);
  const fotoPrincipal = item.fotos[0]?.urlFoto;

  return (
    <div className={`wrap ${styles.pagina}`}>
      <div className={styles.grade}>
        <div className={styles.imagemWrap}>
          {fotoPrincipal ? (
            <Image src={fotoPrincipal} alt={item.nomeItem} fill sizes="480px" className={styles.imagem} />
          ) : (
            <div className={styles.semImagem} aria-hidden="true">
              ♻
            </div>
          )}
        </div>

        <div>
          <span className={styles.badge} style={{ background: cat.cor }}>
            {cat.label}
          </span>
          <h1 className={styles.titulo}>{item.nomeItem}</h1>
          <p className={styles.descricao}>{item.descricao}</p>

          <dl className={styles.meta}>
            <div>
              <dt>Cadastrado por</dt>
              <dd>{item.usuario.nome}</dd>
            </div>
            <div>
              <dt>Publicado em</dt>
              <dd>{new Intl.DateTimeFormat("pt-BR").format(item.dataPublicacao)}</dd>
            </div>
          </dl>

          <FavoriteButton
            itemId={item.id}
            favoritadoInicial={Boolean(favoritoExistente)}
            autenticado={Boolean(usuario)}
          />
        </div>
      </div>
    </div>
  );
}
