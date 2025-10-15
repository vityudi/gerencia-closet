"use client"

import { createContext, useContext, useEffect, useState } from 'react'

type Store = {
  id: string
  name: string
}

type StoreContextType = {
  selectedStore: Store | null
  setSelectedStore: (store: Store | null) => void
  stores: Store[]
  setStores: (stores: Store[]) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [selectedStore, setSelectedStoreState] = useState<Store | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // Persistir no localStorage - apenas na inicialização
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialized) {
      const saved = localStorage.getItem('selected-store')
      if (saved) {
        try {
          const store = JSON.parse(saved)
          setSelectedStoreState(store)
        } catch {
          // Ignore invalid JSON
        }
      }
      setInitialized(true)
    }
  }, [initialized])

  const setSelectedStore = (store: Store | null) => {
    // Evitar updates desnecessários
    if (selectedStore?.id === store?.id) return
    
    setSelectedStoreState(store)
    if (typeof window !== 'undefined') {
      if (store) {
        localStorage.setItem('selected-store', JSON.stringify(store))
      } else {
        localStorage.removeItem('selected-store')
      }
    }
  }

  return (
    <StoreContext.Provider value={{
      selectedStore,
      setSelectedStore,
      stores,
      setStores,
      isLoading,
      setIsLoading
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}