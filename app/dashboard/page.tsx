"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Clock, CheckCircle, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'



type OrderByType = {
  type: string
  count: number
  color: string
}

//Para el grafico torta
const filters = [
  { label: 'Hoy', value: 'day' },
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
]

//Para el grafico de lineas
const orderTypes = [
  { label: 'Instalación', value: 'INSTALACION' },
  { label: 'Reconexión', value: 'RECONEXION' },
  { label: 'Corte', value: 'CORTE' },
]
const timeRanges = [
  { label: 'Última semana', value: 'week' },
  { label: 'Último mes', value: 'month' },
]


export default function DashboardPage() {
  const [userRole, setUserRole] = useState("")
  const [username, setUsername] = useState("")

  const [typeFilter, setTypeFilter] = useState('INSTALACION')
  const [rangeFilter, setRangeFilter] = useState('week')
  const [chartData, setChartData] = useState([])


  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/ordenTrabajo/tendencia?type=${typeFilter}&range=${rangeFilter}`)
      const data = await res.json()
      setChartData(data)
    }
    fetchData()
  }, [typeFilter, rangeFilter])


  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") || "")
    setUsername(localStorage.getItem("username") || "")
  }, [])

  const dashboardData = {
    totalOrders: 1247,
    pendingOrders: 89,
    completedOrders: 1158,
    inProgressOrders: 45,
    todayOrders: 23,
    technicians: 15,
    clients: 342,
    //efficiency: 94.2,
  }





  const [filter, setFilter] = useState('day')
  const [data, setData] = useState<OrderByType[]>([])

  useEffect(() => {
    fetch(`/api/ordenTrabajo/cantidad_tipo_dash?filter=${filter}`)
      .then((res) => res.json())
      .then(setData)
  }, [filter])

  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null





  /*const ordersByType = [
    { type: "Instalación", count: 456, color: "bg-green-500" },
    { type: "Reconexión", count: 234, color: "bg-blue-500" },
    { type: "Corte", count: 189, color: "bg-red-500" },
    { type: "Mantenimiento", count: 156, color: "bg-yellow-500" },
    { type: "Reparación", count: 212, color: "bg-purple-500" },
  ]*/



  const recentOrders = [
    { id: "OT-2024-001", client: "Juan Pérez", type: "Instalación", status: "En Progreso", technician: "Carlos López" },
    { id: "OT-2024-002", client: "María García", type: "Reconexión", status: "Completada", technician: "Ana Martín" },
    { id: "OT-2024-003", client: "Pedro Ruiz", type: "Corte", status: "Pendiente", technician: "Luis Torres" },
    {
      id: "OT-2024-004",
      client: "Carmen Silva",
      type: "Mantenimiento",
      status: "En Progreso",
      technician: "José Díaz",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completada":
        return "bg-green-500"
      case "En Progreso":
        return "bg-blue-500"
      case "Pendiente":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-700 bg-slate-800/50 backdrop-blur-xl px-4">
            <SidebarTrigger className="-ml-1 text-white" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white">Dashboard - {userRole}</h1>
              <p className="text-sm text-slate-300">Bienvenido, {username}</p>
            </div>
          </header>
          <div className="flex-1 space-y-6 p-6">
            {/* Métricas principales */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Total Órdenes</CardTitle>
                  <BarChart3 className="h-4 w-4 text-cyan-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{dashboardData.totalOrders}</div>
                  <p className="text-xs text-slate-400">
                    <span className="text-emerald-400">+12%</span> desde el mes pasado
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Pendientes</CardTitle>
                  <Clock className="h-4 w-4 text-amber-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{dashboardData.pendingOrders}</div>
                  <p className="text-xs text-slate-400">
                    <span className="text-red-400">+5</span> desde ayer
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Completadas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{dashboardData.completedOrders}</div>
                  <p className="text-xs text-slate-400">
                    <span className="text-emerald-400">+18</span> hoy
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Órdenes por tipo */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Órdenes por Tipo</CardTitle>
                  <CardDescription className="text-slate-400">Distribución de órdenes de trabajo</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-row items-center gap-8">
                  {/* Listado de órdenes */}
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-center gap-2 mt-2">
                      {filters.map((f) => (
                        <Button
                          key={f.value}
                          variant={filter === f.value ? 'default' : 'outline'}
                          onClick={() => setFilter(f.value)}
                          className="text-xs"
                        >
                          {f.label}
                        </Button>
                      ))}
                    </div>

                    {data.map((order, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: order.color }}></div>
                          <span className="text-slate-200">{order.type}</span>
                        </div>
                        <Badge variant="secondary" className="bg-slate-700 text-white">
                          {order.count}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* Gráfico de torta */}
                  <div className="w-[300px] flex justify-center items-center">
                    <PieChart width={300} height={300}>
                      <Pie
                        data={data}
                        dataKey="count"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </div>
                </CardContent>

              </Card>

              {/* Órdenes recientes */}


              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-white">Tendencia de Usuarios</CardTitle>
                      <CardDescription className="text-slate-400">
                        Instalaciones, Reconexiones y Cortes
                      </CardDescription>
                    </div>
                    <Select value={rangeFilter} onValueChange={setRangeFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeRanges.map((range) => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {orderTypes.map((t) => (
                      <Button
                        key={t.value}
                        variant={typeFilter === t.value ? 'default' : 'outline'}
                        className="text-xs"
                        onClick={() => setTypeFilter(t.value)}
                      >
                        {t.label}
                      </Button>
                    ))}
                  </div>
                </CardHeader>

                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <XAxis dataKey="date" stroke="#CBD5E1" />
                      <YAxis stroke="#CBD5E1" />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Métricas adicionales según el rol */}
            {userRole === "ADMINISTRADOR" && (
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-200">Técnicos Activos</CardTitle>
                    <Users className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{dashboardData.technicians}</div>
                    <p className="text-xs text-slate-400">15 de 18 disponibles</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-200">Clientes</CardTitle>
                    <Users className="h-4 w-4 text-emerald-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{dashboardData.clients}</div>
                    <p className="text-xs text-slate-400">+8 nuevos este mes</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-200">Órdenes Hoy</CardTitle>
                    <Calendar className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{dashboardData.todayOrders}</div>
                    <p className="text-xs text-slate-400">Meta: 25 órdenes</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
