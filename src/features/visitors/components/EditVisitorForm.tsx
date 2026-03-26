import { Link } from "react-router";
import { useForm, FormProvider } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {toast} from "react-toastify"
import { useNavigate } from "react-router";

import CreateVisitorForm from "./CreateVisitorForm";
import type { CreateVisitorFormData, VisitorByIdData } from "../schema/Types";
import { updateVisitorAPI } from "../api/VisitorsAPI";

type EditVisitorProps = {
    data: VisitorByIdData
    visitorId: number
}

export default function EditVisitorForm({data, visitorId}:EditVisitorProps) {
    const navigate = useNavigate();

    const methods = useForm({defaultValues:{
        name: data.name,
        company_id: data.company_id,
        document_number: data.document_number,
        document_photo_front: data.document_photo_front ?? "",
        document_photo_back: data.document_photo_back ?? "",
        license_number: data.license_number ?? "",
        license_photo: data.license_photo ?? "",
    }})
    const queryClient = useQueryClient();
    const {mutate, isPending} = useMutation({
        mutationFn: updateVisitorAPI,
        onError:(error) =>{
            toast.error(error.message)
        },
        onSuccess(data) {
            queryClient.invalidateQueries({queryKey:['visitor']})
            queryClient.invalidateQueries({queryKey:['editVisitor', visitorId]})
            queryClient.invalidateQueries({queryKey:['visitor-persons-select']})
            toast.success(data.message)
            navigate("/people")
        },
    })
    const handleForm = (formData: CreateVisitorFormData) =>{
        const data = {
            formData,
            visitorId
        }
        mutate(data)
    }
  if(data) return (
        <div className="form-page">
              <div className="form-page-inner">
                  <div className="form-page-header">
                      <h1 className="form-page-title">
                          Editar Visitante
                      </h1>
                  </div>
                  <div className="form-nav">
                      <Link
                          to="/people"
                          className="form-nav-back"
                      >
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
                      className="p-8 space-y-6"
                      onSubmit={methods.handleSubmit(handleForm)}
                      noValidate
                      >
                      <CreateVisitorForm
                          initialDpiFrontImage={data.document_photo_front ?? undefined}
                          initialDpiBackImage={data.document_photo_back ?? undefined}
                          initialLicenseImage={data.license_photo ?? undefined}
                      />
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
                            "Guardar Cambios"
                        )}
                      </button>
                      </form>
                      </FormProvider>
                  </div>
  
                  <div className="form-footer">
                       <p>Los cambios se aplicarán inmediatamente después de guardar los cambios</p>
                  </div>
              </div>
        </div>
  )
}
