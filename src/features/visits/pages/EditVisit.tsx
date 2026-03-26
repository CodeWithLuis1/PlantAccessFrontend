import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify"
import { Pencil, Trash2, LogIn, LogOut } from "lucide-react"
import CreateVisitForm from "@/features/visits/components/CreateVisitForm"
import type { CreateVisitFormData } from "@/features/visits/schema/Types"
import { getVisitByIdAPI, updateVisitAPI, deleteVisitAPI } from "@/features/visits/api/VisitAPI"
import { useAuth } from "@/hooks/useAuth"

const STATUS_BADGE: Record<string, string> = {
    PROGRAMADA: "badge-warning",
    "EN PLANTA": "badge-success",
    FINALIZADA: "badge-info",
    CANCELADA: "badge-error",
}

function VisitSummary({ visit }: { visit: NonNullable<Awaited<ReturnType<typeof getVisitByIdAPI>>> }) {
    const statusName = visit.visit_status?.name ?? ""
    return (
        <div className="form-card mb-4">
            <div className="form-card-accent"></div>
            <div className="p-5 space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Resumen de visita</span>
                    {statusName && (
                        <span className={STATUS_BADGE[statusName] ?? "badge-info"}>{statusName}</span>
                    )}
                </div>
                <p><span className="font-semibold">Empresa / Visitante:</span> {visit.company?.name ?? "—"}</p>
                {visit.company_person && (
                    <p><span className="font-semibold">Persona:</span> {visit.company_person.name}</p>
                )}
                <p><span className="font-semibold">Departamento:</span> {visit.department?.name ?? "—"}</p>
                <p><span className="font-semibold">Responsable:</span> {visit.responsible_person ?? "—"}</p>
                <p><span className="font-semibold">Destino:</span> {visit.destination ?? "—"}</p>
                {visit.visit_companions && visit.visit_companions.length > 0 && (
                    <p><span className="font-semibold">Acompañantes:</span> {visit.visit_companions.length}</p>
                )}
                {visit.entry_time && (
                    <p><span className="font-semibold">Hora de entrada:</span> {visit.entry_time}</p>
                )}
                {visit.badge_number && (
                    <p><span className="font-semibold">Gafete:</span> {visit.badge_number}</p>
                )}
                {visit.exit_time && (
                    <p><span className="font-semibold">Hora de salida:</span> {visit.exit_time}</p>
                )}
            </div>
        </div>
    )
}

// Collapsible edit form — only rendered when the user has visits:edit permission
function EditSection({ visitId, visit }: {
    visitId: number
    visit: NonNullable<Awaited<ReturnType<typeof getVisitByIdAPI>>>
}) {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()

    const defaultValues: CreateVisitFormData = {
        company_id: visit.company_id ?? 0,
        company_person_id: visit.company_person_id ?? 0,
        date: visit.date ? visit.date.split("T")[0] : "",
        department_id: visit.department_id ?? 0,
        responsible_person: visit.responsible_person ?? "",
        destination: visit.destination ?? "",
        companions: visit.visit_companions?.map(c => ({ company_person_id: c.company_person_id ?? 0 })) ?? [],
    }

    const methods = useForm<CreateVisitFormData>({ defaultValues, mode: "onChange" })

    const { mutate, isPending } = useMutation({
        mutationFn: (formData: CreateVisitFormData) => updateVisitAPI({ visitId, formData }),
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["visits"] })
            queryClient.invalidateQueries({ queryKey: ["visit", String(visitId)] })
            toast.success(data.message)
            setIsOpen(false)
        },
    })

    return (
        <div className="form-card mb-4">
            <div className="form-card-accent"></div>
            <div className="p-5">
                <button
                    type="button"
                    onClick={() => setIsOpen(prev => !prev)}
                    className="flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                >
                    <Pencil size={16} />
                    {isOpen ? "Cancelar edición" : "Editar datos de la visita"}
                </button>

                {isOpen && (
                    <FormProvider {...methods}>
                        <form
                            className="mt-4"
                            onSubmit={methods.handleSubmit((formData) => { if (!isPending) mutate(formData) })}
                            noValidate
                        >
                            <CreateVisitForm />
                            <div className="mt-4">
                                <button type="submit" disabled={isPending} className="form-submit">
                                    {isPending ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin">⏳</span>
                                            Guardando...
                                        </span>
                                    ) : "Guardar cambios"}
                                </button>
                            </div>
                        </form>
                    </FormProvider>
                )}
            </div>
        </div>
    )
}

