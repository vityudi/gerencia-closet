"use client"

import { useEffect, useMemo, useState } from 'react'
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

type Store = { id: string; name: string }

export function StoreSelector() {
  const [stores, setStores] = useState<Store[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const router = useRouter()
  const search = useSearchParams()

  useEffect(() => {
    ;(async () => {
      try {
        console.log('Fetching stores...')
        const res = await fetch('/api/stores')
        
        if (!res.ok) {
          const errorText = await res.text()
          console.error('Falha ao carregar stores - Status:', res.status, 'Error:', errorText)
          setStores([])
          return
        }
        
        const json = await res.json()
        console.log('Stores API response:', json)
        const list = (json.items ?? []) as Store[]
        setStores(list)
        console.log('Stores loaded:', list.length, 'stores')
        
        const initialFromUrl = search?.get('store_id')
        console.log('Initial store ID from URL:', initialFromUrl)
        
        if (initialFromUrl && list.find(s => s.id === initialFromUrl)) {
          console.log('Using store from URL:', initialFromUrl)
          setSelected(initialFromUrl)
        } else if (list.length > 0) {
          console.log('Auto-selecting first store:', list[0].id)
          const firstId = list[0].id
          setSelected(firstId)
          const params = new URLSearchParams(search?.toString())
          params.set('store_id', firstId)
          router.replace(`?${params.toString()}`)
        } else {
          console.log('No stores available')
        }
      } catch (e) {
        console.error('Erro ao carregar stores', e)
        setStores([])
      }
    })()
  }, [search, router])

  useEffect(() => {
    // No local persistence. Selected store should be saved server-side via /api/user/store.
  }, [selected])

  const selectedName = useMemo(() => stores.find(s => s.id === selected)?.name ?? 'Selecionar loja', [stores, selected])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">{selectedName}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Lojas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {stores.map(store => (
          <DropdownMenuItem key={store.id} onClick={async () => {
            setSelected(store.id)
            try {
              const params = new URLSearchParams(search?.toString())
              params.set('store_id', store.id)
              router.replace(`?${params.toString()}`)
            } catch {}
          }}>
            {store.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


