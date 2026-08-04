import LoginForm from "./LoginForm";
import styles from "../cadastro/auth.module.css";

export default function LoginPage() {
  return (
    <div className={`wrap ${styles.pagina}`}>
      <div className={`card ${styles.cartao}`}>
        <p className="eyebrow">Bem-vindo de volta</p>
        <h1 className={styles.titulo}>Entrar no ReUse!</h1>
        <LoginForm />
      </div>
    </div>
  );
}
