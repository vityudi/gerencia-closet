import { createSupabaseServiceClient } from '@/lib/supabase/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createSupabaseServiceClient()
    
    // Get sales statistics by team member
    const { data, error } = await supabase
      .from('sales')
      .select(`
        team_member_id,
        total,
        status,
        team_members (
          id,
          full_name,
          role
        )
      `)
      .eq('store_id', id)
      .eq('status', 'Concluída') // Only completed sales for statistics

    if (error) {
      console.error('Error fetching sales stats:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    // Group sales by team member and calculate totals
    const statsMap = new Map()
    
    data?.forEach(sale => {
      if (sale.team_members && Array.isArray(sale.team_members) && sale.team_members.length > 0) {
        const teamMember = sale.team_members[0] // Get first team member (should be only one)
        const memberId = sale.team_member_id
        if (!statsMap.has(memberId)) {
          statsMap.set(memberId, {
            id: memberId,
            name: teamMember.full_name,
            role: teamMember.role,
            totalSales: 0,
            totalAmount: 0,
            salesCount: 0
          })
        }
        
        const stats = statsMap.get(memberId)
        stats.totalAmount += Number(sale.total)
        stats.salesCount += 1
        stats.totalSales = stats.totalAmount
      } else if (sale.team_members && !Array.isArray(sale.team_members)) {
        // Handle case where team_members is a single object
        const teamMember = sale.team_members as { full_name: string; role: string }
        const memberId = sale.team_member_id
        if (!statsMap.has(memberId)) {
          statsMap.set(memberId, {
            id: memberId,
            name: teamMember.full_name,
            role: teamMember.role,
            totalSales: 0,
            totalAmount: 0,
            salesCount: 0
          })
        }
        
        const stats = statsMap.get(memberId)
        stats.totalAmount += Number(sale.total)
        stats.salesCount += 1
        stats.totalSales = stats.totalAmount
      }
    })

    // Convert map to array and sort by total sales
    const salesStats = Array.from(statsMap.values())
      .sort((a, b) => b.totalSales - a.totalSales)

    return Response.json({ items: salesStats })
  } catch (err) {
    console.error('Unexpected error in sales stats GET:', err)
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), { status: 500 })
  }
}