"use client"

import { Suspense } from "react"
import { DashboardContent } from "@/components/dashboard-content"

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
