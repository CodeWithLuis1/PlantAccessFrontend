import { useForm, FormProvider } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify"
import { ErrorMessage } from "@/shared/components/ErrorMessage"
import CheckInForm from "@/features/visits/components/CheckInForm"
import type { CheckInFormData, CheckOutFormData } from "@/features/visits/schema/Types"
import { checkInAPI, checkOutAPI, getVisitByIdAPI } from "@/features/visits/api/VisitAPI"

function now() {
    const d = new Date()
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

function VisitSummary({ visit }: { visit: NonNullable<Awaited<ReturnType<typeof getVisitByIdAPI>>> }) {
    return (
        <div className="form-card mb-4">
            <div className="form-card-accent"></div>
            <div className="p-5 space-y-2 text-sm text-slate-700">
                <p><span className="font-semibold">Empresa / Visitante:</span> {visit.visitor?.name ?? "—"}</p>
                <p><span className="font-semibold">Departamento:</span> {visit.department?.name ?? "—"}</p>
                <p><span className="font-semibold">Responsable:</span> {visit.responsible_person ?? "—"}</p>
                <p><span className="font-semibold">Destino:</span> {visit.destination ?? "—"}</p>
                {visit.visitor_person && (
                    <p><span className="font-semibold">Persona que ingresó:</span> {visit.visitor_person.name}</p>
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

function CheckInSection({ visitId, visitorId }: { visitId: number; visitorId: number }) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const methods = useForm<CheckInFormData>({
        defaultValues: {
            visitor_person_id: 0,
            entry_time: now(),
            badge_number: "",
            agent_id: 0,
            companions: [],
        },
        mode: "onChange",
    })

    const { mutate, isPending } = useMutation({
        mutationFn: (formData: CheckInFormData) => checkInAPI({ visitId, formData }),
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["visits"] })
            queryClient.invalidateQueries({ queryKey: ["visit", String(visitId)] })
            toast.success(data.message)
            navigate("/visits")
        },
    })

    return (
        <div className="form-card">
            <div className="form-card-accent"></div>
            <FormProvider {...methods}>
                <form
                    className="form-card-body"
                    onSubmit={methods.handleSubmit((formData) => { if (!isPending) mutate(formData) })}
                    noValidate
                >
                    <CheckInForm visitorId={visitorId} />
                    <button type="submit" 
                        disabled={isPending}
                        className="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md"
                    >
                        {isPending?(
                            <span className="flex items-center gap-2">
                                <span className="animate-spin">⏳</span>
                                    Registrando...
                            </span>
                                ):(
                                "Confirmar entrada"
                        )}
                    </button>
                </form>
            </FormProvider>
        </div>
    )
}

function CheckOutSection({ visitId }: { visitId: number }) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { register, handleSubmit, formState: { errors } } = useForm<CheckOutFormData>({
        defaultValues: { exit_time: now() },
        mode: "onChange",
    })

    const { mutate, isPending } = useMutation({
        mutationFn: (formData: CheckOutFormData) => checkOutAPI({ visitId, formData }),
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["visits"] })
            queryClient.invalidateQueries({ queryKey: ["visit", String(visitId)] })
            toast.success(data.message)
            navigate("/visits")
        },
    })

    return (
        <div className="form-card">
            <div className="form-card-accent"></div>
            <form
                className="form-card-body"
                onSubmit={handleSubmit((formData) => { if (!isPending) mutate(formData) })}
                noValidate
            >
                <div className="form-container">
                    <div className="form-group">
                        <label htmlFor="exit_time" className="form-label">
                            Hora de salida <span className="required">*</span>
                        </label>
                        <input
                            id="exit_time"
                            type="time"
                            className={`form-input ${errors.exit_time ? "form-input-error" : "form-input-normal"}`}
                            {...register("exit_time", { required: "La hora de salida es obligatoria" })}
                        />
                        {errors.exit_time && <ErrorMessage>{errors.exit_time.message}</ErrorMessage>}
                    </div>
                </div>
                <button type="submit" 
                    className="form-submit" 
                    disabled={isPending}
                >
                    {isPending?(
                        <span className="flex items-center gap-2">
                            <span className="animate-spin">⏳</span>
                            Registrando...
                        </span>
                    ):(
                        "Confirmar salida"
                    )}
                </button>
            </form>
        </div>
    )
}

const STATUS_TITLE: Record<string, string> = {
    PROGRAMADA: "Registro de entrada",
    "EN PLANTA": "Registro de salida",
    FINALIZADA: "Visita finalizada",
    CANCELADA: "Visita cancelada",
}

export default function EditVisit() {
    const { visitId } = useParams()
    const { data: visit, isLoading } = useQuery({
        queryKey: ["visit", visitId],
        queryFn: () => getVisitByIdAPI(Number(visitId)),
        enabled: !!visitId,
    })

    if (isLoading) return <p className="p-8 text-center text-slate-500">Cargando datos de la visita...</p>
    if (!visit) return <p className="p-8 text-center text-red-500">Visita no encontrada.</p>

    const status = visit.visit_status?.name ?? ""
    const title = STATUS_TITLE[status] ?? "Editar visita"

    return (
        <div className="form-page">
            <div className="form-page-inner">
                <div className="form-page-header">
                    <h1 className="form-page-title">{title}</h1>
                    <span className="text-sm text-slate-500">Estado actual: <strong>{status}</strong></span>
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
                    <CheckInSection visitId={Number(visitId)} visitorId={visit.visitor_id ?? 0} />
                )}

                {status === "EN PLANTA" && (
                    <CheckOutSection visitId={Number(visitId)} />
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
