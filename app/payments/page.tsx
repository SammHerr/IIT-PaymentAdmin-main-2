import PaymentsTable from '@/components/payments/PaymentsTable'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function PaymentsPage() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Control de Pagos</h1>
      </div>
      <PaymentsTable />
    </div>
  )
}
