import { useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify"
import CheckInForm from "@/features/visits/components/CheckInForm"
import type { CheckInFormData } from "@/features/visits/schema/Types"
import { checkInAPI, getVisitByIdAPI } from "@/features/visits/api/VisitAPI"

export default function CheckInView() {
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

    const methods = useForm<CheckInFormData>({
        defaultValues: {
            entry_time: currentTime,
            badge_number: "",
            agent_id: 0,
            companions: [],
        },
        mode: "onChange",
    })

    useEffect(() => {
        if (visit) {
            methods.reset({
                entry_time: currentTime,
                badge_number: "",
                agent_id: 0,
                companions: visit.visit_companions?.map(() => ({ badge_number: "" })) ?? [],
            })
        }
    }, [visit])

    const { mutate, isPending } = useMutation({
        mutationFn: (formData: CheckInFormData) => checkInAPI({ visitId: Number(visitId), formData }),
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["visits"] })
            queryClient.invalidateQueries({ queryKey: ["visit", visitId] })
            toast.success(data.message)
            navigate("/visits")
        },
    })

    const handleForm = (formData: CheckInFormData) => {
        if (isPending) return
        console.log("Data we sent to checkIn", formData)
        mutate(formData)
    }

    if (isLoading) return <p className="p-8 text-center text-slate-500">Cargando datos de la visita...</p>

    if (!visit) return null

    return (
        <div className="form-page">
            <div className="form-page-inner">
                <div className="form-page-header">
                    <h1 className="form-page-title">Registro de entrada</h1>
                </div>
                <div className="form-nav">
                    <Link to="/visits" className="form-nav-back">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Regresar
                    </Link>
                </div>

                <div className="form-card mb-4">
                    <div className="form-card-accent"></div>
                    <div className="p-5 space-y-2 text-sm text-slate-700">
                        <p><span className="font-semibold">Empresa / Visitante:</span> {visit.company?.name ?? "—"}</p>
                        <p><span className="font-semibold">Departamento:</span> {visit.department?.name ?? "—"}</p>
                        <p><span className="font-semibold">Responsable:</span> {visit.responsible_person ?? "—"}</p>
                        <p><span className="font-semibold">Destino:</span> {visit.destination ?? "—"}</p>
                    </div>
                </div>

                <div className="form-card">
                    <div className="form-card-accent"></div>
                    <FormProvider {...methods}>
                        <form className="form-card-body" onSubmit={methods.handleSubmit(handleForm)} noValidate>
                            <CheckInForm visit={visit} />
                            <button type="submit"
                                className="form-submit"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <span className="flex items-center gap-2">
                                        <span className="animate-spin">⏳</span>
                                        Registrando....
                                    </span>
                                ) : (
                                    "Confirmar entrada"
                                )}
                            </button>
                        </form>
                    </FormProvider>
                </div>
            </div>
        </div>
    )
}