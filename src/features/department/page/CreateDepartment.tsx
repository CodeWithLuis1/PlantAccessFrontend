import {useForm} from "react-hook-form"
import {Link, useNavigate} from "react-router-dom"
import {toast} from "react-toastify"
import {useMutation,useQueryClient } from "@tanstack/react-query"


import CreateDepartmentForm from "@/features/department/components/CreateDepartmentForm"
import type { CreateDepartmentFormData } from "../schema/types"
import { createDepartmentAPI } from "../api/departmentAPI"

export default function CreateDepartment() {
    const navigate = useNavigate();
    const initialValues: CreateDepartmentFormData= {name: "", code:""};
    const {register, handleSubmit, formState:{errors}} = useForm({defaultValues:initialValues, mode: "onChange"})
    const queryClient = useQueryClient()

    const {mutate, isPending} = useMutation({
        mutationFn: createDepartmentAPI,
        onError:(error) => {
            toast.error(error.message)
        },
        onSuccess:(data) =>{
            queryClient.invalidateQueries({queryKey:["departments"]})
            toast.success(data.message)
            navigate("/department")
        }
    })

    const handleForm = async (formData: CreateDepartmentFormData) =>{
        if(isPending)
            return;
        mutate(formData)
    };

  return (
    <div className="form-page">
        <div className="form-page-inner">
            <div className="form-page-header">
                <h1 className="form-page-title">Crear Nuevo Departamento</h1>
            </div>
            <div className="form-nav">
                <Link to="/department" className="form-nav-back">
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
                          <CreateDepartmentForm register={register} errors={errors} />
                          <button type="submit"
                             disabled={isPending}
                             className="form-submit" 

                          >
                            {isPending ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin">⏳</span>
                                    Creando...
                                </span>
                            ) : (
                                "Crear departamento"
                            )}
                          </button>
                        </form>
                </div>
            </div>
            
            <div className="form-footer">
                 <p>Los cambios se aplicarán inmediatamente después de crear el departamento</p>
            </div>
    </div>
  )}
