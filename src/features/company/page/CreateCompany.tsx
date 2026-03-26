import {useMutation, useQueryClient} from "@tanstack/react-query"
import {useForm} from "react-hook-form"
import {Link, useNavigate} from "react-router-dom"
import {toast} from "react-toastify"


import CreateCompanyForm from "@/features/company/component/CreateCompanyForm"
import { createCompanyAPI } from "../api/companyAPI"
import type { CreateCompanyFormData } from "../schema/types"
export default function CreateCompany() {
  const navigate = useNavigate();
  const initialValues: CreateCompanyFormData = {name:""};
  const {register, handleSubmit, formState: {errors}} = useForm({defaultValues:initialValues, mode: "onChange"})
  const queryClient = useQueryClient()

  const {mutate, isPending} = useMutation({
    mutationFn: createCompanyAPI,
      onError:(error) => {
        toast.error(error.message)
      },
      onSuccess:(data) =>{
        queryClient.invalidateQueries({queryKey: ["companies"]})
        queryClient.invalidateQueries({queryKey: ["company-select"]})
        queryClient.invalidateQueries({queryKey: ["visitors-select"]})
        toast.success(data.message)
        navigate("/company")
      }
  })

  const handleForm = (formData: CreateCompanyFormData) => {
      mutate(formData)
  };

 return (
    <div className="form-page">
      <div className="form-page-inner">
        <div className="form-page-header">
          <h1 className="form-page-title">Crear Nueva empresa</h1>
        </div>
        <div className="form-nav">
          <Link to ="/company" className="form-nav-back" >
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
              className="form-card-body"
              onSubmit={handleSubmit(handleForm)}
              noValidate
            >
              <CreateCompanyForm register={register} errors={errors} />
              <button type="submit"
                className="form-submit" 
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                      Creando...
                  </span>
                    ) : (
                      "Crear Empresa"
                )}
              </button>
            </form>
        </div>

        <div className="form-footer">
          <p>Los cambios se aplicarán inmediatamente después de crear la empresa</p>
        </div>
      </div>
    </div>
  )
}
