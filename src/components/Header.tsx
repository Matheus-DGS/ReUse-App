import Link from "next/link";
import { usuarioAtual } from "@/lib/auth";
import LogoutButton from "./LogoutButton";
import styles from "./Header.module.css";

export default async function Header() {
  const usuario = await usuarioAtual();

  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.inner}`}>
        <Link href="/" className={styles.marca}>
          <span className={styles.icone} aria-hidden="true">
            ♻
          </span>
          ReUse!
        </Link>

        <nav className={styles.nav}>
          <Link href="/materiais">Materiais</Link>
          {usuario && <Link href="/favoritos">Favoritos</Link>}
        </nav>

        <div className={styles.acoes}>
          {usuario ? (
            <>
              <span className={styles.usuario}>Olá, {usuario.nome.split(" ")[0]}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-secundario">
                Entrar
              </Link>
              <Link href="/cadastro" className="btn btn-primario">
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
