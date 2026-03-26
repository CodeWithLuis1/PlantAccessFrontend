
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {toast} from "react-toastify"
import { useNavigate } from "react-router";


import CreateDepartmentForm from "./CreateDepartmentForm"
import { updateDepartmentAPI } from "../api/departmentAPI";
import type {CreateDepartmentFormData} from "@/features/department/schema/types"

type EditRoleProps = {
    data: CreateDepartmentFormData;
    departmentId: number
}

export default function EditDepartmentForm({data,departmentId}:EditRoleProps) {
    const navigate = useNavigate()

    const{register, handleSubmit, formState:{errors}} = useForm({defaultValues:{
        name: data.name,
        code: data.code
    }})

    const queryClient = useQueryClient();
    const {mutate,isPending} = useMutation({
        mutationFn: updateDepartmentAPI,
        onError:(error) =>{
            toast.error(error.message)
        },
        onSuccess(data){
            queryClient.invalidateQueries({queryKey:["departments"]})
            queryClient.invalidateQueries({queryKey:['editDepartment', departmentId]})
            queryClient.invalidateQueries({queryKey:["department-select"]})
            toast.success(data.message)
            navigate('/department')
        }
    })
    const handleForm = (formData: CreateDepartmentFormData) =>{
        const data = {
            formData,
            departmentId
        }
        mutate(data)
    }
 if(data) return(
          <div className="form-page">
              <div className="form-page-inner">
                  <div className="form-page-header">
                      <h1 className="form-page-title">
                          Editar Departamento
                      </h1>
                  </div>
                  <div className="form-nav">
                      <Link
                          to="/department"
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
                      <CreateDepartmentForm register={register} errors={errors}/>
                      <button
                          type="submit"
                          disabled={isPending}
                          className="form-submit" 
                      >
                        {isPending ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin">⏳</span>
                                Guardando...
                            </span>
                        ) : (
                            "Guardar cambios"
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
