"use client"

import { useSearchParams } from 'next/navigation'
import { useStore } from '@/contexts/store-context'
import { useEffect } from 'react'

export function useSelectedStoreId() {
  const { selectedStore } = useStore()
  const searchParams = useSearchParams()
  
  // Prioriza o store do contexto, mas também verifica a URL
  const storeId = selectedStore?.id || searchParams?.get('store_id')
  
  return storeId
}

export function useSyncStoreWithUrl() {
  const { selectedStore, setSelectedStore, stores } = useStore()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Só sincronizar se há stores carregados
    if (stores.length === 0) return
    
    const urlStoreId = searchParams?.get('store_id')
    
    // Se há um store na URL diferente do selecionado, sincroniza
    if (urlStoreId && urlStoreId !== selectedStore?.id) {
      const storeFromUrl = stores.find(s => s.id === urlStoreId)
      if (storeFromUrl) {
        console.log('Syncing store from URL:', storeFromUrl.name)
        setSelectedStore(storeFromUrl)
      }
    }
  }, [searchParams, stores.length]) // Remover selectedStore da dependência para evitar loop
}