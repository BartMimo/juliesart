'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { OrderStatus } from '@/types'
import { ORDER_STATUSES } from '@/lib/constants'
import { getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils'
import { useToast } from '@/components/ui/toaster'

interface OrderStatusSelectProps {
  orderId: string
  currentStatus: OrderStatus
  onUpdate?: (newStatus: OrderStatus) => void
}

export function OrderStatusSelect({ orderId, currentStatus, onUpdate }: OrderStatusSelectProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleChange = async (newStatus: OrderStatus) => {
    if (newStatus === status) return
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Update failed')

      setStatus(newStatus)
      onUpdate?.(newStatus)
      toast.success('Status bijgewerkt', `Bestelling is nu "${getOrderStatusLabel(newStatus)}".`)
    } catch {
      toast.error('Kon status niet bijwerken')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value as OrderStatus)}
        disabled={loading}
        className={`pl-3 pr-8 py-1.5 rounded-full text-xs font-semibold border cursor-pointer appearance-none
          focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all disabled:opacity-60
          ${getOrderStatusColor(status)}`}
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {loading && (
        <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-current" />
      )}
    </div>
  )
}
