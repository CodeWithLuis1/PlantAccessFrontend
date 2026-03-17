import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import {useForm} from 'react-hook-form'
import { toast } from "react-toastify"

import CreateCompanyForm from "./CreateCompanyForm"
import { updateCompanyAPI } from "../api/companyAPI"
import type { CreateCompanyFormData } from "../schema/types"

type EditCompanyFormProps = {
    data:CreateCompanyFormData
    companyId: number
}
export default function EditCompanyForm({data, companyId}:EditCompanyFormProps) {
    const navigate = useNavigate()

    const {register, handleSubmit, formState:{errors}} = useForm({defaultValues:{
        name: data.name
    }})

    const queryClient = useQueryClient();
    const {mutate,isPending} = useMutation({
        mutationFn: updateCompanyAPI,
        onError:(error) =>{
            toast.error(error.message)
        },
        onSuccess: async (data)=>{
            await queryClient.invalidateQueries({queryKey:['companies']})
            await queryClient.invalidateQueries({queryKey:['editCompany',companyId]})
            toast.success(data.message)
            navigate('/company')
        }
    })

    const handleForm = (formData: CreateCompanyFormData) =>{
        const data = {
            formData,
            companyId
        }
        mutate(data)
    }

  if (data) return(
          <div className="form-page">
              <div className="form-page-inner">
                  <div className="form-page-header">
                      <h1 className="form-page-title">
                          Editar Empresa
                      </h1>
                  </div>
                  <div className="form-nav">
                      <Link
                          to="/company"
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
                      <form
                      className="p-8 space-y-6"
                      onSubmit={handleSubmit(handleForm)}
                      noValidate
                      >
                      <CreateCompanyForm register={register} errors={errors}/>
                      <button
                          type="submit"
                          className="form-submit" 
                          disabled={isPending}
                      >
                          {isPending ? (
                          <span className="flex items-center gap-2">
                             <span className="animate-spin">⏳</span>
                            Guardando...
                          </span>
                            ) : (
                            "Guardar Cambios"
                            )}
                      </button>
                      </form>
                  </div>
  
                  <div className="form-footer">
                       <p>Los cambios se aplicarán inmediatamente después de guardar los cambios</p>
                  </div>
              </div>
          </div>
    )
}
