export interface UserRow {
  id: number;
  id_pengguna: string;
  name: string;
  email: string;
  joined: string;
  koin: number;
  stamp: number;
  avatar: string;
}

export interface FormPenggunaData {
  nama_pengguna: string;
  email: string;
  koin: string;
  stamp: string;
  password: string;
}

export type FormPenggunaBody = {
  nama_pengguna: string;
  email: string;
  koin: number;
  stamp: number;
  password?: string;
};


export interface Pagination {
  totalData: number;
  totalPage: number;
  currentPage: number;
  limit: number;
}

export interface CurrentUser {
  id_pengguna: string
  nama_pengguna: string | null
  email: string
  koin: number
  stamp: number
}