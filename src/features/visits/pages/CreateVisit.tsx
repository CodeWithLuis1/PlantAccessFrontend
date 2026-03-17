import { useForm, FormProvider } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import CreateVisitForm from "@/features/visits/components/CreateVisitForm"
import type { CreateVisitFormData } from "@/features/visits/schema/Types"
import { createVisitAPI } from "@/features/visits/api/VisitAPI"

export default function CreateVisit() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const today = new Date().toISOString().split("T")[0]

    const initialValues: CreateVisitFormData = {
        visitor_id: 0,
        date: today,
        department_id: 0,
        responsible_person: "",
        destination: "",
    }

    const methods = useForm({ defaultValues: initialValues, mode: "onChange" })

    const { mutate, isPending } = useMutation({
        mutationFn: createVisitAPI,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["visits"] })
            toast.success(data.message)
            navigate("/visits")
        },
    })

    const handleForm = (formData: CreateVisitFormData) => {
        if (isPending) return
        mutate(formData)
        console.log("data we set", formData)
    }

    return (
        <div className="form-page">
            <div className="form-page-inner">
                <div className="form-page-header">
                    <h1 className="form-page-title">Programar nueva visita</h1>
                </div>
                <div className="form-nav">
                    <Link to="/visits" className="form-nav-back">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Regresar
                    </Link>
                </div>
                <div className="form-card">
                    <div className="form-card-accent"></div>
                    <FormProvider {...methods}>
                        <form className="form-card-body" onSubmit={methods.handleSubmit(handleForm)} noValidate>
                            <CreateVisitForm />
                            <button type="submit"
                                disabled={isPending}
                                className="form-submit" 
                            >
                                {isPending?(
                                  <span className="flex items-center gap-2">
                                        <span className="animate-spin">⏳</span>
                                        Creando...
                                 </span>
                                ):(
                                    "Crear Visita"
                                )}

                            </button>
                        </form>
                    </FormProvider>
                </div>
                <div className="form-footer">
                    <p>La visita quedará en estado PROGRAMADA hasta que el visitante llegue a planta</p>
                </div>
            </div>
        </div>
    )
}
