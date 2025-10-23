import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2, Package, Bike, Truck, Car, Snowflake } from "lucide-react";
import { DataTable, createSortableHeader } from "../config/DataTable";
import { Toolbar } from "../config/Toolbar";
import { BadgeEstado } from "../config/BadgeEstado";
import { ConfirmDialog } from "../config/ConfirmDialog";
import { EmptyState } from "../config/EmptyState";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "sonner";

interface TipoTransporte {
  id: string;
  codigo: string;
  nombre: string;
  capacidadKg: number;
  capacidadM3: number;
  rangoSoportado: string;
  multiplicadorCosto: number;
  requiereFrio: boolean;
  activo: boolean;
  icono: string;
}

const mockTipos: TipoTransporte[] = [
  {
    id: "1",
    codigo: "Bicicleta",
    nombre: "Bicicleta",
    capacidadKg: 20,
    capacidadM3: 0.3,
    rangoSoportado: "0 - 10 km",
    multiplicadorCosto: 0.6,
    requiereFrio: false,
    activo: true,
    icono: "bike",
  },
  {
    id: "2",
    codigo: "Moto",
    nombre: "Motocicleta",
    capacidadKg: 50,
    capacidadM3: 0.5,
    rangoSoportado: "0 - 10 km",
    multiplicadorCosto: 0.8,
    requiereFrio: false,
    activo: true,
    icono: "bike",
  },
  {
    id: "3",
    codigo: "Van",
    nombre: "Camioneta",
    capacidadKg: 1000,
    capacidadM3: 10,
    rangoSoportado: "100 - 500 km",
    multiplicadorCosto: 1,
    requiereFrio: false,
    activo: true,
    icono: "car",
  },
  {
    id: "4",
    codigo: "Camion",
    nombre: "Camion",
    capacidadKg: 5000,
    capacidadM3: 40,
    rangoSoportado: "1000 - 2000 km",
    multiplicadorCosto: 1.4,
    requiereFrio: false,
    activo: true,
    icono: "truck",
  },
  {
    id: "5",
    codigo: "Refrigerado",
    nombre: "Refrigerado",
    capacidadKg: 3000,
    capacidadM3: 25,
    rangoSoportado: "1000 - 2000 km",
    multiplicadorCosto: 1.7,
    requiereFrio: true,
    activo: true,
    icono: "truck",
  },
];

const iconosDisponibles = [
  { value: "bike", label: "Bicicleta", icon: Bike },
  { value: "car", label: "Auto", icon: Car },
  { value: "truck", label: "Camion", icon: Truck },
  { value: "package", label: "Paquete", icon: Package },
];

const rangoOpciones = [
  "0 - 10 km",
  "10 - 100 km",
  "100 - 500 km",
  "500 - 1000 km",
  "1000 - 2000 km",
];

