import { Prisma } from "@/app/generated/prisma/client";

export type DetailBukuModel = Prisma.detail_bukuGetPayload<{
  include: { buku: { select: { judul: true } } };
}>;