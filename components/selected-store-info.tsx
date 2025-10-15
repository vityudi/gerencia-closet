"use client"

import { useStore } from '@/contexts/store-context'

export function SelectedStoreInfo() {
  const { selectedStore } = useStore()
  
  if (!selectedStore) {
    return null
  }
  
  return (
    <div className="text-sm text-muted-foreground">
      Loja: <span className="font-medium text-foreground">{selectedStore.name}</span>
    </div>
  )
}