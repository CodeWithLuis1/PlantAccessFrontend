import { Link } from "react-router-dom"
import {useForm} from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {toast} from "react-toastify"
import { useNavigate } from "react-router-dom"

import CreateAgentForm from "./CreateAgentForm"
import type { CreateAgentFormData } from "../schema/types"
import { updateAgentAPI } from "../api/agentAPI"

type EditAgentFormProps = {
    data: CreateAgentFormData
    agentId: number
}
export default function EditAgentForm({data, agentId}:EditAgentFormProps) {
    const navigate = useNavigate();

    const {register, handleSubmit, formState:{errors}} = useForm({defaultValues:{
        name: data.name
    }});

    const queryClient = useQueryClient();
    const {mutate, isPending} = useMutation({
        mutationFn: updateAgentAPI,
        onError:(error) => {
            toast.error(error.message)
        },
        onSuccess:(data)=>{
            queryClient.invalidateQueries({queryKey:['agents']})
            queryClient.invalidateQueries({queryKey:['editAgent', agentId]})
            toast.success(data.message)
            navigate('/agent')
        }
    })
    const handleForm = (formData: CreateAgentFormData) =>{
        const data = {
            formData,
            agentId
        }
        mutate(data)
    }
  if(data) return(
         <div className="form-page">
             <div className="form-page-inner">
                 <div className="form-page-header">
                     <h1 className="form-page-title">
                         Editar Agente
                     </h1>
                 </div>
                 <div className="form-nav">
                     <Link
                         to="/agent"
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
                     <CreateAgentForm register={register} errors={errors} />
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
