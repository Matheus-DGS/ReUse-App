export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--linha)", marginTop: 80 }}>
      <div
        className="wrap"
        style={{
          padding: "28px 24px",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          color: "var(--tinta-suave)",
        }}
      >
        <span>ReUse! — plataforma de incentivo à reciclagem</span>
        <span>Projeto acadêmico · FIAP</span>
      </div>
    </footer>
  );
}
