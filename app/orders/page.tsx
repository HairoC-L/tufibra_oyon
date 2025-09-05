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
      //order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || order.status === filterStatus
    return matchesSearch && matchesFilter
  })



  //creacion de ordenes de trabajo
  const handleCreateOrder = async () => {
    try {
      const res = await fetch("/api/ordenTrabajo", {
        method: "POST",
        body: JSON.stringify({
          ...newOrdenTrabajo,
          cli_id: parseInt(newOrdenTrabajo.cli_id),
          tec_id: parseInt(newOrdenTrabajo.tec_id),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (data.error) {
        console.error("Error:", data.error);
      } else {
        console.log("Orden creada:", data.orden);
        setIsCreateModalOpen(false);
        setNewOrdenTrabajo({
          descripcion: "",
          fecha_asignacion: "",
          prioridad: "",
          tec_id: "",
          per_id: id_user,
          cli_id: "",
          tip_id: "",
          tecnico: "",
          cliente: "",
          direccion: "",
        });
        setShowNotification(true);
        await fetchOrdenesTrabajo();

        setTimeout(() => setShowNotification(false), 2000);
      }
    } catch (error) {
      console.error("Error al crear el técnico:", error);
    }
  };

  const handleEditOrder = () => {
    if (selectedOrder) {
      setOrders(orders.map((order) => (order.id === selectedOrder.id ? selectedOrder : order)))
      setIsEditModalOpen(false)
      setSelectedOrder(null)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-700 bg-gray-800/50 backdrop-blur-xl px-4">
            <SidebarTrigger className="-ml-1 text-white" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white">Gestión de Órdenes de Trabajo</h1>
              <p className="text-sm text-gray-400">Administra todas las órdenes de trabajo</p>
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
                      Gestiona y supervisa todas las órdenes de trabajo
                    </CardDescription>
                  </div>
                  <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Orden
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Crear Nueva Orden de Trabajo</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Completa los datos para crear una nueva orden de trabajo
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Listado_Clientes
                          clientes={clientes}
                          newOrder={newOrdenTrabajo}
                          setNewOrder={setNewOrdenTrabajo}
                        />
                        <div className="space-y-2">
                          <Label htmlFor="address">Dirección</Label>
                          <Input
                            id="address"
                            value={newOrdenTrabajo.direccion || ""}
                            disabled
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        <Listado_Tecnicos
                          tecnicos={tecnicos}
                          newOrder={newOrdenTrabajo}
                          setNewOrder={setNewOrdenTrabajo}
                        />
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="priority">Prioridad</Label>
                            <Select
                              value={newOrdenTrabajo.prioridad}
                              onValueChange={(value) =>
                                setNewOrdenTrabajo({ ...newOrdenTrabajo, prioridad: value })
                              }
                            >
                              <SelectTrigger className="bg-gray-700 border-gray-600">
                                <SelectValue placeholder="Seleccionar prioridad" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                <SelectItem value="Alta">Alta</SelectItem>
                                <SelectItem value="Media">Media</SelectItem>
                                <SelectItem value="Baja">Baja</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="type">Tipo de Trabajo</Label>
                            <Select
                              value={newOrdenTrabajo.tip_id}
                              onValueChange={(value) =>
                                setNewOrdenTrabajo({ ...newOrdenTrabajo, tip_id: value })
                              }
                            >
                              <SelectTrigger className="bg-gray-700 border-gray-600">
                                <SelectValue placeholder="Seleccionar tipo" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                {tipoTrabajos.map((trab) => (
                                  <SelectItem key={trab.tip_id} value={trab.tip_id.toString()}>
                                    {trab.tip_nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="scheduledDate">Fecha Programada</Label>
                            <Input
                              id="scheduledDate"
                              type="date"
                              value={newOrdenTrabajo.fecha_asignacion || ""}
                              onChange={(e) =>
                                setNewOrdenTrabajo({
                                  ...newOrdenTrabajo,
                                  fecha_asignacion: e.target.value,
                                })
                              }
                              className="bg-gray-700 border-gray-600"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Descripción</Label>
                          <Textarea
                            id="description"
                            value={newOrdenTrabajo.descripcion}
                            onChange={(e) =>
                              setNewOrdenTrabajo({
                                ...newOrdenTrabajo,
                                descripcion: e.target.value,
                              })
                            }
                            className="bg-gray-700 border-gray-600"
                            rows={3}
                          />
                        </div>

                        <input
                          type="hidden"
                          name="per_id"
                          value={newOrdenTrabajo.per_id || ""}
                        />
                      </div>

                      <div className="flex justify-end space-x-2 text-black">
                        <Button
                          variant="outline"
                          onClick={() => setIsCreateModalOpen(false)}
                          className="hover:bg-gray-600 hover:text-white transition"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleCreateOrder}
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 text-white hover:to-blue-700 transition"
                        >
                          Crear Orden
                        </Button>
                      </div>
                    </DialogContent>

                  </Dialog>
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
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de edición */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Orden de Trabajo</DialogTitle>
              <DialogDescription className="text-gray-400">
                Modifica los datos de la orden {selectedOrder?.id}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-client">Cliente</Label>
                    <Input
                      id="edit-client"
                      value={selectedOrder.client}
                      onChange={(e) => setSelectedOrder({ ...selectedOrder, client: e.target.value })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Tipo de Trabajo</Label>
                    <Select
                      value={selectedOrder.type}
                      onValueChange={(value) => setSelectedOrder({ ...selectedOrder, type: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Instalación">Instalación</SelectItem>
                        <SelectItem value="Reconexión">Reconexión</SelectItem>
                        <SelectItem value="Corte">Corte</SelectItem>
                        <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                        <SelectItem value="Reparación">Reparación</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Estado</Label>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) => setSelectedOrder({ ...selectedOrder, status: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="En Progreso">En Progreso</SelectItem>
                        <SelectItem value="Completada">Completada</SelectItem>
                        <SelectItem value="Cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-priority">Prioridad</Label>
                    <Select
                      value={selectedOrder.priority}
                      onValueChange={(value) => setSelectedOrder({ ...selectedOrder, priority: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Media">Media</SelectItem>
                        <SelectItem value="Baja">Baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-technician">Técnico Asignado</Label>
                  <Select
                    value={selectedOrder.technician}
                    onValueChange={(value) => setSelectedOrder({ ...selectedOrder, technician: value })}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="Carlos López">Carlos López</SelectItem>
                      <SelectItem value="Ana Martín">Ana Martín</SelectItem>
                      <SelectItem value="Luis Torres">Luis Torres</SelectItem>
                      <SelectItem value="José Díaz">José Díaz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-scheduledDate">Fecha Programada</Label>
                  <Input
                    id="edit-scheduledDate"
                    type="date"
                    value={selectedOrder.scheduledDate}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, scheduledDate: e.target.value })}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Dirección</Label>
                  <Input
                    id="edit-address"
                    value={selectedOrder.address}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, address: e.target.value })}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Descripción</Label>
                  <Textarea
                    id="edit-description"
                    value={selectedOrder.description}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, description: e.target.value })}
                    className="bg-gray-700 border-gray-600"
                    rows={3}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditOrder} className="bg-gradient-to-r from-cyan-500 to-blue-600">
                Guardar Cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
