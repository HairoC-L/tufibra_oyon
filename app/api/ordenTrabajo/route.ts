import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST: Crear nueva orden
export async function POST(req: NextRequest) {
    try {
        const { descripcion, fecha_asignacion, prioridad, tec_id, per_id, cli_id, tip_id } = await req.json();

        const orden = await prisma.orden_trabajo.create({
            data: {
                ord_descripcion: descripcion,
                ord_fecha_creacion: new Date(),
                ord_fecha_asignacion: new Date(fecha_asignacion),
                ord_estado: 1,
                ord_prioridad: prioridad,
                tec_id: tec_id,
                per_id: parseInt(per_id),
                cli_id: cli_id,
                tip_id: parseInt(tip_id),
            },
        });

        return NextResponse.json({
            orden: {
                ...orden,
                ord_id: Number(orden.ord_id),
            },
        });
    } catch (error) {
        console.error("Error al crear orden de trabajo:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// GET: Listar ordenes
export async function GET() {
  try {
    const ordenes = await prisma.orden_trabajo.findMany({
      include: {
        cliente: true,
        tipo_trabajo: true,
        tecnico: {
            include:{
                usuario:true,
            }
        },

      },
    });

    const result = ordenes.map((orden) => ({
      id: `OT-${orden.ord_id}`,
      client: orden.cliente.cli_nombre, 
      type: orden.tipo_trabajo.tip_nombre,
      status: getEstadoTexto(orden.ord_estado),
      priority: orden.ord_prioridad,
      technician: `${orden.tecnico.usuario.usu_nombre}`, 
      createdDate: orden.ord_fecha_creacion?.toISOString() || "",
      scheduledDate: orden.ord_fecha_asignacion?.toISOString() || "",
      description: orden.ord_descripcion || "",
      address: orden.cliente.cli_direccion || "",
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error al obtener órdenes de trabajo:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Función opcional para traducir estado
function getEstadoTexto(estado?: number | null): string {
  switch (estado) {
    case 1:
      return "Pendiente";
    case 2:
      return "En Proceso";
    case 3:
      return "Finalizado";
    case 4:
      return "Cancelada";
    default:
      return "Desconocido";
  }
}