import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {toast} from "react-toastify"
import { useNavigate } from "react-router";

import CreateUserForm from "./CreateUserForm"
import type {CreateUserFormData} from "features/users/schemas/types"
import { updateUserAPI } from "../api/UserAPI";

type EditUserFormProps = {
    data: CreateUserFormData
    userId: number
}

export default function EditUserForm({data, userId}:EditUserFormProps) {
    const navigate = useNavigate();
    
    const {register, handleSubmit, formState:{errors}, setValue}= useForm<CreateUserFormData>({defaultValues:{
        name: data.name,
        username: data.username,
        password: "",
        role_id: data.role_id,
        department_id: data.department_id
    }})

    const queryClient = useQueryClient();
    const {mutate, isPending} = useMutation({
        mutationFn: updateUserAPI,
        onError:(error) =>{
            toast.error(error.message)
        },
        onSuccess:(data)=>{
            queryClient.invalidateQueries({queryKey:['users']})
            queryClient.invalidateQueries({queryKey:['editUser',userId]})
            toast.success(data.message)
            navigate('/user')
        }
    })
    const handleForm = (formData: CreateUserFormData)=>{
        const data = {
            formData, 
            userId
        }
        mutate(data)
    }
    
    if(data)  return(
        <div className="form-page">
            <div className="form-page-inner">
                <div className="form-page-header">
                    <h1 className="form-page-title">
                        Editar Usuario
                    </h1>
                </div>
                <div className="form-nav">
                    <Link
                        to="/user"
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
                    <CreateUserForm register={register} errors={errors} setValue={setValue} defaultRoleId={data.role_id} defaultDepartmentId={data.department_id} />
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
