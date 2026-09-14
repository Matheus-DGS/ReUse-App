import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/auth";
import { inicioDoDiaSP, missaoDoDia } from "@/lib/gamificacao";
import { rankingDeUsuarios } from "@/services/impacto";
import ItemCard from "@/components/materiais/ItemCard";
import MapaPontosLazy from "@/components/pontos/MapaPontosLazy";
import MissaoDoDia from "@/components/gamificacao/MissaoDoDia";
import styles from "./page.module.css";

export default async function HomePage() {
  const usuario = await usuarioAtual();
  const missao = missaoDoDia();

  const [itensRecentes, totalItens, pontos, totalDescartes, totalUsuarios, top3, missaoCumprida] = await Promise.all([
    prisma.item.findMany({
      take: 3,
      orderBy: { dataPublicacao: "desc" },
      include: { fotos: { where: { principal: true }, take: 1 } },
    }),
    prisma.item.count(),
    prisma.pontoColeta.findMany({
      include: { _count: { select: { descartes: true } } },
    }),
    prisma.descarte.count(),
    prisma.usuario.count(),
    rankingDeUsuarios("mes", 3),
    usuario
      ? prisma.descarte.count({
          where: { usuarioId: usuario.id, categoria: missao.categoria, data: { gte: inicioDoDiaSP() } },
        })
      : Promise.resolve(0),
  ]);

  return (
    <>
      <section className={styles.hero}>
        <div className={`wrap ${styles.heroInner}`}>
          <div className="anima-entrada">
            <p className="eyebrow">ReUse! · Descarte consciente</p>
            <h1 className={styles.titulo}>
              Cada material tem
              <br />
              um destino certo.
            </h1>
            <p className={styles.subtitulo}>
              Encontre o ponto de coleta mais perto de você, aprenda a preparar cada resíduo e
              transforme cada descarte em EcoPontos, níveis e conquistas.
            </p>
            <div className={styles.ctas}>
              <Link href="/pontos" className="btn btn-primario">
                Encontrar ponto de coleta
              </Link>
              <Link href="/materiais" className="btn btn-secundario">
                Explorar materiais
              </Link>
            </div>
          </div>

          <ol className={styles.trilha} aria-label="Como funciona">
            <span className={styles.trilhaLinha} aria-hidden="true" />
            {[
              {
                titulo: "Separe",
                texto: "Papel, plástico, vidro, metal, orgânico e eletrônicos — cada um no seu lugar.",
                cores: ["--papel-azul", "--plastico-vermelho", "--vidro-verde", "--metal-amarelo"],
              },
              {
                titulo: "Encontre o ponto",
                texto: "Filtre o mapa pelo material e veja o ponto mais próximo com a sua localização.",
                cores: ["--acento"],
              },
              {
                titulo: "Registre e evolua",
                texto: "Cada descarte vira EcoPontos. Cumpra missões, suba de nível e entre no ranking.",
                cores: ["--ouro"],
              },
            ].map((passo, i) => (
              <li key={passo.titulo} className={`anima-card ${styles.trilhaItem}`} style={{ "--ordem": i + 2 } as React.CSSProperties}>
                <span className={styles.trilhaNumero}>{i + 1}</span>
                <div>
                  <h2 className={styles.trilhaTitulo}>
                    {passo.titulo}
                    <span className={styles.trilhaCores} aria-hidden="true">
                      {passo.cores.map((c) => (
                        <span key={c} className="ponto-cor" style={{ background: `var(${c})` }} />
                      ))}
                    </span>
                  </h2>
                  <p className={styles.trilhaTexto}>{passo.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap">
        <dl className={styles.numeros}>
          {[
            { rotulo: "pontos de coleta mapeados", valor: pontos.length },
            { rotulo: "descartes registrados", valor: totalDescartes },
            { rotulo: "materiais no catálogo", valor: totalItens },
            { rotulo: "pessoas na comunidade", valor: totalUsuarios },
          ].map((n) => (
            <div key={n.rotulo}>
              <dd>{n.valor.toLocaleString("pt-BR")}</dd>
              <dt>{n.rotulo}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className={`wrap ${styles.secao}`}>
        <div className={styles.mapaBloco}>
          <div className={styles.mapaTexto}>
            <p className="eyebrow">Novo · Pontos de coleta</p>
            <h2 className={styles.h2}>Um mapa para não ter dúvida de onde descartar</h2>
            <p>
              Ecopontos, PEVs, cooperativas e parceiros com horário, materiais aceitos e rota até o
              local. O anel colorido de cada pino mostra os materiais que o ponto recebe.
            </p>
            <Link href="/pontos" className="btn btn-primario">
              Abrir o mapa
            </Link>
          </div>
          <Link href="/pontos" className={styles.mapaPreview} aria-label="Abrir o mapa de pontos de coleta">
            <MapaPontosLazy
              interativo={false}
              mostrarPopup={false}
              pontos={pontos.map((p) => ({
                id: p.id,
                nome: p.nome,
                tipo: p.tipo,
                endereco: p.endereco,
                bairro: p.bairro,
                latitude: p.latitude,
                longitude: p.longitude,
                horario: p.horario,
                materiais: p.materiais,
                verificado: p.verificado,
                totalDescartes: p._count.descartes,
              }))}
            />
          </Link>
        </div>
      </section>

      <section className={`wrap ${styles.secao} ${styles.duasColunas}`}>
        <MissaoDoDia cumprida={missaoCumprida > 0} />

        <div className={`card ${styles.topRanking}`}>
          <div className={styles.topRankingCabecalho}>
            <h2 className={styles.h3}>Destaques do mês</h2>
            <Link href="/ranking?periodo=mes">Ranking completo →</Link>
          </div>
          {top3.length > 0 ? (
            <ol>
              {top3.map((r) => (
                <li key={r.usuarioId}>
                  <span className={styles.posicao} data-posicao={r.posicao}>
                    {r.posicao}
                  </span>
                  <span>{r.nome}</span>
                  <strong>{r.pontos} pts</strong>
                </li>
              ))}
            </ol>
          ) : (
            <p>Ninguém pontuou este mês ainda. Seja o primeiro!</p>
          )}
        </div>
      </section>

      <section className={`wrap ${styles.secao}`}>
        <div className={styles.secaoTitulo}>
          <div>
            <p className="eyebrow">Catálogo</p>
            <h2 className={styles.h2}>Últimos materiais cadastrados</h2>
          </div>
          <Link href="/materiais" className={styles.verTodos}>
            Ver catálogo completo ({totalItens}) →
          </Link>
        </div>

        {itensRecentes.length > 0 ? (
          <div className={styles.grade}>
            {itensRecentes.map((item, i) => (
              <ItemCard
                key={item.id}
                id={item.id}
                nomeItem={item.nomeItem}
                descricao={item.descricao}
                categoria={item.categoria}
                foto={item.fotos[0]?.urlFoto}
                ordem={i}
              />
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--tinta-suave)" }}>Nenhum material cadastrado ainda.</p>
        )}
      </section>
    </>
  );
}
