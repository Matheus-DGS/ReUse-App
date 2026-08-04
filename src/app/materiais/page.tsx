import Link from "next/link";
import { Categoria } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import ItemCard from "@/components/ItemCard";
import { CATEGORIAS } from "@/lib/categorias";
import styles from "./materiais.module.css";

type PageProps = {
  searchParams: { categoria?: string };
};

export default async function MateriaisPage({ searchParams }: PageProps) {
  const categoriaFiltro = searchParams.categoria as Categoria | undefined;

  const itens = await prisma.item.findMany({
    where: categoriaFiltro ? { categoria: categoriaFiltro } : undefined,
    orderBy: { dataPublicacao: "desc" },
    include: { fotos: { where: { principal: true }, take: 1 } },
  });

  return (
    <div className={`wrap ${styles.pagina}`}>
      <header className={styles.cabecalho}>
        <p className="eyebrow">Catálogo</p>
        <h1 className={styles.titulo}>Materiais recicláveis</h1>
        <p className={styles.descricao}>
          Consulte os materiais cadastrados pela comunidade ReUse!, filtre por categoria e
          favorite os que forem do seu interesse.
        </p>
      </header>

      <div className={styles.filtros}>
        <Link
          href="/materiais"
          className={`${styles.filtro} ${!categoriaFiltro ? styles.filtroAtivo : ""}`}
        >
          Todos
        </Link>
        {Object.entries(CATEGORIAS).map(([chave, valor]) => (
          <Link
            key={chave}
            href={`/materiais?categoria=${chave}`}
            className={`${styles.filtro} ${categoriaFiltro === chave ? styles.filtroAtivo : ""}`}
          >
            {valor.label}
          </Link>
        ))}
      </div>

      {itens.length > 0 ? (
        <div className={styles.grade}>
          {itens.map((item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              nomeItem={item.nomeItem}
              descricao={item.descricao}
              categoria={item.categoria}
              foto={item.fotos[0]?.urlFoto}
            />
          ))}
        </div>
      ) : (
        <p className={styles.vazio}>Nenhum material encontrado para esse filtro.</p>
      )}
    </div>
  );
}
