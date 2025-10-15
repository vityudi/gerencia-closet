"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useStore } from '@/contexts/store-context'

export function StoreSelector() {
  const { selectedStore, setSelectedStore, stores, setStores, isLoading, setIsLoading } = useStore()
  const router = useRouter()
  const search = useSearchParams()

  useEffect(() => {
    let isMounted = true
    
    ;(async () => {
      try {
        console.log('Fetching stores...')
        setIsLoading(true)
        const res = await fetch('/api/stores')
        
        if (!isMounted) return
        
        if (!res.ok) {
          const errorText = await res.text()
          console.error('Falha ao carregar stores - Status:', res.status, 'Error:', errorText)
          setStores([])
          setIsLoading(false)
          return
        }
        
        const json = await res.json()
        console.log('Stores API response:', json)
        const list = (json.items ?? []) as Array<{ id: string; name: string }>
        
        if (!isMounted) return
        
        setStores(list)
        console.log('Stores loaded:', list.length, 'stores')
        setIsLoading(false)
        
      } catch (e) {
        console.error('Erro ao carregar stores', e)
        if (isMounted) {
          setStores([])
          setIsLoading(false)
        }
      }
    })()
    
    return () => {
      isMounted = false
    }
  }, []) // Remover todas as dependências que causam loop

  // Separar a lógica de seleção inicial em outro useEffect
  useEffect(() => {
    if (stores.length === 0) return
    
    const initialFromUrl = search?.get('store_id')
    console.log('Initial store ID from URL:', initialFromUrl)
    
    if (initialFromUrl && stores.find(s => s.id === initialFromUrl)) {
      console.log('Using store from URL:', initialFromUrl)
      const store = stores.find(s => s.id === initialFromUrl)!
      if (!selectedStore || selectedStore.id !== store.id) {
        setSelectedStore(store)
      }
    } else if (selectedStore && stores.find(s => s.id === selectedStore.id)) {
      // Keep previously selected store if it still exists
      console.log('Keeping previously selected store:', selectedStore.name)
      const params = new URLSearchParams(search?.toString())
      params.set('store_id', selectedStore.id)
      router.replace(`?${params.toString()}`)
    } else if (!selectedStore && stores.length > 0) {
      console.log('Auto-selecting first store:', stores[0].name)
      setSelectedStore(stores[0])
      const params = new URLSearchParams(search?.toString())
      params.set('store_id', stores[0].id)
      router.replace(`?${params.toString()}`)
    }
  }, [stores, search]) // Apenas stores e search como dependências

  const handleStoreSelect = async (store: { id: string; name: string }) => {
    setSelectedStore(store)
    try {
      const params = new URLSearchParams(search?.toString())
      params.set('store_id', store.id)
      router.replace(`?${params.toString()}`)
    } catch {}
  }

  const displayName = () => {
    if (isLoading) return 'Carregando lojas...'
    if (selectedStore) return selectedStore.name
    if (stores.length === 0) return 'Nenhuma loja disponível'
    return 'Selecionar loja'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading || stores.length === 0}>
          {displayName()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Lojas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {stores.map(store => (
          <DropdownMenuItem 
            key={store.id} 
            onClick={() => handleStoreSelect(store)}
            className={selectedStore?.id === store.id ? 'bg-accent' : ''}
          >
            {store.name}
            {selectedStore?.id === store.id && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


