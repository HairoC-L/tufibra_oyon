import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DetalleModalProps {
  abierto: boolean
  onClose: () => void
  datos: any[]
}

export default function DetalleModal({ abierto, onClose, datos }: DetalleModalProps) {
  return (
    <Dialog open={abierto} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gray-900 border-gray-700 text-gray-100">
        <DialogHeader>
          <DialogTitle>Detalle del Reporte</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <table className="w-full text-sm border-collapse mt-4">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-2 border border-gray-700">N° Comprobante</th>
                <th className="p-2 border border-gray-700">Fecha</th>
                <th className="p-2 border border-gray-700">Cliente</th>
                <th className="p-2 border border-gray-700">Monto</th>
                <th className="p-2 border border-gray-700">Comprobante</th>
                <th className="p-2 border border-gray-700">Método</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((item, i) => (
                <tr key={i} className="odd:bg-gray-800 even:bg-gray-700">
                  <td className="p-2 border border-gray-700">{item.codigo}</td>                 
                  <td className="p-2 border border-gray-700">{item.fecha}</td>
                  <td className="p-2 border border-gray-700">{item.cliente}</td>
                  <td className="p-2 border border-gray-700">S/ {Number(item.monto).toFixed(2)}</td>
                  <td className="p-2 border border-gray-700">{item.tipo_doc}</td>
                  <td className="p-2 border border-gray-700">{item.metodo_pago}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
