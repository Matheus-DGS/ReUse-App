export const CATEGORIAS = {
  PAPEL: { label: "Papel", cor: "var(--papel-azul)" },
  PLASTICO: { label: "Plástico", cor: "var(--plastico-vermelho)" },
  VIDRO: { label: "Vidro", cor: "var(--vidro-verde)" },
  METAL: { label: "Metal", cor: "var(--metal-amarelo)" },
  ORGANICO: { label: "Orgânico", cor: "var(--vidro-verde)" },
  ELETRONICO: { label: "Eletrônico", cor: "var(--metal-amarelo)" },
} as const;

export type CategoriaKey = keyof typeof CATEGORIAS;

export function infoCategoria(categoria: string) {
  return CATEGORIAS[categoria as CategoriaKey] ?? { label: categoria, cor: "var(--tinta-suave)" };
}
