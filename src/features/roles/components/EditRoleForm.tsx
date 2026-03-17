import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {toast} from "react-toastify"
import { useNavigate } from "react-router";

import CrearRolForm from "./CreateRolForm"
import type { CreateRolFormData } from "../schemas/types";
import { updateRoleAPI } from "../api/RolAPI";

type EditRoleProps ={
    data:CreateRolFormData
    roleId: number
}

export default function EditRoleForm({data, roleId}:EditRoleProps) {
    const navigate = useNavigate();

    const{register, handleSubmit, formState:{errors}} = useForm({defaultValues:{
        name: data.name
    }})

    const queryClient = useQueryClient();
    const {mutate,isPending} = useMutation({
        mutationFn: updateRoleAPI,
        onError: (error) =>{
            toast.error(error.message)
        },
        onSuccess(data) {
            queryClient.invalidateQueries({queryKey:['roles']})
            queryClient.invalidateQueries({queryKey: ['editRole', roleId]})
            toast.success(data.message)
            navigate('/role')
        },
    })

    const handleForm = (formData: CreateRolFormData) =>{
        const data = {
            formData,
            roleId
        }
        mutate(data)
    }
    if(data) return(
          <div className="form-page">
              <div className="form-page-inner">
                  <div className="form-page-header">
                      <h1 className="form-page-title">
                          Editar Role
                      </h1>
                  </div>
                  <div className="form-nav">
                      <Link
                          to="/role"
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
                      <CrearRolForm register={register} errors={errors}/>
                      <button
                          type="submit"
                          className="form-submit"
                          disabled={isPending}
                      >
                          {isPending?(
                            <span className="flex items-center gap-2">
                                <span className="animate-spin">⏳</span>
                                Creando...
                            </span>
                          ):(
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
