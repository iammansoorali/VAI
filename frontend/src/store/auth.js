import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      username: null,
      role: null,
      setAuth: (token, username, role) => set({ token, username, role }),
      logout: () => set({ token: null, username: null, role: null }),
    }),
    { name: 'llmgoat-auth' }
  )
)

export async function apiRequest(path, options = {}) {
  const token = useAuthStore.getState().token
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (res.status === 401) {
    useAuthStore.getState().logout()
    window.location.href = '/login'
    return
  }
  return res
}
