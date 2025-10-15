"use client"

import { useEffect, useState, Suspense } from 'react'
import { useStore } from '@/contexts/store-context'
import { useSyncStoreWithUrl } from '@/hooks/use-store'

type TeamMember = {
  id: string
  full_name: string
  email?: string
  phone?: string
  role: string
  hire_date?: string
  status: string
}

type SalesStats = {
  id: string
  name: string
  role: string
  totalSales: number
  salesCount: number
}

function TeamPageContent() {
  const { selectedStore } = useStore()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [salesStats, setSalesStats] = useState<SalesStats[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Sincroniza store com URL
  useSyncStoreWithUrl()

  useEffect(() => {
    if (!selectedStore) {
      setTeamMembers([])
      setError(null)
      return
    }

    const fetchTeamMembers = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch team members
        const teamRes = await fetch(`/api/stores/${selectedStore.id}/team`)
        if (!teamRes.ok) {
          throw new Error('Falha ao carregar equipe')
        }
        const teamData = await teamRes.json()
        setTeamMembers(teamData.items || [])

        // Fetch sales statistics
        const statsRes = await fetch(`/api/stores/${selectedStore.id}/sales-stats`)
        if (!statsRes.ok) {
          throw new Error('Falha ao carregar estatísticas de vendas')
        }
        const statsData = await statsRes.json()
        setSalesStats(statsData.items || [])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(errorMessage)
        setTeamMembers([])
        setSalesStats([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeamMembers()
  }, [selectedStore]) // Usar selectedStore completo para detectar mudanças

  if (!selectedStore) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Equipe</h1>
        <p className="text-muted-foreground mt-2">Gestão de vendedores e colaboradores.</p>
        <div className="text-sm text-muted-foreground mt-4">Selecione uma loja para visualizar a equipe.</div>
      </main>
    )
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Equipe</h1>
      <p className="text-muted-foreground mt-2">Gestão de vendedores e colaboradores.</p>
      
      {isLoading && (
        <div className="mt-4 text-sm text-muted-foreground">Carregando equipe...</div>
      )}
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <div className="text-sm font-medium text-red-800">Erro ao carregar equipe</div>
          <div className="text-xs text-red-600 mt-1">Loja: {selectedStore.name}</div>
          <div className="text-xs text-red-600">Erro: {error}</div>
        </div>
      )}
      
      {!isLoading && !error && (
        <div className="mt-4 space-y-3">
          {teamMembers.length ? teamMembers.map((member) => {
            const stats = salesStats.find(s => s.id === member.id)
            return (
              <div key={member.id} className="rounded border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-lg">{member.full_name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {member.role} • Status: {member.status}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {member.email && <span>{member.email}</span>}
                      {member.email && member.phone && <span> • </span>}
                      {member.phone && <span>{member.phone}</span>}
                    </div>
                    {member.hire_date && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Contratado em: {new Date(member.hire_date).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    
                    {/* Sales Statistics */}
                    {stats && (
                      <div className="mt-3 p-3 bg-blue-50 rounded">
                        <div className="text-sm font-medium text-blue-900">📊 Performance de Vendas</div>
                        <div className="text-sm text-blue-700 mt-1">
                          💰 Total vendido: <span className="font-medium">R$ {stats.totalSales.toFixed(2)}</span>
                        </div>
                        <div className="text-sm text-blue-700">
                          📦 Vendas realizadas: <span className="font-medium">{stats.salesCount}</span>
                        </div>
                        {stats.salesCount > 0 && (
                          <div className="text-sm text-blue-700">
                            📈 Ticket médio: <span className="font-medium">R$ {(stats.totalSales / stats.salesCount).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      member.status === 'Ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : member.status === 'Inativo'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member.status}
                    </div>
                    {stats && (
                      <div className="text-xs text-right text-muted-foreground">
                        Top {salesStats.findIndex(s => s.id === member.id) + 1}º vendedor
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          }) : (
            <div className="text-center py-12">
              <div className="text-sm text-muted-foreground">Nenhum membro da equipe encontrado.</div>
              <div className="text-xs text-muted-foreground mt-1">
                Esta loja ainda não possui vendedores cadastrados.
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  )
}

export default function TeamPage() {
  return (
    <Suspense fallback={
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Equipe</h1>
        <p className="text-muted-foreground mt-2">Gestão de vendedores e colaboradores.</p>
        <div className="mt-4 text-sm text-muted-foreground">Carregando...</div>
      </main>
    }>
      <TeamPageContent />
    </Suspense>
  )
}