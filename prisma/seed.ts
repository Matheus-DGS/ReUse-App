import { PrismaClient, Categoria } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash("reuse123", 10);

  const usuario = await prisma.usuario.upsert({
    where: { email: "equipe@reuse.app" },
    update: {},
    create: {
      nome: "Equipe ReUse",
      email: "equipe@reuse.app",
      senha: senhaHash,
    },
  });

  const itensSeed: {
    nomeItem: string;
    descricao: string;
    categoria: Categoria;
    foto: string;
  }[] = [
    {
      nomeItem: "Garrafas PET",
      descricao:
        "Garrafas plásticas de refrigerante e água. Devem ser lavadas e ter a tampa retirada antes do descarte.",
      categoria: "PLASTICO",
      foto: "https://images.unsplash.com/photo-1610963874653-1ca6f818e1c7?w=800",
    },
    {
      nomeItem: "Caixas de papelão",
      descricao:
        "Embalagens de papelão limpas e secas. Desmonte as caixas para otimizar o espaço de coleta.",
      categoria: "PAPEL",
      foto: "https://images.unsplash.com/photo-1607166452427-7e4477079cb9?w=800",
    },
    {
      nomeItem: "Potes de vidro",
      descricao:
        "Potes e garrafas de vidro sem rótulo. Evite descartar vidros quebrados junto com os demais materiais.",
      categoria: "VIDRO",
      foto: "https://images.unsplash.com/photo-1550963295-019d8a8a61c5?w=800",
    },
    {
      nomeItem: "Latas de alumínio",
      descricao:
        "Latas de bebida e conservas. Um dos materiais recicláveis de maior valor de reaproveitamento.",
      categoria: "METAL",
      foto: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800",
    },
  ];

  for (const dados of itensSeed) {
    await prisma.item.create({
      data: {
        nomeItem: dados.nomeItem,
        descricao: dados.descricao,
        categoria: dados.categoria,
        usuarioId: usuario.id,
        fotos: {
          create: [{ urlFoto: dados.foto, principal: true }],
        },
      },
    });
  }

  console.log("Seed concluído com sucesso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
