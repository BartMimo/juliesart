import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { TodoOrderList } from '@/components/admin/todo-order-list'

export const metadata: Metadata = { title: 'To do' }

export default async function AdminTodoPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, order_number, email, customer_name, status, total, created_at,
      shipping_name, shipping_city,
      items:order_items(
        id, product_name, quantity, unit_price,
        personalizations:order_item_personalizations(field_label, display_value, value)
      )
    `)
    .in('status', ['paid', 'processing'])
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800">To do</h1>
        <p className="text-neutral-500 text-sm mt-1">
          {orders?.length ?? 0} bestelling(en) om te verzenden
        </p>
      </div>

      <TodoOrderList orders={orders ?? []} />
    </div>
  )
}