export function TiposTransporte() {
  const [searchValue, setSearchValue] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [tipos, setTipos] = useState<TipoTransporte[]>(mockTipos);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoTransporte | null>(null);
  const [deleteTipo, setDeleteTipo] = useState<TipoTransporte | null>(null);

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    capacidadKg: 0,
    capacidadM3: 0,
    rangoSoportado: rangoOpciones[0],
    multiplicadorCosto: 1,
    requiereFrio: false,
    activo: true,
    icono: "truck",
  });

  const filteredTipos = tipos.filter((tipo) => {
    const search = searchValue.toLowerCase();
    const matchesSearch =
      tipo.codigo.toLowerCase().includes(search) ||
      tipo.nombre.toLowerCase().includes(search) ||
      tipo.rangoSoportado.toLowerCase().includes(search) ||
      tipo.multiplicadorCosto.toString().includes(searchValue);
    const matchesEstado =
      filterEstado === "todos" ||
      (filterEstado === "activo" && tipo.activo) ||
      (filterEstado === "inactivo" && !tipo.activo);
    return matchesSearch && matchesEstado;
  });

  const handleNew = () => {
    setEditingTipo(null);
    setFormData({
      codigo: "",
      nombre: "",
      capacidadKg: 0,
      capacidadM3: 0,
      rangoSoportado: rangoOpciones[0],
      multiplicadorCosto: 1,
      requiereFrio: false,
      activo: true,
      icono: "truck",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (tipo: TipoTransporte) => {
    setEditingTipo(tipo);
    const { id, ...rest } = tipo;
    setFormData(rest);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const errores: string[] = [];

    // Validar Código
    if (!formData.codigo.trim()) {
      errores.push("El campo Código es requerido y no puede estar vacío");
    }

    // Validar Nombre
    if (!formData.nombre.trim()) {
      errores.push("El campo Nombre es requerido y no puede estar vacío");
    }

    // Validar Capacidad kg - debe ser mayor a 0
    if (formData.capacidadKg <= 0) {
      errores.push("El campo Capacidad típica (kg) debe ser mayor a 0");
    }

    // Validar Capacidad m³ - debe ser mayor a 0
    if (formData.capacidadM3 <= 0) {
      errores.push("El campo Capacidad típica (m³) debe ser mayor a 0");
    }

    // Validar Multiplicador costo - debe ser mayor a 0
    if (formData.multiplicadorCosto <= 0) {
      errores.push("El campo Multiplicador costo debe ser mayor a 0");
    }

    // Validar Rango soportado
    if (!formData.rangoSoportado.trim()) {
      errores.push("El campo Rango soportado es requerido");
    }

    // Validar código único
    const codigoExiste = tipos.some(
      (t) => t.codigo.toLowerCase() === formData.codigo.toLowerCase() && t.id !== editingTipo?.id
    );

    if (codigoExiste) {
      errores.push("Ya existe un tipo de transporte con este código");
    }

    // Si hay errores, mostrarlos todos a la vez
    if (errores.length > 0) {
      if (errores.length === 1) {
        toast.error(errores[0]);
      } else {
        toast.error(
          <div className="space-y-1">
            <div className="font-medium">Por favor corrige los siguientes errores:</div>
            <ul className="list-disc list-inside space-y-1">
              {errores.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </div>
        );
      }
      return;
    }

    if (editingTipo) {
      setTipos((prev) =>
        prev.map((t) => (t.id === editingTipo.id ? { ...t, ...formData } : t))
      );
      toast.success("Tipo de transporte actualizado correctamente");
    } else {
      const nuevoTipo: TipoTransporte = {
        id: String(Date.now()),
        ...formData,
        codigo: formData.codigo.toLowerCase(),
      };
      setTipos((prev) => [...prev, nuevoTipo]);
      toast.success("Tipo de transporte creado correctamente");
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteTipo) {
      setTipos((prev) => prev.filter((t) => t.id !== deleteTipo.id));
      toast.success("Tipo de transporte eliminado correctamente");
      setDeleteTipo(null);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ElementType> = {
      bike: Bike,
      car: Car,
      truck: Truck,
      package: Package,
    };
    return iconMap[iconName] || Truck;
  };

  const columns: ColumnDef<TipoTransporte>[] = [
    {
      accessorKey: "icono",
      header: "",
      cell: ({ row }) => {
        const Icon = getIconComponent(row.original.icono);
        return (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-teal-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-purple-600" />
          </div>
        );
      },
    },
    {
      accessorKey: "codigo",
      header: createSortableHeader("Código"),
      cell: ({ row }) => (
        <code className="px-2 py-1 rounded bg-gray-100 text-sm">
          {row.original.codigo}
        </code>
      ),
    },
    {
      accessorKey: "nombre",
      header: createSortableHeader("Nombre"),
    },
    {
      accessorKey: "capacidadKg",
      header: createSortableHeader("Cap. tí­pica (kg)"),
      cell: ({ row }) => `${row.original.capacidadKg.toLocaleString()} kg`,
    },
    {
      accessorKey: "capacidadM3",
      header: "Cap. tí­pica (m^³)",
      cell: ({ row }) => `${row.original.capacidadM3} m^³`,
    },
    {
      accessorKey: "rangoSoportado",
      header: "Rango soportado",
      cell: ({ row }) => row.original.rangoSoportado,
    },
    {
      accessorKey: "multiplicadorCosto",
      header: createSortableHeader("Multiplicador costo"),
      cell: ({ row }) => row.original.multiplicadorCosto.toFixed(2),
    },
    {
      accessorKey: "requiereFrio",
      header: "Frío",
      cell: ({ row }) =>
        row.original.requiereFrio ? (
          <Snowflake className="w-4 h-4 text-blue-500" />
        ) : (
          "-"
        ),
    },
    {
      accessorKey: "activo",
      header: "Estado",
      cell: ({ row }) => (
        <BadgeEstado
          estado={row.original.activo ? "success" : "neutral"}
          label={row.original.activo ? "Activo" : "Inactivo"}
        />
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="backdrop-blur-xl bg-white/95">
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteTipo(row.original)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Toolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onNewClick={handleNew}
        newButtonLabel="Nuevo tipo"
        filters={[
          {
            label: "Estado",
            value: filterEstado,
            options: [
              { label: "Todos", value: "todos" },
              { label: "Activos", value: "activo" },
              { label: "Inactivos", value: "inactivo" },
            ],
            onChange: setFilterEstado,
          },
        ]}
      />

      {tipos.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No hay tipos de transporte"
          description="Agrega una modalidad para comenzar a configurar tus reglas de despacho."
          actionLabel="Nuevo tipo"
          onAction={handleNew}
        />
      ) : (
        <DataTable columns={columns} data={filteredTipos} />
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="backdrop-blur-xl bg-white/95 max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTipo ? "Editar tipo de transporte" : "Nuevo tipo de transporte"}
            </DialogTitle>
            <DialogDescription>
              Define la capacidad, cobertura y multiplicadores del medio de transporte.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toLowerCase() })}
                  placeholder="Ej: bike, van, truck"
                  className="bg-white/80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Camioneta"
                  className="bg-white/80"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icono">Icono</Label>
              <Select
                value={formData.icono}
                onValueChange={(value) => setFormData({ ...formData, icono: value })}
              >
                <SelectTrigger className="bg-white/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconosDisponibles.map((icono) => {
                    const Icon = icono.icon;
                    return (
                      <SelectItem key={icono.value} value={icono.value}>
                        <div className="flex items-center">
                          <Icon className="w-4 h-4 mr-2" />
                          {icono.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacidadKg" className="block h-10 flex items-center">Capacidad típica (kg) *</Label>
                <Input
                  id="capacidadKg"
                  type="text"
                  value={formData.capacidadKg === 0 ? "" : formData.capacidadKg}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      setFormData({ ...formData, capacidadKg: value === "" ? 0 : Number(value) });
                    }
                  }}
                  placeholder="0"
                  className="bg-white/80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacidadM3" className="block h-10 flex items-center">Capacidad típica (m³) *</Label>
                <Input
                  id="capacidadM3"
                  type="text"
                  value={formData.capacidadM3 === 0 ? "" : formData.capacidadM3}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      setFormData({ ...formData, capacidadM3: value === "" ? 0 : Number(value) });
                    }
                  }}
                  placeholder="0"
                  className="bg-white/80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="multiplicadorCosto" className="block h-10 flex items-center">Multiplicador costo *</Label>
                <Input
                  id="multiplicadorCosto"
                  type="text"
                  value={formData.multiplicadorCosto === 0 ? "" : formData.multiplicadorCosto}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      setFormData({ ...formData, multiplicadorCosto: value === "" ? 0 : Number(value) });
                    }
                  }}
                  placeholder="1"
                  className="bg-white/80"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rangoSoportado">Rango soportado *</Label>
              <Select
                value={formData.rangoSoportado}
                onValueChange={(value) => setFormData({ ...formData, rangoSoportado: value })}
              >
                <SelectTrigger id="rangoSoportado" className="bg-white/80">
                  <SelectValue placeholder="Selecciona un rango" />
                </SelectTrigger>
                <SelectContent>
                  {rangoOpciones.map((rango) => (
                    <SelectItem key={rango} value={rango}>
                      {rango}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="requiereFrio"
                  checked={formData.requiereFrio}
                  onCheckedChange={(checked) => setFormData({ ...formData, requiereFrio: checked })}
                />
                <Label htmlFor="requiereFrio" className="flex items-center gap-2">
                  <Snowflake className="w-4 h-4 text-blue-500" />
                  Requiere refrigeración
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                />
                <Label htmlFor="activo">Activo</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white"
              >
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTipo}
        onOpenChange={(open) => !open && setDeleteTipo(null)}
        title="Eliminar tipo de transporte"
        description={`Â¿EstÃ¡s seguro de que deseas eliminar el tipo "${deleteTipo?.nombre}"?`}
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        variant="danger"
      />
    </div>
  );
}



