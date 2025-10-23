import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2, Mail, RotateCcw, Power, Users, Shield } from "lucide-react";
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
import { Textarea } from "../ui/textarea";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "sonner";

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  rol: string;
  estado: "invitado" | "activo" | "suspendido";
  twoFA: boolean;
  ultimoAcceso: string;
  notas: string;
}

const mockUsuarios: Usuario[] = [
  {
    id: "1",
    nombre: "Juan Pérez",
    email: "juan.perez@logix.com",
    telefono: "+54 11 1234-5678",
    rol: "Admin",
    estado: "activo",
    twoFA: true,
    ultimoAcceso: "2025-10-17 14:30",
    notas: "",
  },
  {
    id: "2",
    nombre: "María García",
    email: "maria.garcia@logix.com",
    telefono: "+54 11 8765-4321",
    rol: "Operador",
  
    estado: "activo",
    twoFA: false,
    ultimoAcceso: "2025-10-17 09:15",
    notas: "Turno mañana",
  },
  {
    id: "3",
    nombre: "Carlos López",
    email: "carlos.lopez@logix.com",
    telefono: "+54 11 5555-1234",
    rol: "Transportista",
    estado: "activo",
    twoFA: false,
    ultimoAcceso: "2025-10-16 18:45",
    notas: "",
  },
  {
    id: "5",
    nombre: "Pedro Rodríguez",
    email: "pedro.rodriguez@logix.com",
    telefono: "+54 11 3333-9999",
    rol: "Operador",
    estado: "invitado",
    twoFA: false,
    ultimoAcceso: "-",
    notas: "Pendiente aceptar invitación",
  },
];

const roles = ["Admin", "Operador", "Transportista"];
const estados = ["invitado", "activo", "suspendido"];

