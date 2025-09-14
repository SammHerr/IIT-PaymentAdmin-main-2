// hooks/useDashboardSummary.ts
"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export type DashboardSummary = {
  period: { year: number; month: number }
  totalStudents: number
  activeStudents: number
  expectedAmount: number
  collectedAmount: number
  collectionPercentage: number
  overduePayments: number
  totalLateFees: number
  breakdown: {
    monthlyNormal: number
    inscriptions: number
    lateFees: number
  }
}

export function useDashboardSummary(month?: number, year?: number) {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    api
      .get("/dashboard/summary", {
        params: { month, year },
      })
      .then((res) => {
        if (!mounted) return
        setData(res.data.data)
      })
      .catch((err) => {
        if (!mounted) return
        setError(err?.response?.data?.error ?? "Error al cargar resumen")
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [month, year])

  return { data, loading, error }
}
