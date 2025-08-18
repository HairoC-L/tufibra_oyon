"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { PieChart, Pie, Cell, Tooltip, Legend, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, BarChart } from 'recharts'
import { Button } from '@/components/ui/button'
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, User, Building, Clock, CheckCircle, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'



type OrderByType = {
  type: string
  count: number
  color: string
}

interface Client {
  cli_id: string
  cli_tipo: string
  cli_nombre: string
  cli_apellido: string
  cli_razonsoci: string
  cli_dni: string
  cli_ruc: string
  cli_direccion: string
  cli_coordenada: string
  cli_cel: string
  num_con: string
  id_serv: string
  serv_nombre: string
  fecha_registro: string
  fecha_inicio: string
  estado: string
  usu_nombre: string
  id_caja: string
  id_nodo: number
}

type PieDataItem = {
  type: string;
  count: number;
  color: string;
};

type NodoData = {
  nodo: string;
  cantidad: number;
};



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
  const [clients, setClients] = useState<Client[]>([])
  const [cantidaxservicio, setcantidaxservicio] = useState<PieDataItem[]>([]);


  const [dataa, setDataa] = useState<NodoData[]>([]);



  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
    '#AF19FF', '#FF4560', '#00B8D9', '#FF66C3'
  ];


  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/dashboard/cantidadxnodo');
      const result = await res.json();
      setDataa(result);
    };

    fetchData();
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/dashboard/cantidadxservicio');
      const result = await res.json();



      const pieData: PieDataItem[] = result.map((item: any, index: number) => ({
        type: item.type,
        count: item.count,
        color: COLORS[index % COLORS.length], // asignar color ciclicamente
      }));

      setcantidaxservicio(pieData);
    };

    fetchData();
  }, []);


  useEffect(() => {
    fetchClients();
  }, []);
  const fetchClients = async () => {
    try {
      const res = await fetch("/api/cliente/clienteContrato");
      if (!res.ok) {
        console.error("Error al obtener información de los clientes:", res.status);
        return;
      }

      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error("Error parsing JSON:", err);
    }
  };

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


  function lightenColor(hex: string, percent: number) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent * 100);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return `rgb(${Math.min(255, R)}, ${Math.min(255, G)}, ${Math.min(255, B)})`;
}

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
            {/* Estadísticas rápidas */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Clientes</p>
                      <p className="text-2xl font-bold text-white">{clients.length}</p>
                    </div>
                    <User className="w-8 h-8 text-cyan-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Activos</p>
                      <p className="text-2xl font-bold text-white">
                        {clients.filter((c) => c.estado === "1").length}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Cortados</p>
                      <p className="text-2xl font-bold text-white">
                        {clients.filter((c) => c.estado === "0").length}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Nuevos (Este Mes)</p>
                      <p className="text-2xl font-bold text-white">
                        {
                          clients.filter((c) => {
                            const regDate = new Date(c.fecha_registro)
                            const now = new Date()
                            return regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear()
                          }).length
                        }
                      </p>
                    </div>
                    <Building className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Métricas principales 
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
            </div>*/}

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Órdenes por tipo */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Cantidad de usuarios por servicio</CardTitle>
                  <CardDescription className="text-slate-400"></CardDescription>
                </CardHeader>

                <CardContent className="flex flex-row items-center gap-8">

                  <div className="flex gap-6 items-center">
                    {/* Gráfico */}
                    <div className="w-[300px] flex justify-center items-center">
                      <PieChart width={300} height={300}>
                        <Pie
                          data={cantidaxservicio}
                          dataKey="count"
                          nameKey="type"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {cantidaxservicio.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </div>

                    {/* Leyenda personalizada */}
                    <div className="flex-1 space-y-4">
                      {cantidaxservicio.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-gray-200 dark:text-slate-200 text-sm">{item.type}</span>
                          </div>
                          <Badge variant="secondary" className="bg-slate-700 text-white">
                            {item.count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Listado de órdenes 
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
                  */}

                  {/* Gráfico de torta 
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
                  </div>*/}
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
            <div className="grid gap-6">
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Cantidad de usuarios por Nodo</CardTitle>
                  <CardDescription className="text-slate-400"></CardDescription>
                </CardHeader>

                <CardContent className="flex flex-row items-center gap-8">
                  <div className="w-full h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dataa}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="nodo"
                          angle={-25}
                          textAnchor="end"
                          interval={0}
                          height={60}
                          style={{ fontSize: 12 }}
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="cantidad" fill="#4F46E5" name="Contratos Activos" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Métricas adicionales según el rol 
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
            )}*/}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
