import type { CategoriaKey } from "@/lib/categorias";
import type { TipoPontoKey } from "@/lib/pontos";

/** Formato serializável de um ponto de coleta enviado aos Client Components. */
export type PontoResumo = {
  id: string;
  nome: string;
  tipo: TipoPontoKey;
  endereco: string;
  bairro: string;
  latitude: number;
  longitude: number;
  horario: string;
  materiais: CategoriaKey[];
  verificado: boolean;
  totalDescartes: number;
};
