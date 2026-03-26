import { useForm } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify"
import { ErrorMessage } from "@/shared/components/ErrorMessage"
import type { CheckOutFormData } from "@/features/visits/schema/Types"
import { checkOutAPI, getVisitByIdAPI } from "@/features/visits/api/VisitAPI"

export default function CheckOutView() {
    const { visitId } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

    const { data: visit, isLoading } = useQuery({
        queryKey: ["visit", visitId],
        queryFn: () => getVisitByIdAPI(Number(visitId)),
        enabled: !!visitId,
    })

    const { register, handleSubmit, formState: { errors } } = useForm<CheckOutFormData>({
        defaultValues: { exit_time: currentTime },
        mode: "onChange",
    })

    const { mutate, isPending } = useMutation({
        mutationFn: (formData: CheckOutFormData) => checkOutAPI({ visitId: Number(visitId), formData }),
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["visits"] })
            queryClient.invalidateQueries({ queryKey: ["visit", visitId] })
            toast.success(data.message)
            navigate("/visits")
        },
    })

    const handleForm = (formData: CheckOutFormData) => {
        if (isPending) return
        mutate(formData)
    }

    if (isLoading) return <p className="p-8 text-center text-slate-500">Cargando datos de la visita...</p>

    return (
        <div className="form-page">
            <div className="form-page-inner">
                <div className="form-page-header">
                    <h1 className="form-page-title">Registro de salida</h1>
                </div>
                <div className="form-nav">
                    <Link to="/visits" className="form-nav-back">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Regresar
                    </Link>
                </div>

                {visit && (
                    <div className="form-card mb-4">
                        <div className="form-card-accent"></div>
                        <div className="p-5 space-y-2 text-sm text-slate-700">
                            <p><span className="font-semibold">Empresa / Visitante:</span> {visit.company?.name ?? "—"}</p>
                            <p><span className="font-semibold">Persona que ingresó:</span> {visit.company_person?.name ?? "—"}</p>
                            <p><span className="font-semibold">DPI:</span> {visit.company_person?.document_number ?? "—"}</p>
                            <p><span className="font-semibold">Entrada:</span> {visit.entry_time ?? "—"}</p>
                            <p><span className="font-semibold">Gafete:</span> {visit.badge_number ?? "—"}</p>
                            <p><span className="font-semibold">Acompañantes:</span> {visit.visit_companions?.length ? `${visit.visit_companions.length}` : "Ninguno"}</p>
                        </div>
                    </div>
                )}

                <div className="form-card">
                    <div className="form-card-accent"></div>
                    <form className="form-card-body" onSubmit={handleSubmit(handleForm)} noValidate>
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
                        <button type="submit" className="form-submit" disabled={isPending}>
                            {isPending ? "Registrando..." : "Confirmar salida"}
                        </button>
                    </form>
                </div>
                <div className="form-footer">
                    <p>Al confirmar la salida, la visita quedará como FINALIZADA</p>
                </div>
            </div>
        </div>
    )
}