// Navigation card to check-in page — only rendered when the user has visits:checkin permission
function CheckInCard({ visitId }: { visitId: number }) {
    return (
        <div className="form-card mb-4">
            <div className="form-card-accent bg-green-500"></div>
            <div className="p-5 flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-700">Registrar entrada</p>
                    <p className="text-xs text-slate-400 mt-0.5">El visitante llegó a la planta</p>
                </div>
                <Link
                    to={`/visits/${visitId}/checkin`}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors shadow-sm"
                >
                    <LogIn size={16} />
                    Registrar entrada
                </Link>
            </div>
        </div>
    )
}

// Navigation card to check-out page — only rendered when the user has visits:checkout permission
function CheckOutCard({ visitId }: { visitId: number }) {
    return (
        <div className="form-card mb-4">
            <div className="form-card-accent bg-blue-500"></div>
            <div className="p-5 flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-700">Registrar salida</p>
                    <p className="text-xs text-slate-400 mt-0.5">El visitante está saliendo de la planta</p>
                </div>
                <Link
                    to={`/visits/${visitId}/checkout`}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-sm"
                >
                    <LogOut size={16} />
                    Registrar salida
                </Link>
            </div>
        </div>
    )
}

// Danger zone with inline confirmation — only rendered when the user has visits:delete permission
function DeleteSection({ visitId }: { visitId: number }) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [confirming, setConfirming] = useState(false)

    const { mutate, isPending } = useMutation({
        mutationFn: () => deleteVisitAPI(visitId),
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["visits"] })
            toast.success(data.message)
            navigate("/visits")
        },
    })

    return (
        <div className="form-card border border-red-100 mt-4">
            <div className="form-card-accent bg-red-500"></div>
            <div className="p-5">
                {!confirming ? (
                    <button
                        type="button"
                        onClick={() => setConfirming(true)}
                        className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
                    >
                        <Trash2 size={16} />
                        Eliminar visita
                    </button>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-slate-700 font-medium">
                            ¿Confirmar eliminación? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => { if (!isPending) mutate() }}
                                disabled={isPending}
                                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isPending ? "Eliminando..." : "Sí, eliminar"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirming(false)}
                                disabled={isPending}
                                className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function EditVisit() {
    const { visitId } = useParams()
    const { permissions } = useAuth()

    const { data: visit, isLoading } = useQuery({
        queryKey: ["visit", visitId],
        queryFn: () => getVisitByIdAPI(Number(visitId)),
        enabled: !!visitId,
    })

    if (isLoading) return <p className="p-8 text-center text-slate-500">Cargando datos de la visita...</p>
    if (!visit) return <p className="p-8 text-center text-red-500">Visita no encontrada.</p>

    const status = visit.visit_status?.name ?? ""
    const canEdit     = permissions.includes("visits:edit")
    const canDelete   = permissions.includes("visits:delete")
    const canCheckIn  = permissions.includes("visits:checkin")
    const canCheckOut = permissions.includes("visits:checkout")

    return (
        <div className="form-page">
            <div className="form-page-inner">
                <div className="form-page-header">
                    <h1 className="form-page-title">Detalle de visita</h1>
                </div>
                <div className="form-nav">
                    <Link to="/visits" className="form-nav-back">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Regresar
                    </Link>
                </div>

                <VisitSummary visit={visit} />

                {status === "PROGRAMADA" && (
                    <>
                        {canEdit    && <EditSection visitId={Number(visitId)} visit={visit} />}
                        {canCheckIn && <CheckInCard visitId={Number(visitId)} />}
                        {canDelete  && <DeleteSection visitId={Number(visitId)} />}
                    </>
                )}

                {status === "EN PLANTA" && (
                    <>
                        {canCheckOut ? (
                            <CheckOutCard visitId={Number(visitId)} />
                        ) : (
                            <div className="form-card">
                                <div className="form-card-accent bg-blue-500"></div>
                                <div className="p-5 text-sm text-slate-600">
                                    <p>El visitante está actualmente en planta. Pendiente de registro de salida.</p>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {(status === "FINALIZADA" || status === "CANCELADA") && (
                    <div className="form-card">
                        <div className="form-card-accent"></div>
                        <div className="p-5 text-sm text-slate-600">
                            <p>Esta visita ya no puede ser modificada.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
