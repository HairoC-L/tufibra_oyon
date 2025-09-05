"use client"

import { useState, useEffect, useRef } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navarcobranza"
import { useSearchParams } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Receipt, Search, XCircle, Pencil, CreditCard, ArrowLeft, Printer, Download, ArrowRight
  , AlertTriangle, User
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { ReceiptPreview } from "@/components/receipt-preview"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

import { toast } from 'react-toastify';

type tipo_comprobante = {
  id_tipo: number
  tipo: string
}

type deuda = {
  id_deuda: number
  ano_mes: string
  descripcion: string
  monto: number
  saldo_pendiente: number
  fecha_creacion: Date
  num_con: string
  estado: string
}

type detallePago = {
  id_deuda: number
  ano_mes: string
  descripcion: string
  monto: number
  saldo_pendiente: number
  fecha_creacion: Date
  num_con: string
  estado: string
}

interface Debt {
  id: string
  customerId: string
  serviceId: string
  amount: number
  dueDate: Date
  month: string // "2024-01", "2024-02", etc.
  year: number
  status: "pending" | "partial" | "paid" | "overdue"
  remainingAmount: number
  description: string
}

interface Service {
  id: string
  customerId: string
  type: "cable" | "internet" | "combo"
  plan: string
  monthlyAmount: number
  installationDate: Date
  status: "active" | "suspended" | "cancelled"
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  dni: string
  services: Service[]
  createdAt: Date
  status: "active" | "inactive" | "suspended"
}
interface Payment {
  id: string
  customerId: string
  debtIds: string[]
  amount: number
  paymentMethod: "efectivo" | "yape" | "transferencia"
  receiptType: "boleta" | "factura" | "recibo"
  receiptNumber: string
  paymentDate: Date
  cashierId: string
  notes?: string
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
  id_tipo_comprobante: number
}
interface Payment {
  id: string
  customerId: string
  debtIds: string[]
  amount: number
  paymentMethod: "efectivo" | "yape" | "transferencia"
  receiptType: "boleta" | "factura" | "recibo"
  receiptNumber: string
  paymentDate: Date
  cashierId: string
  notes?: string
}

interface pagos {
  cod_comprobante: string
  id_tipo_comprobante: string
  serie: string
  correlativo: number
  fecha_emision: Date
  monto_total: number
  medio_pago: "efectivo" | "yape" | "transferencia"
  estado: string
  num_con: string
  id_per_oficina: string
  duedas_ids: string[]
}

interface Receipt {
  id: string
  paymentId: string
  type: "boleta" | "factura" | "recibo"
  number: string
  customer: Customer
  items: ReceiptItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  issuedAt: Date
  cashier: string
}

interface ReceiptItem {
  description: string
  amount: number
  month: string
  service: string
}

type PaymentStep = "search" | "select-debts" | "payment-details" | "confirmation"

interface SelectedDebt {
  debt: Debt
  amountToPay: number
  selected: boolean
}

interface SelectedDeudas {
  deu: deuda
  amountToPay: number
  selected: boolean
}

const meses = [
  { nombre: 'ENERO', valor: 1 },
  { nombre: 'FEBRERO', valor: 2 },
  { nombre: 'MARZO', valor: 3 },
  { nombre: 'ABRIL', valor: 4 },
  { nombre: 'MAYO', valor: 5 },
  { nombre: 'JUNIO', valor: 6 },
  { nombre: 'JULIO', valor: 7 },
  { nombre: 'AGOSTO', valor: 8 },
  { nombre: 'SEPTIEMBRE', valor: 9 },
  { nombre: 'OCTUBRE', valor: 10 },
  { nombre: 'NOVIEMBRE', valor: 11 },
  { nombre: 'DICIEMBRE', valor: 12 },
];

const años = [2025, 2026];


