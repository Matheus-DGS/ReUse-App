import Link from "next/link";
import Image from "next/image";
import { infoCategoria } from "@/lib/categorias";
import styles from "./ItemCard.module.css";

type ItemCardProps = {
  id: string;
  nomeItem: string;
  descricao: string;
  categoria: string;
  foto?: string | null;
};

export default function ItemCard({ id, nomeItem, descricao, categoria, foto }: ItemCardProps) {
  const cat = infoCategoria(categoria);

  return (
    <Link href={`/materiais/${id}`} className={`card ${styles.card}`}>
      <div className={styles.imagemWrap}>
        {foto ? (
          <Image src={foto} alt={nomeItem} fill sizes="280px" className={styles.imagem} />
        ) : (
          <div className={styles.semImagem} aria-hidden="true">
            ♻
          </div>
        )}
        <span className={styles.badge} style={{ background: cat.cor }}>
          {cat.label}
        </span>
      </div>
      <div className={styles.corpo}>
        <h3 className={styles.titulo}>{nomeItem}</h3>
        <p className={styles.descricao}>{descricao}</p>
      </div>
    </Link>
  );
}
