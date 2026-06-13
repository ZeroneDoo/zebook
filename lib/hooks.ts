// Fetches from an API route, not directly from DB
"use client"
import useSWR from "swr"
import { CurrentUser } from "./interfaces"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useCurrentUser() {
  const { data, error, isLoading, mutate } = useSWR<CurrentUser>("/api/me", fetcher)

  return {
    user: data,
    isLoading,
    isError: error,
    refresh: mutate, // call this after koin/stamp changes
  }
}