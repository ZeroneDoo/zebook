// lib/register.ts
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { generateId } from "./generated"

export async function registerPengguna(
  nama: string, email: string, password: string
) {
  const hashed = await bcrypt.hash(password, 10)
  return prisma.pengguna.create({
    data: {
      id_pengguna: await generateId("pengguna"),
      nama_pengguna: nama,
      email,
      password: hashed,
    }
  })
}

export async function registerStaff(
  username: string, nama: string, password: string
) {
  const hashed = await bcrypt.hash(password, 10)
  return prisma.staff.create({
    data: {
      id_staff: await generateId("staff"),
      username,
      nama_staff: nama,
      password: hashed,
    }
  })
}