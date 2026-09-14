import Link from "next/link";
import { usuarioAtual } from "@/lib/auth";
import { estatisticasDoUsuario } from "@/services/impacto";
import NavLinks from "./NavLinks";
import styles from "./Header.module.css";

export default async function Header() {
  const usuario = await usuarioAtual();
  const impacto = usuario ? await estatisticasDoUsuario(usuario.id) : null;

  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.inner}`}>
        <Link href="/" className={styles.marca} aria-label="ReUse! — página inicial">
          <span className={styles.logo} aria-hidden="true">
            ♻
          </span>
          ReUse!
        </Link>

        <NavLinks
          usuario={
            usuario && impacto
              ? {
                  primeiroNome: usuario.nome.split(" ")[0],
                  pontos: impacto.estatisticas.totalPontos,
                  nivel: impacto.nivel.nome,
                }
              : null
          }
        />
      </div>
    </header>
  );
}
