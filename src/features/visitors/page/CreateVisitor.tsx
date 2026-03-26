import { useForm, FormProvider } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {Link, useNavigate} from "react-router-dom"
import {toast} from "react-toastify"

import CreateVisitorForm from "@/features/visitors/components/CreateVisitorForm"
import type { CreateVisitorFormData } from "../schema/Types"
import {createVisitorAPI} from "@/features/visitors/api/VisitorsAPI"

export default function CreateVisitor() {
    const navigate = useNavigate();
    const initialValues: CreateVisitorFormData = { company_id: 0, name: "", document_number: "", document_photo_front: "", document_photo_back: "", license_number: "", license_photo: "" };
    const methods = useForm({ defaultValues: initialValues, mode: "onChange" })
    const queryClient = useQueryClient()

    const {mutate, isPending} = useMutation({
        mutationFn: createVisitorAPI,
            onError:(error)=> {
                toast.error(error.message)
            },
            onSuccess:(data) => {
                queryClient.invalidateQueries({queryKey:["visitors"]})
                queryClient.invalidateQueries({queryKey:["visitor-persons-select"]})
                toast.success(data.message)
                navigate("/people")
            }
    })
    const handleForm = async (formData: CreateVisitorFormData)=>{
        if(isPending)
            return;
        if(!formData.document_photo_front && !formData.license_photo){
            toast.error("Debe agregar al menos una fotografía (DPI frontal o Licencia)");
            return;
        }
        mutate(formData)
    }
    return (
        <div className="form-page">
            <div className="form-page-inner">
                <div className="form-page-header">
                    <h1 className="form-page-title"> Crear nuevo visitante</h1>
                </div>
                <div className="form-nav">
                    <Link to="/people" className="form-nav-back" >
                        <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                        </svg>
                        Regresar
                    </Link>
                </div>
                <div className="form-card">
                    <div className="form-card-accent"></div>
                    <FormProvider {...methods}>
                        <form
                            className="form-card-body"
                            onSubmit={methods.handleSubmit(handleForm)}
                            noValidate
                        >
                            <CreateVisitorForm />
                            <button 
                                type="submit"
                                disabled={isPending}
                                className="form-submit" 
                            >
                                {isPending?(
                                    <span className="flex items-center gap-2">
                                        <span className="animate-spin">⏳</span>
                                        Guardando...
                                    </span>
                                ):(
                                    "Crear Visitante"
                                )}
                            </button>
                        </form>
                    </FormProvider>
                </div>
                <div className="form-footer">
                    <p>Los cambios se aplicarán inmediatamente después de crear el visitante</p>
                </div>
            </div>
        </div>
  )
}
