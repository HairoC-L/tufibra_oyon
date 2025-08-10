import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { subDays, startOfWeek, startOfMonth, format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')?.toUpperCase()
  const range = searchParams.get('range') || 'week'

  if (!type) {
    return new Response(JSON.stringify({ error: 'Missing type' }), { status: 400 })
  }

  let fromDate = new Date()
  switch (range) {
    case 'week':
      fromDate = subDays(new Date(), 7)
      break
    case 'month':
      fromDate = subDays(new Date(), 30)
      break
    default:
      return new Response(JSON.stringify({ error: 'Invalid range' }), { status: 400 })
  }
  const tipo = await prisma.tipo_trabajo.findFirst({
    where: {
      tip_nombre: type,
    },
    select: {
      tip_id: true,
    },
  })

  if (!tipo) {
    return new Response(JSON.stringify([]))
  }
  const orders = await prisma.orden_trabajo.findMany({
    where: {
      tip_id: tipo.tip_id,
      ord_fecha_asignacion: {
        gte: fromDate,
      },
    },
    select: {
      ord_fecha_asignacion: true,
    },
  })
const grouped: Record<string, number> = {}

for (const order of orders) {
  if (!order.ord_fecha_asignacion) continue

  const localDate = new Date(order.ord_fecha_asignacion.getTime() - order.ord_fecha_asignacion.getTimezoneOffset() * 60000)
  const dateKey = localDate.toISOString().split('T')[0]

  grouped[dateKey] = (grouped[dateKey] || 0) + 1
}


  const result = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
