"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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
import { Plus, Search, Edit, Eye, Phone, Mail, MapPin, User, Building, UserIcon, MapPinIcon, BriefcaseIcon, PlusCircle } from "lucide-react"
import Listado_Tecnicos from "@/components/filtrado_tec";
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';





type servicios = {
  serv_id: number
  serv_nombre: string
}

type Tecnicos = {
  tec_id: number
  usuario: {
    usu_nombre: string
  }
}

type nodo = {
  id_nodo: number
  nombre: string
}

type caja = {
  id_caja: number
  nombre: string
  id_nodo: number
}

type tipo_comprobante = {
  id_tipo: number
  tipo: string
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
  serv_nombre: string
  fecha_registro: string
  fecha_inicio: string
  estado: string
  usu_nombre: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])

  const [tecnicos, setTecnicos] = useState<Tecnicos[]>([])

  const [nodos, setNodos] = useState<nodo[]>([])

  const [cajas, setCajas] = useState<caja[]>([])

  const [tipo_comrprobante, setTipoComprobante] = useState<tipo_comprobante[]>([])

  const [selectedNodo, setSelectedNodo] = useState<string | undefined>(undefined);

  const [servicios, setServicios] = useState<servicios[]>([])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)


  const [newClient, setNewClient] = useState({
    id: "",
    nombre: "",
    apellido: "",
    razon_social: "",
    dni: "",
    ruc: "",
    direccion: "",
    celular: "",
    num_contrato: "",
    tipoServicio: "",
    fechaRegistro: "",
    fechaInicio: "",
    estado: "",
    id_user: "",
    tec_id: "",
    coordenada: "",
    id_caja: "",
    tipoComprobante: "",
  })
  const [clientType, setClientType] = useState<"natural" | "juridica">("natural");


  const [id_user, setIdUser] = useState("");

  const cajasFiltradas = cajas.filter(caja => caja.id_nodo === Number(selectedNodo));


  const getStatusColor = (status: string) => {
    switch (status) {
      case "Activo":
        return "bg-green-500"
      case "Suspendido":
        return "bg-red-500"
      case "Inactivo":
        return "bg-gray-500"
      case "Pendiente":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }
  //Carga de servicios
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const res = await fetch("/api/servicios")
        const data = await res.json()
        setServicios(data)
      } catch (err) {
        console.error("Error al cargar los servicios:", err)
      }
    }

    fetchServicios()
  }, [])



  //Carga de nodos y cajas
  useEffect(() => {
    const fetchNodos = async () => {
      try {
        const res = await fetch("/api/nodo")
        const data = await res.json()
        setNodos(data)
      } catch (err) {
        console.error("Error al cargar nodos:", err)
      }
    }
    fetchNodos()
  }, [])
  useEffect(() => {
    const fetchCajas = async () => {
      try {
        const res = await fetch("/api/caja")
        const data = await res.json()
        setCajas(data)
      } catch (err) {
        console.error("Error al cargar cajas:", err)
      }
    }
    fetchCajas()
  }, [])


  //Carga de tipos de comprobante
  useEffect(() => {
    const fetchTipoComprobante = async () => {
      try {
        const res = await fetch("/api/tipoComprobante")
        const data = await res.json()
        setTipoComprobante(data)
      } catch (err) {
        console.error("Error al cargar tipos de comprobante:", err)
      }
    }
    fetchTipoComprobante()
  }, [])

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






  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.cli_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cli_dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cli_razonsoci.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cli_ruc.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || client.estado === filterStatus
    return matchesSearch && matchesFilter
  })


  //Carga de clientes y contratos

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

  const handleCreateClient = async () => {
    try {
      const res = await fetch("/api/cliente/agregar", {
        method: "POST",
        body: JSON.stringify({ ...newClient }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Cliente creado correctamente");
      setIsCreateModalOpen(false);
      setNewClient({
        id: "",
        nombre: "",
        apellido: "",
        razon_social: "",
        dni: "",
        ruc: "",
        direccion: "",
        celular: "",
        num_contrato: "",
        tipoServicio: "",
        fechaRegistro: "",
        fechaInicio: "",
        estado: "",
        id_user: id_user,
        tec_id: "",
        coordenada: "",
        id_caja: "",
        tipoComprobante: "",
      });
      fetchClients();
      setCurrentStep(1);
    } catch (error) {
      toast.error("Error inesperado al crear el cliente");
      console.error("Error al crear el cliente:", error);
    }
  };



  useEffect(() => {
    const storedId = localStorage.getItem("userId") || "";
    setIdUser(storedId);
  }, []);

  useEffect(() => {
    if (id_user) {
      setNewClient((prev) => ({
        ...prev,
        id_user: id_user,
      }));
    }
  }, [id_user]);


  const handleEditClient = () => {
    if (selectedClient) {
      setClients(clients.map((client) => (client.cli_id === selectedClient.cli_id ? selectedClient : client)))
      setIsEditModalOpen(false)
      setSelectedClient(null)
    }
  }


  const verEnMapa = () => {
    if (!clients || clients.length === 0) {
      alert("No hay clientes para mostrar en el mapa");
      return;
    }

    const ubicaciones = clients
      .filter(c => c.cli_coordenada && c.cli_coordenada.includes(","))
      .map(c => {
        const [lat, lng] = c.cli_coordenada.split(",").map(Number);
        return {
          nombre: `${c.cli_nombre} ${c.cli_apellido}`,
          lat,
          lng,
        };
      });

    if (ubicaciones.length === 0) {
      alert("Ningún cliente tiene coordenadas válidas");
      return;
    }

    // Crear un blob con el contenido HTML
    const mapaHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Mapa de Clientes</title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
      <style>
        #map { height: 100vh; width: 100vw; }
        body { margin: 0; }
        .leaflet-popup-content-wrapper {
          font-family: sans-serif;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
      <script>
        const ubicaciones = ${JSON.stringify(ubicaciones)};
        const map = L.map('map').setView([${ubicaciones[0].lat}, ${ubicaciones[0].lng}], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const group = L.featureGroup();

        ubicaciones.forEach(c => {
          const marker = L.marker([c.lat, c.lng])
            .bindPopup('<strong>' + c.nombre + '</strong>')
            .addTo(map);
          group.addLayer(marker);
        });

        map.fitBounds(group.getBounds());
      </script>
    </body>
    </html>
  `;

    // Crear un blob y abrirlo como URL
    const blob = new Blob([mapaHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');

    // Liberar memoria cuando la ventana se cierre
    if (win) {
      win.onload = () => URL.revokeObjectURL(url);
    } else {
      alert("El navegador bloqueó la nueva ventana. Permite popups.");
    }
  };




  const [currentStep, setCurrentStep] = useState(1);

  const isStepValid = () => {
    if (currentStep === 1) {
      if (clientType === "natural") {
        return newClient.nombre && newClient.apellido && newClient.dni;
      } else {
        return newClient.razon_social && newClient.ruc;
      }
    }
    if (currentStep === 2) {
      return newClient.direccion && selectedNodo && newClient.id_caja;
    }
    if (currentStep === 3) {
      return newClient.num_contrato && newClient.tipoServicio && newClient.tipoComprobante && newClient.fechaInicio;
    }
    return false;
  };




  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-700 bg-gray-800/50 backdrop-blur-xl px-4">
            <SidebarTrigger className="-ml-1 text-white" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white">Gestión de Clientes</h1>
              <p className="text-sm text-gray-300">Administra la base de datos de clientes</p>
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

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Clientes registrados</CardTitle>
                    <CardDescription className="text-gray-400">
                      Gestiona la información de todos los clientes
                    </CardDescription>
                  </div>
                  <Button onClick={verEnMapa}>Ver en Mapa</Button>

                  <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Cliente
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl">
                      <DialogHeader className="justify-center items-center">
                        <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
                      </DialogHeader>

                      {/* Barra de progreso */}
                      <div className="flex items-center justify-between mb-6 relative">
                        {[
                          { step: 1, label: "Cliente", icon: <UserIcon className="w-5 h-5" /> },
                          { step: 2, label: "Ubicación", icon: <MapPinIcon className="w-5 h-5" /> },
                          { step: 3, label: "Servicio", icon: <BriefcaseIcon className="w-5 h-5" /> },
                        ].map(({ step, label, icon }, index, arr) => (
                          <div key={step} className="relative flex-1 flex flex-col items-center">
                            {/* Línea conectando con el siguiente paso */}
                            {index !== arr.length - 1 && (
                              <div
                                className={`absolute top-5 left-1/2 w-full h-0.5 z-0 ${currentStep > step ? "bg-cyan-600" : "bg-gray-600"
                                  }`}
                              />
                            )}

                            {/* Círculo con ícono */}
                            <div
                              className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= step ? "bg-cyan-600 text-white" : "bg-gray-600 text-gray-300"
                                }`}
                            >
                              {icon}
                            </div>
                            <span className={`mt-1 text-sm ${currentStep >= step ? "text-white" : "text-gray-400"}`}>
                              {label}
                            </span>
                          </div>
                        ))}
                      </div>


                      {/* STEP 1: Datos del Cliente */}
                      {currentStep === 1 && (
                        <>
                          <div className="my-4">
                            <ToggleGroup
                              type="single"
                              value={clientType}
                              onValueChange={(value) => value && setClientType(value as "natural" | "juridica")}
                              className="flex space-x-2"
                            >
                              <ToggleGroupItem
                                value="natural"
                                className={`px-4 py-2 rounded-md border ${clientType === "natural" ? "bg-cyan-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                  }`}
                              >
                                Persona Natural
                              </ToggleGroupItem>
                              <ToggleGroupItem
                                value="juridica"
                                className={`px-4 py-2 rounded-md border ${clientType === "juridica" ? "bg-cyan-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                  }`}
                              >
                                Persona Jurídica
                              </ToggleGroupItem>
                            </ToggleGroup>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {clientType === "natural" ? (
                              <>
                                <div className="space-y-2">
                                  <Label htmlFor="nombre">Nombre</Label>
                                  <Input id="nombre" value={newClient.nombre || ""} onChange={(e) => setNewClient({ ...newClient, nombre: e.target.value })} className="bg-gray-700 border-gray-600" required />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="apellido">Apellido</Label>
                                  <Input id="apellido" value={newClient.apellido || ""} onChange={(e) => setNewClient({ ...newClient, apellido: e.target.value })} className="bg-gray-700 border-gray-600" required />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="dni">DNI</Label>
                                  <Input id="dni" value={newClient.dni || ""} onChange={(e) => setNewClient({ ...newClient, dni: e.target.value })} className="bg-gray-700 border-gray-600" required maxLength={8} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="celular">Celular</Label>
                                  <Input id="celular" value={newClient.celular || ""} onChange={(e) => setNewClient({ ...newClient, celular: e.target.value })} className="bg-gray-700 border-gray-600" />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="space-y-2">
                                  <Label htmlFor="razonSocial">Razón Social</Label>
                                  <Input id="razonSocial" value={newClient.razon_social || ""} onChange={(e) => setNewClient({ ...newClient, razon_social: e.target.value })} className="bg-gray-700 border-gray-600" required />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="ruc">RUC</Label>
                                  <Input id="ruc" value={newClient.ruc || ""} onChange={(e) => setNewClient({ ...newClient, ruc: e.target.value })} className="bg-gray-700 border-gray-600" required maxLength={11} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                  <Label htmlFor="celular">Celular</Label>
                                  <Input id="celular" value={newClient.celular || ""} onChange={(e) => setNewClient({ ...newClient, celular: e.target.value })} className="bg-gray-700 border-gray-600" />
                                </div>
                              </>
                            )}

                          </div>
                        </>
                      )}

                      {/* STEP 2: Ubicación */}
                      {currentStep === 2 && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="direccion">Dirección</Label>
                            <Input id="direccion" value={newClient.direccion || ""} onChange={(e) => setNewClient({ ...newClient, direccion: e.target.value })} className="bg-gray-700 border-gray-600" required />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                            <div className="space-y-2">
                              <Label htmlFor="nodo">Nodo</Label>
                              <Select value={selectedNodo} onValueChange={setSelectedNodo}>
                                <SelectTrigger className="bg-gray-700 border-gray-600">
                                  <SelectValue placeholder="Seleccionar Nodo" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                  {nodos.map((nod) => (
                                    <SelectItem key={nod.id_nodo} value={nod.id_nodo.toString()}>
                                      {nod.nombre}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>


                            <div className="space-y-2">
                              <Label htmlFor="caja">Caja</Label>
                              <Select value={newClient.id_caja} onValueChange={(value) => setNewClient({ ...newClient, id_caja: value })} disabled={!selectedNodo}>
                                <SelectTrigger className="bg-gray-700 border-gray-600">
                                  <SelectValue placeholder="Seleccionar Caja" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                  {cajasFiltradas.map((caj) => (
                                    <SelectItem key={caj.id_caja} value={caj.id_caja.toString()}>
                                      {caj.nombre}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="coordenada">Coordenada</Label>
                              <Input id="coordenada" value={newClient.coordenada || ""} onChange={(e) => setNewClient({ ...newClient, coordenada: e.target.value })} className="bg-gray-700 border-gray-600" />
                            </div>
                            <Listado_Tecnicos tecnicos={tecnicos} newOrder={newClient} setNewOrder={setNewClient} />

                          </div>

                        </div>
                      )}

                      {/* STEP 3: Servicio */}
                      {currentStep === 3 && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="num_contrato">Número de Contrato</Label>
                              <Input id="num_contrato" value={newClient.num_contrato || ""} onChange={(e) => setNewClient({ ...newClient, num_contrato: e.target.value })} className="bg-gray-700 border-gray-600" required maxLength={10} />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="tipoServicio">Tipo de Servicio</Label>
                              <Select value={newClient.tipoServicio} onValueChange={(value) => setNewClient({ ...newClient, tipoServicio: value })}>
                                <SelectTrigger className="bg-gray-700 border-gray-600">
                                  <SelectValue placeholder="Seleccionar servicio" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                  {servicios.map((esp) => (
                                    <SelectItem key={esp.serv_id} value={esp.serv_id.toString()}>
                                      {esp.serv_nombre}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                          </div>


                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div className="space-y-2">
                              <Label htmlFor="tipoComprobante">Tipo de Comprobante</Label>
                              <Select value={newClient.tipoComprobante} onValueChange={(value) => setNewClient({ ...newClient, tipoComprobante: value })}>
                                <SelectTrigger className="bg-gray-700 border-gray-600">
                                  <SelectValue placeholder="Seleccionar Tipo" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                  {tipo_comrprobante.map((tipo) => (
                                    <SelectItem key={tipo.id_tipo} value={tipo.id_tipo.toString()}>
                                      {tipo.tipo}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                              <Input id="fechaInicio" type="date" value={newClient.fechaInicio || ""} onChange={(e) => setNewClient({ ...newClient, fechaInicio: e.target.value })} className="bg-gray-700 border-gray-600" required />
                            </div>
                          </div>

                        </div>
                      )}

                      {/* Navegación */}
                      <div className="flex justify-between mt-6">
                        {currentStep > 1 && (
                          <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                            Anterior
                          </Button>
                        )}
                        {currentStep < 3 ? (
                          <Button onClick={() => isStepValid() && setCurrentStep(currentStep + 1)} disabled={!isStepValid()} className="bg-gradient-to-r from-cyan-500 to-blue-600">
                            Siguiente
                          </Button>
                        ) : (
                          <Button onClick={handleCreateClient} disabled={!isStepValid()} className="bg-gradient-to-r from-cyan-500 to-blue-600">
                            Crear Cliente
                          </Button>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar clientes por nombre, email o teléfono..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48 bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Suspendido">Suspendido</SelectItem>
                      <SelectItem value="Inactivo">Inactivo</SelectItem>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border border-gray-700 bg-gray-800/30">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-200">Cliente</TableHead>
                        <TableHead className="text-gray-200">DNI/RUC</TableHead>
                        <TableHead className="text-gray-200">Contacto</TableHead>
                        <TableHead className="text-gray-200">Servicio</TableHead>
                        <TableHead className="text-gray-200">Estado</TableHead>
                        <TableHead className="text-gray-200">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClients.map((client) => (
                        <TableRow key={client.cli_id} className="border-gray-700">
                          {/* Cliente */}
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <User className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-white font-medium">
                                  {client.cli_tipo === "JURIDICA"
                                    ? client.cli_razonsoci
                                    : `${client.cli_nombre} ${client.cli_apellido}`}
                                </p>
                                <p className="text-xs text-gray-400">{client.cli_id}</p>
                              </div>
                            </div>
                          </TableCell>

                          {/* DNI / RUC */}
                          <TableCell className="text-gray-200">
                            {client.cli_dni || client.cli_ruc || "-"}
                          </TableCell>

                          {/* Contacto (solo celular) */}
                          <TableCell className="text-gray-200">
                            <div className="flex items-center text-sm">
                              <Phone className="w-3 h-3 mr-1" />
                              {client.cli_cel}
                            </div>
                          </TableCell>

                          {/* Servicio */}
                          <TableCell className="text-gray-200">{client.serv_nombre}</TableCell>

                          {/* Estado visual */}
                          <TableCell>
                            {client.estado === "1" ? (
                              <Badge className="text-white bg-green-600">ACTIVO</Badge>
                            ) : client.estado === "0" ? (
                              <Badge className="text-white bg-red-600">CORTADO</Badge>
                            ) : (
                              <Badge className="text-white bg-gray-500">SIN INFO</Badge>
                            )}
                          </TableCell>

                          {/* Acciones */}
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedClient(client)
                                  setIsViewModalOpen(true)
                                }}
                                className="text-gray-400 hover:text-white"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedClient(client)
                                  setIsEditModalOpen(true)
                                }}
                                className="text-gray-400 hover:text-white"
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
              <DialogTitle>Perfil del Cliente</DialogTitle>
              <DialogDescription className="text-gray-400">Información detallada del cliente</DialogDescription>
            </DialogHeader>
            {selectedClient && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedClient.cli_nombre}</h3>
                    <p className="text-gray-400">{selectedClient.cli_id}</p>
                  </div>
                  <Badge className={`${getStatusColor(selectedClient.estado)} text-white`}>
                    {selectedClient.estado}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-400">Información de Contacto</Label>
                      <div className="space-y-2 mt-1">
                        <div className="flex items-center text-white">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {selectedClient.cli_dni}
                        </div>
                        <div className="flex items-center text-white">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {selectedClient.cli_cel}
                        </div>
                        <div className="flex items-start text-white">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                          <span className="text-sm">{selectedClient.cli_direccion}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-400">Información del Servicio</Label>
                      <div className="space-y-2 mt-1">
                        <p className="text-white">Tipo: {selectedClient.serv_nombre}</p>
                        <p className="text-white">Registro: {selectedClient.fecha_registro}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gray-700/30 border-gray-600">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-400">Órdenes Totales</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-700/30 border-gray-600">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-white">
                        {Math.floor(
                          (new Date().getTime() - new Date(selectedClient.fecha_registro).getTime()) /
                          (1000 * 60 * 60 * 24),
                        )}
                      </p>
                      <p className="text-sm text-gray-400">Días como Cliente</p>
                    </CardContent>
                  </Card>
                </div>

              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de edición */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
              <DialogDescription className="text-gray-400">Modifica la información del cliente</DialogDescription>
            </DialogHeader>
            {selectedClient && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nombre Completo</Label>
                    <Input
                      id="edit-name"
                      value={selectedClient.cli_nombre}
                      onChange={(e) => setSelectedClient({ ...selectedClient, cli_nombre: e.target.value })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={selectedClient.cli_dni}
                      onChange={(e) => setSelectedClient({ ...selectedClient, cli_dni: e.target.value })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Teléfono</Label>
                    <Input
                      id="edit-phone"
                      value={selectedClient.cli_cel}
                      onChange={(e) => setSelectedClient({ ...selectedClient, cli_cel: e.target.value })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Estado</Label>
                    <Select
                      value={selectedClient.estado}
                      onValueChange={(value) => setSelectedClient({ ...selectedClient, estado: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Suspendido">Suspendido</SelectItem>
                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-serviceType">Tipo de Servicio</Label>
                    <Select
                      value={selectedClient.serv_nombre}
                      onValueChange={(value) => setSelectedClient({ ...selectedClient, serv_nombre: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Fibra Óptica">Fibra Óptica</SelectItem>
                        <SelectItem value="Cable">Cable</SelectItem>
                        <SelectItem value="ADSL">ADSL</SelectItem>
                        <SelectItem value="Satelital">Satelital</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Dirección</Label>
                  <Input
                    id="edit-address"
                    value={selectedClient.cli_direccion}
                    onChange={(e) => setSelectedClient({ ...selectedClient, cli_direccion: e.target.value })}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditClient} className="bg-gradient-to-r from-cyan-500 to-blue-600">
                Guardar Cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