export function UsuariosConfig() {
  const [searchValue, setSearchValue] = useState("");
  const [filterRol, setFilterRol] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [usuarios, setUsuarios] = useState<Usuario[]>(mockUsuarios);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [deleteUsuario, setDeleteUsuario] = useState<Usuario | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    rol: "Operador",
    estado: "invitado" as "invitado" | "activo" | "suspendido",
    twoFA: false,
    notas: "",
  });

  const filteredUsuarios = usuarios.filter((usuario) => {
    const matchesSearch = 
      usuario.nombre.toLowerCase().includes(searchValue.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchValue.toLowerCase());
    const matchesRol = filterRol === "todos" || usuario.rol === filterRol;
    const matchesEstado = filterEstado === "todos" || usuario.estado === filterEstado;
    return matchesSearch && matchesRol && matchesEstado;
  });

  const handleNew = () => {
    setEditingUsuario(null);
    setFormData({
      nombre: "",
      email: "",
      telefono: "",
      rol: "Operador",
      estado: "invitado",
      twoFA: false,
      notas: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      telefono: usuario.telefono,
      rol: usuario.rol,
      estado: usuario.estado,
      twoFA: usuario.twoFA,
      notas: usuario.notas,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const errores: string[] = [];

    // Validar Nombre completo
    if (!formData.nombre.trim()) {
      errores.push("El campo Nombre completo es requerido y no puede estar vacío");
    }

    // Validar Email
    if (!formData.email.trim()) {
      errores.push("El campo Email es requerido y no puede estar vacío");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errores.push("El Email debe tener un formato válido (ejemplo@dominio.com)");
      }
    }

    // Validar email único
    const emailExiste = usuarios.some(
      u => u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== editingUsuario?.id
    );

    if (emailExiste) {
      errores.push("Ya existe un usuario con este email");
    }

    // Validar Teléfono si está presente
    if (formData.telefono.trim()) {
      const telefonoNumeros = formData.telefono.replace(/\D/g, "");
      if (telefonoNumeros.length < 7) {
        errores.push("El Teléfono debe contener al menos 7 dígitos numéricos");
      }
    }

    // Validar Rol
    if (!formData.rol) {
      errores.push("El campo Rol es requerido");
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

    if (editingUsuario) {
      setUsuarios(usuarios.map(u =>
        u.id === editingUsuario.id
          ? { ...u, ...formData }
          : u
      ));
      toast.success("Usuario actualizado correctamente");
    } else {
      const newUsuario: Usuario = {
        id: String(Date.now()),
        ...formData,
        ultimoAcceso: "-",
      };
      setUsuarios([...usuarios, newUsuario]);
      toast.success("Usuario creado correctamente");
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteUsuario) {
      setUsuarios(usuarios.filter(u => u.id !== deleteUsuario.id));
      toast.success("Usuario eliminado correctamente");
      setDeleteUsuario(null);
    }
  };

  const handleInvitar = (usuario: Usuario) => {
    toast.success(`Invitación enviada a ${usuario.email}`);
  };

  const handleResetPassword = (usuario: Usuario) => {
    toast.success(`Email de restablecimiento enviado a ${usuario.email}`);
  };

  const handleToggleSuspender = (usuario: Usuario) => {
    setUsuarios(usuarios.map(u =>
      u.id === usuario.id
        ? { ...u, estado: u.estado === "suspendido" ? "activo" : "suspendido" }
        : u
    ));
    toast.success(usuario.estado === "suspendido" ? "Usuario activado" : "Usuario suspendido");
  };

  const getEstadoConfig = (estado: string) => {
    const configs = {
      activo: { estado: "success" as const, label: "Activo" },
      suspendido: { estado: "error" as const, label: "Suspendido" },
      invitado: { estado: "warning" as const, label: "Invitado" },
    };
    return configs[estado as keyof typeof configs] || configs.activo;
  };

  const columns: ColumnDef<Usuario>[] = [
    {
      accessorKey: "nombre",
      header: createSortableHeader("Nombre"),
      cell: ({ row }) => (
        <div>
          <div className="text-gray-800">{row.original.nombre}</div>
          <div className="text-sm text-gray-500">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
      cell: ({ row }) => row.original.telefono || "-",
    },
    {
      accessorKey: "rol",
      header: "Rol",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-600" />
          {row.original.rol}
        </div>
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const config = getEstadoConfig(row.original.estado);
        return <BadgeEstado estado={config.estado} label={config.label} />;
      },
    },
    {
      accessorKey: "ultimoAcceso",
      header: createSortableHeader("Último acceso"),
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.original.ultimoAcceso}</span>
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
            <DropdownMenuSeparator />
            {row.original.estado === "invitado" && (
              <DropdownMenuItem onClick={() => handleInvitar(row.original)}>
                <Mail className="mr-2 h-4 w-4" />
                Enviar invitación
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => handleResetPassword(row.original)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleSuspender(row.original)}>
              <Power className="mr-2 h-4 w-4" />
              {row.original.estado === "suspendido" ? "Activar" : "Suspender"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setDeleteUsuario(row.original)}
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
    <div>
      <Toolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onNewClick={handleNew}
        newButtonLabel="Nuevo usuario"
        filters={[
          {
            label: "Rol",
            value: filterRol,
            options: [
              { label: "Todos", value: "todos" },
              ...roles.map(r => ({ label: r, value: r })),
            ],
            onChange: setFilterRol,
          },
          {
            label: "Estado",
            value: filterEstado,
            options: [
              { label: "Todos", value: "todos" },
              { label: "Activo", value: "activo" },
              { label: "Invitado", value: "invitado" },
              { label: "Suspendido", value: "suspendido" },
            ],
            onChange: setFilterEstado,
          },
        ]}
      />

      {filteredUsuarios.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No hay usuarios registrados"
          description="Comienza invitando a tu primer usuario"
          actionLabel="Nuevo usuario"
          onAction={handleNew}
        />
      ) : (
        <DataTable columns={columns} data={filteredUsuarios} />
      )}

      {/* Modal Nueva/Editar */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="backdrop-blur-xl bg-white/95 max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingUsuario ? "Editar usuario" : "Nuevo usuario"}
            </DialogTitle>
            <DialogDescription>
              {editingUsuario ? "Modifica la información del usuario" : "Completa los datos para crear un nuevo usuario"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Juan Pérez"
                className="bg-white/80"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@logix.com"
                className="bg-white/80"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="+54 11 1234-5678"
                className="bg-white/80"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rol">Rol *</Label>
                <Select
                  value={formData.rol}
                  onValueChange={(value) => setFormData({ ...formData, rol: value })}
                >
                  <SelectTrigger className="bg-white/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((rol) => (
                      <SelectItem key={rol} value={rol}>
                        {rol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value: any) => setFormData({ ...formData, estado: value })}
                >
                  <SelectTrigger className="bg-white/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem key={estado} value={estado} className="capitalize">
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Switch
                id="twoFA"
                checked={formData.twoFA}
                onCheckedChange={(checked) => setFormData({ ...formData, twoFA: checked })}
              />
              <Label htmlFor="twoFA">Requerir autenticación de dos factores (2FA)</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Notas adicionales sobre el usuario"
                rows={3}
                className="bg-white/80"
              />
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

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deleteUsuario}
        onOpenChange={(open) => !open && setDeleteUsuario(null)}
        title="Eliminar usuario"
        description={`¿Estás seguro de que deseas eliminar al usuario "${deleteUsuario?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        variant="danger"
      />
    </div>
  );
}
