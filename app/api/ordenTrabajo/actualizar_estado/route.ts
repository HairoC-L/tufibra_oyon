import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const { rol, ord_id, estado } = await req.json();

    if (rol !== "tecnico" && rol !== "administrador") {
      return NextResponse.json({ error: "No autorizado para cambiar estado" }, { status: 403 });
    }

    const ordenActualizada = await prisma.orden_trabajo.update({
      where: { ord_id: parseInt(ord_id) },
      data: {
        ord_estado: parseInt(estado),
      },
    });

    return NextResponse.json({
      message: "Estado de la orden actualizado correctamente",
      orden: ordenActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar estado de la orden:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
