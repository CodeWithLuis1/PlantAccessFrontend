import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { TableContainer, TableHeader, Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty, TableActions } from "@/shared/components/ui/StyledTable"
import { Pencil, Eye, X, Trash2 } from "lucide-react"
import { toast } from "react-toastify"
import { getVisitsAPI, deleteVisitAPI } from "@/features/visits/api/VisitAPI"
import PaginationComponent from "@/shared/components/PaginationComponent"
import { useAuth } from "@/hooks/useAuth"

const STATUS_BADGE: Record<string, string> = {
    PROGRAMADA: "badge-warning",
    "EN PLANTA": "badge-success",
    FINALIZADA: "badge-info",
    CANCELADA: "badge-error",
}

function StatusBadge({ name }: { name?: string }) {
    if (!name) return <span className="text-slate-400">—</span>
    return <span className={STATUS_BADGE[name] ?? "badge-info"}>{name}</span>
}

function PhotoPreviewModal({ url, onClose }: { url: string; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={onClose}
        >
            <div
                className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-4"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                    title="Cerrar"
                >
                    <X size={20} />
                </button>
                <img
                    src={url}
                    alt="Vista previa"
                    className="w-full h-auto rounded max-h-[75vh] object-contain mt-4"
                />
            </div>
        </div>
    )
}

// Inline delete confirmation modal — shown when user clicks the trash button
function ConfirmDeleteModal({ visitId, onClose }: { visitId: number; onClose: () => void }) {
    const queryClient = useQueryClient()

    const { mutate, isPending } = useMutation({
        mutationFn: () => deleteVisitAPI(visitId),
        onError: (error) => { toast.error(error.message); onClose() },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["visits"] })
            toast.success(data.message)
            onClose()
        },
    })

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={onClose}
        >
            <div
                className="relative bg-white rounded-lg shadow-xl w-full max-w-sm p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-base font-semibold text-slate-800">Eliminar visita #{visitId}</h2>
                <p className="text-sm text-slate-600">
                    ¿Estás seguro? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => mutate()}
                        disabled={isPending}
                        className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isPending ? "Eliminando..." : "Sí, eliminar"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function TableVisits() {
    const { permissions } = useAuth()
    const canDelete = permissions.includes("visits:delete")

    const [currentPage, setCurrentPage] = useState(1)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    // ID of the visit pending delete confirmation, null when no modal open
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

    const today = new Date().toISOString().split("T")[0]
    const [selectedDate, setSelectedDate] = useState(today)

    const { data, isLoading, isError } = useQuery({
        queryKey: ["visits", selectedDate, currentPage],
        queryFn: () => getVisitsAPI(currentPage, { date: selectedDate }),
    })

    if (isLoading) return <p className="p-8 text-center text-slate-500">Cargando visitas...</p>
    if (isError) return <p className="p-8 text-center text-red-500">Error al cargar las visitas.</p>

    const list = data?.visits ?? []
    const totalPages = data?.lastPage ?? 1

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
            {previewUrl && (
                <PhotoPreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
            )}
            {confirmDeleteId !== null && (
                <ConfirmDeleteModal
                    visitId={confirmDeleteId}
                    onClose={() => setConfirmDeleteId(null)}
                />
            )}
            <div className="max-w-7xl w-full">
                <TableContainer>
                    <TableHeader
                        title="Listado de visitas"
                        linkTo="/visits/create"
                        linkText="Crear Visita"
                    />

                    <div className="px-6 py-3 flex items-center gap-3 border-b border-slate-200">
                        <label className="text-sm font-semibold text-slate-600">Fecha:</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={e => { setSelectedDate(e.target.value); setCurrentPage(1) }}
                            className="form-input form-input-normal text-sm py-1 w-48"
                        />
                        {selectedDate !== today && (
                            <button
                                onClick={() => setSelectedDate(today)}
                                className="text-xs text-amber-600 hover:underline"
                            >
                                Hoy
                            </button>
                        )}
                    </div>

                    {list.length > 0 ? (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <Th>ID</Th>
                                    <Th>Fecha de la visita</Th>
                                    <Th>Visitante</Th>
                                    <Th align="center">DPI / Licencia</Th>
                                    <Th>Acompañantes</Th>
                                    <Th>Departamento</Th>
                                    <Th>Área de Destino</Th>
                                    <Th>Responsable</Th>
                                    <Th align="center">H. Entrada</Th>
                                    <Th align="center">H. Salida</Th>
                                    <Th align="center">Estado</Th>
                                    <Th align="center">Acciones</Th>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {list.map(visit => (
                                    <TableRow key={visit.id}>
                                        <Td>{visit.id}</Td>
                                        <Td>
                                            {visit.date
                                                ? visit.date.split("T")[0].split("-").reverse().join("/")
                                                : "—"}
                                        </Td>
                                        <Td>
                                            <div className="text-sm">
                                                <p className="font-medium">{visit.company?.name ?? "—"}</p>
                                                {visit.company_person && (
                                                    <p className="text-slate-400">{visit.company_person.name}</p>
                                                )}
                                            </div>
                                        </Td>
                                        <Td align="center">
                                            <div className="flex items-center justify-center gap-2">
                                                {visit.company_person?.document_photo_front ? (
                                                    <button
                                                        onClick={() => setPreviewUrl(visit.company_person!.document_photo_front!)}
                                                        className="btn-icon btn-icon-primary"
                                                        title="Ver DPI"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">—</span>
                                                )}
                                                {visit.company_person?.license_photo ? (
                                                    <button
                                                        onClick={() => setPreviewUrl(visit.company_person!.license_photo!)}
                                                        className="btn-icon btn-icon-primary"
                                                        title="Ver Licencia"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">—</span>
                                                )}
                                            </div>
                                        </Td>
                                        <Td>
                                            {visit.visit_companions && visit.visit_companions.length > 0 ? (
                                                <ul className="text-sm space-y-1">
                                                    {visit.visit_companions.map((c, i) => (
                                                        <li key={c.id ?? i} className="text-slate-600">
                                                            <span className="font-medium">{c.company_person?.name ?? "—"}</span>
                                                            <span className="text-slate-400 ml-1">DPI: {c.company_person?.document_number ?? "—"}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="text-slate-400 text-sm">—</span>
                                            )}
                                        </Td>
                                        <Td>{visit.department?.name ?? "—"}</Td>
                                        <Td>{visit.destination}</Td>
                                        <Td>{visit.responsible_person ?? "—"}</Td>
                                        <Td align="center">{visit.entry_time ?? "—"}</Td>
                                        <Td align="center">{visit.exit_time ?? "—"}</Td>
                                        <Td align="center">
                                            <StatusBadge name={visit.visit_status?.name} />
                                        </Td>
                                        <Td align="center">
                                            <TableActions>
                                                <Link
                                                    to={`/visit/${visit.id}/edit`}
                                                    className="btn-icon btn-icon-primary"
                                                    title="Editar"
                                                >
                                                    <Pencil size={16} />
                                                </Link>
                                                {/* Delete button — only for PROGRAMADA visits and users with visits:delete permission */}
                                                {canDelete && visit.visit_status?.name === "PROGRAMADA" && (
                                                    <button
                                                        onClick={() => setConfirmDeleteId(visit.id)}
                                                        className="btn-icon btn-icon-danger"
                                                        title="Eliminar visita"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </TableActions>
                                        </Td>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <TableEmpty message="No hay visitas registradas para esta fecha" />
                    )}

                    <PaginationComponent
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </TableContainer>
            </div>
        </div>
    )
}