export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [tipo_comrprobante, setTipoComprobante] = useState<tipo_comprobante[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [openModal, setOpenModal] = useState(false);

  const [deudas, setDeudas] = useState<deuda[]>([])

  const [pagos, setPagos] = useState<pagos[]>([])
  const [detallePago, setDetallePago] = useState<detallePago[]>([]);
  const [id_user, setIdUser] = useState("");
  const [userRole, setUserRole] = useState("");

  const currentYear = new Date().getFullYear();
  const [mes, setMes] = useState(1);
  const [anio, setAnio] = useState(currentYear);

  const [loadingActivo, setLoadingActivo] = useState(false);
  const [loadingCortado, setLoadingCortado] = useState(false);

  const [showDetalleComprobante, setShowDetalleComprobante] = useState(false);
  const [newPago, setNewPago] = useState({
    id_tipo_compro: "",
    serie: "",
    correlativo: 0,
    monto_total: 0,
    medio_pago: "EFECTIVO",
    num_con: "",
    id_user: id_user,
  })

  const generarDeuda = async () => {
    try {
      const res = await fetch('/api/caja/deudaMasiva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mes, anio }),
      });

      if (!res.ok) throw new Error('Error al generar deuda');

      const data = await res.json();
      toast.success('Deuda generada correctamente');
    } catch (error) {
      console.error(error);
      toast.error('Error al generar deuda');
    }
  };

  function searchClientes(query: string): Client[] {
    if (!query.trim()) return clients

    const searchTerm = query.toLowerCase()
    return clients.filter(
      (clientes) =>
        clientes.cli_nombre.toLowerCase().includes(searchTerm) ||
        clientes.cli_apellido.toLowerCase().includes(searchTerm) ||
        clientes.cli_dni.includes(searchTerm) ||
        clientes.cli_ruc.includes(searchTerm) ||
        clientes.cli_razonsoci.toLowerCase().includes(searchTerm),
    )
  }

  //Carga de clientes y contratos
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
  //Carga de deudas
  const fetchDeudas = async () => {
    try {
      const res = await fetch("/api/caja/deudasTodo");
      if (!res.ok) {
        console.error("Error al obtener información de las deudas:", res.status);
        return;
      }
      const data = await res.json();
      setDeudas(data);
    } catch (err) {
      console.error("Error parsing JSON:", err);
    }
  };

  //Carga de pagos
  const fetchPagos = async () => {
    try {
      const res = await fetch("/api/caja/pagos");
      if (!res.ok) {
        console.error("Error al obtener información de los pagos:", res.status);
        return;
      }
      const data = await res.json();
      setPagos(data);
    } catch (err) {
      console.error("Error parsing JSON:", err);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchDeudas();
    setUserRole(localStorage.getItem("userRole") || "")
  }, []);


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





  useEffect(() => {
    const storedId = localStorage.getItem("userId") || "";
    setIdUser(storedId);
  }, []);

  useEffect(() => {
    if (id_user) {
      setNewPago((prev) => ({
        ...prev,
        id_user: id_user,
      }));
    }
  }, [id_user]);

  const searchParams = useSearchParams()
  const preselectedCustomerId = searchParams.get("customer")
  const receiptRef = useRef<HTMLDivElement>(null)

  const [currentStep, setCurrentStep] = useState<PaymentStep>("search")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedDebts, setSelectedDebts] = useState<SelectedDebt[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "yape" | "transferencia">("efectivo")
  const [receiptType, setReceiptType] = useState<"boleta" | "factura" | "recibo">("boleta")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedPayment, setProcessedPayment] = useState<Payment | null>(null)
  const [pagoProcesado, setpagoProcesado] = useState<pagos | null>(null)

  const [error, setError] = useState("")


  const [editingDeuda, setEditingDeuda] = useState(null)
  const [editedData, setEditedData] = useState({ monto: "", saldo_pendiente: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  //  const customers = searchCustomers(searchQuery)
  const clientes_filtrados = searchClientes(searchQuery)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedDeudas, setSelectedDeudas] = useState<SelectedDeudas[]>([])

  // Cargar deudas cuando se selecciona un cliente
  useEffect(() => {
    if (selectedClient) {
      const deudas = getDeudaClientes(selectedClient.num_con)
      const deudasSelection = deudas
        .filter((deu) => deu.estado !== "PAGADO" && deu.estado !== "ANULADO")
        .map((deu) => ({
          deu,
          amountToPay: deu.monto,
          selected: false,
        }))
      setSelectedDeudas(deudasSelection)
    }
  }, [selectedClient])

  function getDeudaClientes(num_con: string): deuda[] {
    return deudas
      .filter((deu) => deu.num_con === num_con)
      .sort((a, b) => new Date(a.fecha_creacion).getTime() - new Date(b.fecha_creacion).getTime())
  }

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCurrentStep("select-debts")
    setError("")
  }

  const handleClienteSelect = (cliente: Client) => {
    setSelectedClient(cliente)
    setCurrentStep("select-debts")
    setError("")
  }

  //deudas nuevo
  const handleDeudaSelection = (index: number, selected: boolean) => {
    const updated = [...selectedDeudas]
    updated[index].selected = selected
    if (selected) {
      updated[index].amountToPay = updated[index].deu.saldo_pendiente;
    } else {
      updated[index].amountToPay = 0;
    }
    setSelectedDeudas(updated)
  }



  const handleEditClick = (deuda: any) => {
    setEditingDeuda(deuda)
    setEditedData({
      monto: deuda.deu.monto,
      saldo_pendiente: deuda.deu.saldo_pendiente,
    })
  }


  const handleAnularClick = async (deudaId: any) => {
    try {
      const res = await fetch("/api/caja/modificarDeuda", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id_deuda: deudaId,
          estado: "ANULADO"
        })
      })

      if (!res.ok) throw new Error("Error al anular la deuda")

      alert("Deuda anulada correctamente")
      // Aquí podrías actualizar el estado o recargar datos
    } catch (error) {
      console.error(error)
      alert("Error al anular la deuda")
    }
  }

  const handleSaveDeuda = async () => {
    setIsSubmitting(true)
    /*try {
      const res = await fetch("/api/caja/modificarDeuda", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id_deuda: editingDeuda!.id_deuda,
          monto: parseFloat(editedData.monto),
          saldo_pendiente: parseFloat(editedData.saldo_pendiente)
        })
      })
  
      if (!res.ok) throw new Error("Error al modificar la deuda")
  
      alert("Deuda modificada correctamente")
      setEditingDeuda(null)
      // Aquí podrías actualizar el estado o recargar datos
    } catch (error) {
      console.error(error)
      alert("Error al modificar la deuda")
    } finally {
      setIsSubmitting(false)
    }*/
  }



  const handleMontoChange = (index: number, amount: number) => {
    const updated = [...selectedDeudas]
    const maxAmount = updated[index].deu.saldo_pendiente
    updated[index].amountToPay = Math.min(Math.max(0, amount), maxAmount)
    setSelectedDeudas(updated)
  }

  const getSelectedDeudasTotal = () => {
    return selectedDeudas
      .filter((item) => item.selected)
      .reduce((sum, item) => sum + Number(item.amountToPay || 0), 0);
  };


  const getSelectedDeudasCount = () => {
    return selectedDeudas.filter((item) => item.selected).length
  }





  const handleContinueToPayment = () => {
    const selectedCount = getSelectedDeudasCount()
    if (selectedCount === 0) {
      setError("Debes seleccionar al menos una deuda para continuar")
      return
    }
    setError("")
    setCurrentStep("payment-details")
  }


  async function processPayment(
    num_con: string,
    selectedDeudass: { id_deuda: string; amount: number; deuda: deuda }[],
    paymentMethod: "efectivo" | "yape" | "transferencia",
    receiptType: "boleta" | "factura" | "recibo",
    id_usuario: string,
  ): Promise<{ success: boolean; cod_comprobante: string; error?: string }> {
    try {
      const totalAmount = selectedDeudass.reduce((sum, item) => sum + Number(item.amount), 0);

      // Obtener tipo
      let id_tipo_com: number;
      if (receiptType === "boleta") id_tipo_com = 1;
      else if (receiptType === "factura") id_tipo_com = 2;
      else if (receiptType === "recibo") id_tipo_com = 3;
      else throw new Error("Tipo de comprobante inválido");

      // Obtener serie y correlativo
      const { serie, numero } = await generarNumeroComprobante(id_tipo_com);
      const cod_comprobante = `${serie}-${numero}`;

      await GuardarPago(
        {
          id_tipo_compro: id_tipo_com.toString(),
          serie,
          correlativo: numero,
          monto_total: totalAmount,
          medio_pago: paymentMethod,
          num_con,
          id_user: id_usuario,
        },
        selectedDeudass.map((item) => ({
          ...item,
          id_deuda: item.deuda.id_deuda || "",
          descripcion: item.deuda.descripcion || "",
          ano_mes: item.deuda.ano_mes || "",
          monto: Number(item.amount),
        }))
      );

      fetchDeudas();
      fetchPagos();

      return { success: true, cod_comprobante };
    } catch (error) {
      console.error("Error en processPayment:", error);
      return { success: false, cod_comprobante: "", error: "Error al procesar el pago" };
    }
  }

  async function GuardarPago(pago: any, detalle: any[]) {
    try {
      const res = await fetch("/api/caja/agregar_pago", {
        method: "POST",
        body: JSON.stringify({
          ...pago,
          detallePago: detalle.map((item) => ({
            id_deuda: item.id_deuda,
            descripcion: item.descripcion,
            ano_mes: item.ano_mes,
            monto: item.monto,
          })),
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Limpieza
      setNewPago({
        id_tipo_compro: "",
        serie: "",
        correlativo: 0,
        monto_total: 0,
        medio_pago: "",
        num_con: "",
        id_user: id_user,
      });
      setDetallePago([]);

    } catch (error) {
      toast.error("Error inesperado al guardar pago");
      console.error("Error al registrar el pago:", error);
    }
  }

  async function generarNumeroComprobante(id_tipo: number): Promise<{ serie: string; numero: string }> {
    try {
      const res = await fetch(`/api/caja/numeroComprobante?id_tipo=${id_tipo}`);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.error || "Error al obtener numero de comprobante");
      }

      const { serie, numero } = await res.json();

      return { serie, numero }; // Ejemplo: B001-00012
    } catch (error) {
      console.error("Error generando número de comprobante:", error);
      return { serie: "ERROR", numero: "00000000" }; // Puedes lanzar error o retornar algo más útil según el caso
    }
  }

  const handleProcessPayment = async () => {
    setIsProcessing(true)
    setError("")

    try {
      const selectedItems = selectedDeudas
        .filter((item) => item.selected)
        .map((item) => ({
          id_deuda: item.deu.id_deuda.toString(),
          amount: item.amountToPay,
          deuda: item.deu
        }))

      const result = await processPayment(
        selectedClient!.num_con,
        selectedItems,
        paymentMethod,
        receiptType,
        id_user,
      );

      if (result.success && result.cod_comprobante) {
        // Esperar a que se carguen los pagos frescos
        const res = await fetch("/api/caja/pagos");
        const data: pagos[] = await res.json();

        const numero_comprobante = result.cod_comprobante;

        // Buscar el pago en los datos recién obtenidos
        const pago_realizado = data.find((pago) => pago.cod_comprobante === numero_comprobante) || null;

        // Actualizar estados
        setPagos(data);
        setpagoProcesado(pago_realizado);
        setCurrentStep("confirmation");
      } else {
        setError(result.error || "Error al procesar el pago");
      }
    } catch (err) {
      setError("Error inesperado al procesar el pago")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNewPayment = () => {
    setCurrentStep("search")
    setSelectedClient(null)
    setSelectedDeudas([])
    setPaymentMethod("efectivo")
    setReceiptType("boleta")
    setpagoProcesado(null)
    setError("")
    setSearchQuery("")
  }

  const resetearSelectedDeudas = () => {
    const updated = selectedDeudas.map((deuda) => ({
      ...deuda,
      selected: false,
      amountToPay: 0,
    }));

    setSelectedDeudas(updated);
  };




  const handleDownload = async (estado: "activo" | "cortado") => {
    const setLoading = estado === "activo" ? setLoadingActivo : setLoadingCortado;
    setLoading(true);

    try {
      const res = await fetch(`/api/caja/exportarDeudas?estado=${estado}`);

      if (!res.ok) {
        throw new Error("Error al generar el archivo");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `deudas_${estado}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar:", error);
      alert("Ocurrió un error al generar el archivo.");
    } finally {
      setLoading(false);
    }
  };

  const renderSearchStep = () => (
    <div className="space-y-6">
      <Card className="rounded-md border border-gray-700 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            Buscar Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nombre, DNI, teléfono o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700/50 border-gray-600 text-white"
              />
            </div>

            {searchQuery.trim() && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {clientes_filtrados.length > 0 ? (
                  clientes_filtrados.map((clientes) => (
                    <div
                      key={clientes.num_con}
                      className="p-4 rounded-md border border-gray-700 bg-gray-800/50 hover:bg-gray-600 cursor-pointer transition-colors"
                      onClick={() => handleClienteSelect(clientes)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          {clientes.cli_tipo === "NATURAL" ? (
                            <>
                              <h3 className="font-medium text-gray-100">
                                {clientes.cli_nombre} {clientes.cli_apellido}
                              </h3>
                              <p className="text-sm text-gray-400">
                                DNI: {clientes.cli_dni} | Tel: {clientes.cli_cel}
                              </p>
                            </>
                          ) : (
                            <>
                              <h3 className="font-medium text-gray-100">
                                {clientes.cli_razonsoci}
                              </h3>
                              <p className="text-sm text-gray-400">
                                RUC: {clientes.cli_ruc} | Tel: {clientes.cli_cel}
                              </p>
                            </>
                          )}
                          <p className="text-sm text-gray-400">{clientes.cli_direccion}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              clientes.estado === "1"
                                ? "success"
                                : clientes.estado === "0"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {clientes.estado === "1"
                              ? "Activo"
                              : clientes.estado === "0"
                                ? "Cortado"
                                : "Inactivo"}
                          </Badge>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No se encontraron clientes</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSelectDebtsStep = () => (
    <div className="space-y-6">
      {/* Customer Info */}
      <Card className="rounded-md border-none bg-gray-800/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gray-100">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Cliente Seleccionado
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setCurrentStep("search"); resetearSelectedDeudas(); }}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cambiar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {selectedClient?.cli_tipo === "NATURAL" ? (
                <>
                  <h2 className="font-semibold text-lg text-gray-100">{selectedClient?.cli_nombre} {selectedClient?.cli_apellido}</h2>
                  <p className="text-gray-300">DNI: {selectedClient?.cli_dni}</p>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-lg text-gray-100">{selectedClient?.cli_razonsoci}</h3>
                  <p className="text-gray-300">RUC: {selectedClient?.cli_ruc}</p>
                </>
              )
              }
              <p className="text-gray-300">CEL: {selectedClient?.cli_cel}</p>
            </div>
            <div>
              <p className="text-gray-300">SERVICIO: {selectedClient?.serv_nombre}</p>
              <p className="text-gray-300">DIRECCION: {selectedClient?.cli_direccion}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Debts Selection */}
      <Card className="rounded-md border border-gray-700 bg-gray-800/30">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-white mb-4">Lista de Deudas</h3>

          {selectedDeudas.length === 0 ? (
            <p className="text-center text-gray-300">No hay deudas registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-white">
                <thead>
                  <tr className="text-left border-b border-gray-600">
                    <th className="p-2">Descripción</th>
                    <th className="p-2">Monto Total</th>
                    <th className="p-2">Saldo Pendiente</th>
                    <th className="p-2">Estado</th>
                    <th className="p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDeudas.map((deuda) => (
                    <tr key={deuda.deu.id_deuda} className="border-b border-gray-700">
                      <td className="p-2">{deuda.deu.descripcion}</td>
                      <td className="p-2">S/ {Number(deuda.deu.monto).toFixed(2)}</td>
                      <td className="p-2 text-red-500">S/ {Number(deuda.deu.saldo_pendiente).toFixed(2)}</td>
                      <td className="p-2">
                        <Badge
                          variant={
                            deuda.deu.estado === "ACTIVO"
                              ? "destructive"
                              : deuda.deu.estado === "RESTANTE"
                                ? "warning"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {deuda.deu.estado === "RESTANTE" ? "PENDIENTE" : deuda.deu.estado}
                        </Badge>
                      </td>
                      <td className="p-2 space-x-2">
                        <Button className="bg-gray-500 hover:bg-gray-700" size="sm" onClick={() => handleEditClick(deuda)}>
                          <Pencil className="h-4 w-4 mr-1" />
                          Modificar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAnularClick(deuda.deu.id_deuda)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Anular
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>

        {/* Modal de Edición */}
        {editingDeuda && (
          <Dialog open={true} onOpenChange={() => setEditingDeuda(null)}>
            <DialogContent className="bg-gray-800 border border-gray-600 text-white">
              <DialogTitle>Modificar Deuda</DialogTitle>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Monto Total</Label>
                  <Input
                    type="number"
                    value={editedData.monto}
                    onChange={(e) => setEditedData({ ...editedData, monto: e.target.value })}
                    className="bg-gray-700 text-white border-gray-500"
                  />
                </div>
                <div>
                  <Label>Saldo Pendiente</Label>
                  <Input
                    type="number"
                    value={editedData.saldo_pendiente}
                    onChange={(e) => setEditedData({ ...editedData, saldo_pendiente: e.target.value })}
                    className="bg-gray-700 text-white border-gray-500"
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button onClick={() => setEditingDeuda(null)} variant="ghost">
                  Cancelar
                </Button>
                <Button onClick={handleSaveDeuda} disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </Card>
    </div>
  )





  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
          <header className="flex h-16 items-center gap-2 border-b border-gray-700 bg-gray-800/50 backdrop-blur-xl px-4">

            <SidebarTrigger className="-ml-1 text-white" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white">Cobranza</h1>
            </div>
            <Navbar />
          </header>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
                <CardHeader>
                  {/* Header */}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-100 mb-2">Generar deuda masiva</h1>
                    <p className="text-gray-300">Genera deuda de las mensualidades a los usuarios</p>
                  </div>
                </CardHeader>
                <CardContent>

                  <div className="flex flex-row items-end gap-4 justify-center">
                    {/* MES */}
                    <div className="flex flex-col">
                      <label className="text-sm text-gray-300 mb-1">Mes</label>
                      <Select value={mes.toString()} onValueChange={(value) => setMes(Number(value))}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-40">
                          <SelectValue placeholder="Seleccionar mes" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          {meses.map((m) => (
                            <SelectItem key={m.valor} value={m.valor.toString()}>
                              {m.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* AÑO */}
                    <div className="flex flex-col">
                      <label className="text-sm text-gray-300 mb-1">Año</label>
                      <Select value={anio.toString()} onValueChange={(value) => setAnio(Number(value))}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-32">
                          <SelectValue placeholder="Seleccionar año" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          {años.map((a) => (
                            <SelectItem key={a} value={a.toString()}>
                              {a}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* BOTÓN */}
                    <div>
                      <Button
                        onClick={generarDeuda}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Generar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
                <CardHeader>
                  {/* Header */}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-100 mb-2">Exportar</h1>
                    <p className="text-gray-300">Usuarios con deuda</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-row items-end gap-4 justify-center">
      <Button
        onClick={() => handleDownload("activo")}
        disabled={loadingActivo}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        {loadingActivo ? "Generando..." : "Activos con deuda"}
      </Button>

      <Button
        onClick={() => handleDownload("cortado")}
        disabled={loadingCortado}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        {loadingCortado ? "Generando..." : "Cortados con deuda"}
      </Button>
    </div>
                </CardContent>
              </Card>

            </div>
            <div className="mt-4">
              {userRole === "ADMINISTRADOR" && (
                <>
                  <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
                    <CardHeader>
                      {/* Header */}
                      <div>
                        <h1 className="text-3xl font-bold text-gray-100 mb-2">Gestionar deudas</h1>
                        <p className="text-gray-300">Modifica y/o anula deudas</p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Progress Steps */}
                      <div className="mb-4">
                        <div className="flex items-center justify-center space-x-4">
                          {[
                            { key: "search", label: "Buscar Cliente", icon: Search },
                            { key: "select-debts", label: "Gestionar Deudas", icon: CreditCard },
                          ].map((step, index) => {
                            const Icon = step.icon
                            const isActive = currentStep === step.key
                            const isCompleted =
                              (currentStep === "select-debts" && step.key === "search") ||
                              (currentStep === "payment-details" && ["search", "select-debts"].includes(step.key))
                            return (
                              <div key={step.key} className="flex items-center">
                                <div
                                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${isActive
                                    ? "border-blue-600 bg-blue-600 text-white"
                                    : isCompleted
                                      ? "border-green-600 bg-green-600 text-white"
                                      : "border-gray-400  text-gray-400"
                                    }`}
                                >
                                  <Icon className="h-5 w-5" />
                                </div>
                                <span
                                  className={`ml-2 text-sm font-medium ${isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"
                                    }`}
                                >
                                  {step.label}
                                </span>
                                {index < 1 && <ArrowRight className="h-4 w-4 text-gray-300 mx-4" />}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Step Content */}
                      {currentStep === "search" && renderSearchStep()}
                      {currentStep === "select-debts" && renderSelectDebtsStep()}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>


          </div>
        </div>
      </SidebarInset>
    </SidebarProvider >
  )
}
