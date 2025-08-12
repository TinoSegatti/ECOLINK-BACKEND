import { PrismaClient, Cliente } from '@prisma/client';

const prisma = new PrismaClient();

// Función auxiliar para obtener o crear la categoría "NUEVO" para prioridad
const obtenerOCrearPrioridadNuevo = async (): Promise<string> => {
  try {
    // Buscar si ya existe la categoría "NUEVO" para prioridad
    const categoriaExistente = await prisma.categoria.findFirst({
      where: {
        campo: 'prioridad',
        valor: 'NUEVO',
        deleteAt: null,
      },
    });

    if (categoriaExistente) {
      return 'NUEVO';
    }

    // Si no existe, crear la categoría "NUEVO"
    await prisma.categoria.create({
      data: {
        campo: 'prioridad',
        valor: 'NUEVO',
        color: null,
        deleteAt: null,
      },
    });

    return 'NUEVO';
  } catch (error) {
    console.error('Error al obtener o crear categoría NUEVO para prioridad:', error);
    return 'NUEVO';
  }
};

export const crearCliente = async (data: Omit<Cliente, 'id'>): Promise<Cliente> => {
  try {
    // Verificar si el teléfono ya existe
    const clienteExistente = await prisma.cliente.findFirst({
      where: { telefono: data.telefono },
    });
    if (clienteExistente) {
      throw new Error('El número de teléfono ya está registrado');
    }

    // Obtener o crear la categoría "NUEVO" para prioridad
    const prioridadPorDefecto = await obtenerOCrearPrioridadNuevo();

    return await prisma.cliente.create({
      data: {
        zona: data.zona,
        nombre: data.nombre,
        barrio: data.barrio,
        direccion: data.direccion,
        localidad: data.localidad ?? null,
        telefono: data.telefono,
        tipoCliente: data.tipoCliente,
        detalleDireccion: data.detalleDireccion,
        semana: data.semana,
        horario: data.horario,
        observaciones: data.observaciones,
        debe: data.debe,
        fechaDeuda: data.fechaDeuda,
        precio: data.precio,
        ultimaRecoleccion: data.ultimaRecoleccion,
        contratacion: data.contratacion,
        estadoTurno: data.estadoTurno,
        prioridad: data.prioridad ?? prioridadPorDefecto,
        estado: data.estado,
        gestionComercial: data.gestionComercial,
        CUIT: data.CUIT,
        condicion: data.condicion,
        factura: data.factura,
        pago: data.pago,
        origenFacturacion: data.origenFacturacion,
        nombreEmpresa: data.nombreEmpresa,
        emailAdministracion: data.emailAdministracion,
        emailComercial: data.emailComercial,
        rubro: data.rubro,
        categoria: data.categoria,
      },
    });
  } catch (error: any) {
    console.error('Error al crear cliente:', error);
    throw new Error(error.message || 'No se pudo crear el cliente');
  }
};

export const actualizarCliente = async (id: number, data: Partial<Omit<Cliente, 'id'>>): Promise<Cliente> => {
  try {
    // Si se está actualizando el teléfono, verificar si ya existe
    if (data.telefono) {
      const clienteExistente = await prisma.cliente.findFirst({
        where: {
          telefono: data.telefono,
          id: { not: id },
        },
      });

      if (clienteExistente) {
        throw new Error('El número de teléfono ya está registrado');
      }
    }

    return await prisma.cliente.update({
      where: { id },
      data: {
        zona: data.zona,
        nombre: data.nombre,
        barrio: data.barrio,
        direccion: data.direccion,
        localidad: data.localidad ?? null,
        telefono: data.telefono,
        tipoCliente: data.tipoCliente,
        detalleDireccion: data.detalleDireccion,
        semana: data.semana,
        horario: data.horario,
        observaciones: data.observaciones,
        debe: data.debe,
        fechaDeuda: data.fechaDeuda,
        precio: data.precio,
        ultimaRecoleccion: data.ultimaRecoleccion,
        contratacion: data.contratacion,
        estadoTurno: data.estadoTurno,
        prioridad: data.prioridad,
        estado: data.estado,
        gestionComercial: data.gestionComercial,
        CUIT: data.CUIT,
        condicion: data.condicion,
        factura: data.factura,
        pago: data.pago,
        origenFacturacion: data.origenFacturacion,
        nombreEmpresa: data.nombreEmpresa,
        emailAdministracion: data.emailAdministracion,
        emailComercial: data.emailComercial,
        rubro: data.rubro,
        categoria: data.categoria,
      },
    });
  } catch (error: any) {
    console.error('Error al actualizar cliente:', error);
    throw new Error(error.message || 'No se pudo actualizar el cliente');
  }
};

export const obtenerClientes = async (): Promise<Cliente[]> => {
  try {
    return await prisma.cliente.findMany();
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    throw new Error('No se pudo obtener la lista de clientes');
  }
};

export const obtenerClientePorId = async (id: number): Promise<Cliente | null> => {
  try {
    return await prisma.cliente.findUnique({ where: { id } });
  } catch (error) {
    console.error('Error al obtener cliente por ID:', error);
    throw new Error('No se pudo encontrar el cliente');
  }
};

export const eliminarCliente = async (id: number): Promise<void> => {
  try {
    await prisma.cliente.delete({ where: { id } });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    throw new Error('No se pudo eliminar el cliente');
  }
};

export const actualizarPreciosPorTipoCliente = async (tipoCliente: string, nuevoPrecio: number): Promise<{ count: number }> => {
  try {
    // Verificar si el tipoCliente existe en la tabla categoria
    const categoriaExistente = await prisma.categoria.findFirst({
      where: {
        campo: 'tipoCliente',
        valor: tipoCliente,
        deleteAt: null,
      },
    });

    if (!categoriaExistente) {
      throw new Error(`El tipo de cliente "${tipoCliente}" no existe`);
    }

    // Actualizar el precio para todos los clientes con el tipoCliente especificado
    const updateResult = await prisma.cliente.updateMany({
      where: {
        tipoCliente,
      },
      data: {
        precio: nuevoPrecio,
      },
    });

    return { count: updateResult.count };
  } catch (error: any) {
    console.error('Error al actualizar precios por tipoCliente:', error);
    throw new Error(error.message || 'No se pudo actualizar los precios');
  }
};