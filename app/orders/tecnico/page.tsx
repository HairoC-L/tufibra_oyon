"use client"

import { useState, useRef, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Edit, Eye, Filter } from "lucide-react"
import Listado_Tecnicos from "@/components/filtrado_tec";
import Listado_Clientes from "@/components/filtrado_cli";

import {
  Truck,
  MapPin,
  Wrench,
  CheckCircle
} from 'lucide-react';


type TipoTrabajo = {
  tip_id: number
  tip_nombre: string
}

type Tecnicos = {
  tec_id: number
  usuario: {
    usu_nombre: string
  }
}

type Clientes = {
  cli_id: number
  cli_nombre: string
  cli_dni: string
  cli_direccion: string
}

interface WorkOrder {
  id: string
  client: string
  type: string
  status: string
  priority: string
  technician: string
  createdDate: string
  scheduledDate: string
  description: string
  address: string
}




export default function OrdersPage() {



  const [tipoTrabajos, setTipoTrabajos] = useState<TipoTrabajo[]>([])
  const [tecnicos, setTecnicos] = useState<Tecnicos[]>([])
  const [clientes, setClientes] = useState<Clientes[]>([])


  const [id_user, setIdUser] = useState("");

  useEffect(() => {
    const storedId = localStorage.getItem("userId") || "";
    setIdUser(storedId);
  }, []);

  useEffect(() => {
    if (id_user) {
      setNewOrdenTrabajo((prev) => ({
        ...prev,
        per_id: id_user,
      }));
    }
  }, [id_user]);

  useEffect(() => {
    fetchOrdenesTrabajo();
  }, []);


  const [newOrdenTrabajo, setNewOrdenTrabajo] = useState({
    descripcion: "",
    fecha_asignacion: "",
    prioridad: "",
    tec_id: "",
    per_id: "",
    cli_id: "",
    tip_id: "",
    tecnico: "",
    cliente: "",
    direccion: "",
  });
  const [orders, setOrders] = useState<WorkOrder[]>([])


  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null)
  const [showNotification, setShowNotification] = useState(false);


  //Carga de tipo de trabajos
  useEffect(() => {
    const fetchTipoTrabajos = async () => {
      try {
        const res = await fetch("/api/tipoTrabajo")
        const data = await res.json()

        setTipoTrabajos(data)
      } catch (err) {
        console.error("Error cargando tipo de trabajos:", err)
      }
    }
    fetchTipoTrabajos()
  }, [])



  const getStatusColor = (status: string) => {
    switch (status) {
      case "Finalizado":
        return "bg-green-500"
      case "En Proceso":
        return "bg-blue-500"
      case "Pendiente":
        return "bg-yellow-500"
      case "Cancelada":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  //Carga de tecnicos disponibles
  useEffect(() => {
    const fetchTecnicos = async () => {
      try {
        const res = await fetch("/api/technician/tecnicosDisponibles")
        const data = await res.json()
        setTecnicos(data)
      } catch (err) {
        console.error("Error al cargar técnicos:", err)
      }
    }
    fetchTecnicos()
  }, [])


  //Carga de clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await fetch("/api/cliente")
        const data = await res.json()
        setClientes(data)
      } catch (err) {
        console.error("Error al cargar clientes:", err)
      }
    }
    fetchClientes()
  }, [])


  //Carga de ordenes de trabajo
  const fetchOrdenesTrabajo = async () => {
    try {
      const res = await fetch("/api/ordenTrabajo");
      if (!res.ok) {
        console.error("Error al obtener las ordenes de trabajo:", res.status);
        return;
      }

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Error parsing JSON:", err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "bg-red-500"
      case "Media":
        return "bg-yellow-500"
      case "Baja":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || order.status === filterStatus
    return matchesSearch && matchesFilter
  })


  const handleEditOrder = () => {
    if (selectedOrder) {
      setOrders(orders.map((order) => (order.id === selectedOrder.id ? selectedOrder : order)))
      setIsEditModalOpen(false)
      setSelectedOrder(null)
    }
  }


  const getStatusStep = (status: string) => {
    const steps = ['En ruta', 'En sitio', 'En progreso', 'Finalizado'];
    return steps.indexOf(status);
  };

  const handleStepClick = (newStatus: string) => {
    // Aquí puedes cambiar el estado o hacer una llamada a una API
    console.log("Nuevo estado:", newStatus);
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'En ruta':
        return <Truck size={20} />;
      case 'En sitio':
        return <MapPin size={20} />;
      case 'En progreso':
        return <Wrench size={20} />;
      case 'Finalizado':
        return <CheckCircle size={20} />;
      default:
        return null;
    }
  };


  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-700 bg-gray-800/50 backdrop-blur-xl px-4">
            <SidebarTrigger className="-ml-1 text-white" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white">Gestión de Órdenes de Trabajo</h1>
              <p className="text-sm text-gray-400">Ordenes de trabajo asignados</p>
            </div>
          </header>

          {showNotification && (
            <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300">
              ¡Orden creada!
            </div>
          )}

          <div className="flex-1 space-y-6 p-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Órdenes de Trabajo</CardTitle>
                    <CardDescription className="text-gray-400">
                      Gestiona tus órdenes de trabajo
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por cliente, ID o tipo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600 text-white">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="En Proceso">En Proceso</SelectItem>
                      <SelectItem value="Finalizada">Finalizada</SelectItem>
                      <SelectItem value="Cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border border-gray-700 bg-gray-800/30">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-200">ID</TableHead>
                        <TableHead className="text-gray-200">Cliente</TableHead>
                        <TableHead className="text-gray-200">Tipo</TableHead>
                        <TableHead className="text-gray-200">Estado</TableHead>
                        <TableHead className="text-gray-200">Prioridad</TableHead>
                        <TableHead className="text-gray-200">Técnico</TableHead>
                        <TableHead className="text-gray-200">Fecha Programada</TableHead>
                        <TableHead className="text-gray-200">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id} className="border-gray-700">
                          <TableCell className="text-white font-medium">{order.id}</TableCell>
                          <TableCell className="text-gray-200">{order.client}</TableCell>
                          <TableCell className="text-gray-200">{order.type}</TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(order.status)} text-white`}>{order.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getPriorityColor(order.priority)} text-white`}>{order.priority}</Badge>
                          </TableCell>
                          <TableCell className="text-gray-200">{order.technician}</TableCell>
                          <TableCell className="text-gray-200">{order.scheduledDate}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setIsViewModalOpen(true)
                                }}
                                className="text-slate-400 hover:text-white"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setIsEditModalOpen(true)
                                }}
                                className="text-slate-400 hover:text-white"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de visualización */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles de la Orden de Trabajo</DialogTitle>
              <DialogDescription className="text-gray-400">
                Información completa de la orden {selectedOrder?.id}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Cliente</Label>
                    <p className="text-white">{selectedOrder.client}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Tipo de Trabajo</Label>
                    <p className="text-white">{selectedOrder.type}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Estado</Label>
                    <Badge className={`${getStatusColor(selectedOrder.status)} text-white mt-1`}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-gray-400">Prioridad</Label>
                    <Badge className={`${getPriorityColor(selectedOrder.priority)} text-white mt-1`}>
                      {selectedOrder.priority}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Técnico Asignado</Label>
                    <p className="text-white">{selectedOrder.technician}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Fecha Programada</Label>
                    <p className="text-white">{selectedOrder.scheduledDate}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400">Dirección</Label>
                  <p className="text-white">{selectedOrder.address}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Descripción</Label>
                  <p className="text-white">{selectedOrder.description}</p>
                </div>

                {selectedOrder && (
                  <div className="mt-6">
                    <Label className="text-gray-400 mb-2 block">Seguimiento</Label>
                    <div className="flex items-center justify-between relative">
                      {['En ruta', 'En sitio', 'En progreso', 'Finalizado'].map((step, index) => {
                        const isActive = index <= getStatusStep(selectedOrder.status);
                        return (
                          <div
                            key={step}
                            className="flex flex-col items-center cursor-pointer z-10"
                            onClick={() => handleStepClick(step)}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center
              ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300'}`}>
                              {getStepIcon(step)}
                            </div>
                            <span className="text-sm mt-1 text-gray-300">{step}</span>
                          </div>
                        );
                      })}
                      <div className="absolute top-5 left-5 right-5 h-1 bg-gray-600 z-0">
                        <div
                          className="h-1 bg-blue-500 transition-all duration-300"
                          style={{ width: `${(getStatusStep(selectedOrder.status) / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>



        </Dialog>

        {/* Modal de edición */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Actualizar Estado de Orden</DialogTitle>
              <DialogDescription className="text-gray-400">
                Orden #{selectedOrder?.id}
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Cliente</Label>
                    <p className="text-white">{selectedOrder.client}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Tipo de Trabajo</Label>
                    <p className="text-white">{selectedOrder.type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Prioridad</Label>
                    <p className="text-white">{selectedOrder.priority}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Técnico Asignado</Label>
                    <p className="text-white">{selectedOrder.technician}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Fecha Programada</Label>
                    <p className="text-white">{selectedOrder.scheduledDate}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Dirección</Label>
                    <p className="text-white">{selectedOrder.address}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400">Descripción</Label>
                  <p className="text-white">{selectedOrder.description}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status">Estado</Label>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) =>
                      setSelectedOrder({ ...selectedOrder, status: value })
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="En ruta">En ruta</SelectItem>
                      <SelectItem value="En sitio">En sitio</SelectItem>
                      <SelectItem value="En progreso">En progreso</SelectItem>
                      <SelectItem value="Finalizado">Finalizado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 text-black">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)} 
                className="hover:bg-gray-600 hover:text-white transition">
                Cancelar
              </Button>
              <Button
                onClick={handleEditOrder}
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 text-white hover:to-blue-700 transition"
              >
                Actualizar Estado
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </SidebarInset>
    </SidebarProvider>
  )
}
