import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ItemCard from "@/components/ItemCard";
import styles from "./page.module.css";

export default async function HomePage() {
  const itensRecentes = await prisma.item.findMany({
    take: 3,
    orderBy: { dataPublicacao: "desc" },
    include: { fotos: { where: { principal: true }, take: 1 } },
  });

  const totalItens = await prisma.item.count();

  return (
    <>
      <section className={styles.hero}>
        <div className={`wrap ${styles.heroInner}`}>
          <div className={styles.heroTexto}>
            <p className="eyebrow">Plataforma web · ReUse!</p>
            <h1 className={styles.titulo}>
              Cada material tem
              <br />
              um destino certo.
            </h1>
            <p className={styles.subtitulo}>
              O ReUse! reúne, em um catálogo colaborativo, materiais recicláveis cadastrados pela
              comunidade — para que papel, plástico, vidro e metal encontrem o caminho certo até
              a reciclagem.
            </p>
            <div className={styles.ctas}>
              <Link href="/materiais" className="btn btn-primario">
                Explorar materiais
              </Link>
              <Link href="/cadastro" className="btn btn-secundario">
                Criar minha conta
              </Link>
            </div>
          </div>

          <div className={styles.trilha} role="img" aria-label="Linha de triagem representando papel, plástico, vidro e metal">
            <div className={styles.trilhaLinha} />
            {[
              { cor: "var(--papel-azul)", label: "Papel" },
              { cor: "var(--plastico-vermelho)", label: "Plástico" },
              { cor: "var(--vidro-verde)", label: "Vidro" },
              { cor: "var(--metal-amarelo)", label: "Metal" },
            ].map((c) => (
              <div key={c.label} className={styles.trilhaItem}>
                <span className={styles.trilhaPonto} style={{ background: c.cor }} />
                <span className={styles.trilhaLabel}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`wrap ${styles.secao}`}>
        <div className={styles.secaoTitulo}>
          <div>
            <p className="eyebrow">Catálogo</p>
            <h2 className={styles.h2}>Últimos materiais cadastrados</h2>
          </div>
          <span className={styles.contagem}>{totalItens} itens no catálogo</span>
        </div>

        {itensRecentes.length > 0 ? (
          <div className={styles.grade}>
            {itensRecentes.map((item) => (
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
          <p style={{ color: "var(--tinta-suave)" }}>
            Nenhum material cadastrado ainda. Rode o seed do Prisma para popular o catálogo.
          </p>
        )}

        <Link href="/materiais" className={styles.verTodos}>
          Ver catálogo completo →
        </Link>
      </section>

      <section className={`wrap ${styles.secao}`}>
        <div className={styles.pilares}>
          <div className="card" style={{ padding: 24 }}>
            <p className="eyebrow">01</p>
            <h3 className={styles.pilarTitulo}>Catálogo vivo</h3>
            <p className={styles.pilarTexto}>
              Cada material cadastrado entra em um catálogo público, com categoria, descrição e
              fotos — pronto para consulta pela comunidade.
            </p>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <p className="eyebrow">02</p>
            <h3 className={styles.pilarTitulo}>Sua conta, seus favoritos</h3>
            <p className={styles.pilarTexto}>
              Crie uma conta para salvar os materiais de interesse e acompanhá-los sempre que
              quiser, de qualquer dispositivo.
            </p>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <p className="eyebrow">03</p>
            <h3 className={styles.pilarTitulo}>Uma segunda via de acesso</h3>
            <p className={styles.pilarTexto}>
              A versão web complementa o aplicativo mobile, oferecendo o essencial do ReUse! direto
              no navegador, sem instalação.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
