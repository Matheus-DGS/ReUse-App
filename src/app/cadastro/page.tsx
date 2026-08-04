import CadastroForm from "./CadastroForm";
import styles from "./auth.module.css";

export default function CadastroPage() {
  return (
    <div className={`wrap ${styles.pagina}`}>
      <div className={`card ${styles.cartao}`}>
        <p className="eyebrow">Junte-se ao ReUse!</p>
        <h1 className={styles.titulo}>Criar minha conta</h1>
        <CadastroForm />
      </div>
    </div>
  );
}
