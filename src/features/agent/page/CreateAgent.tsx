import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

import CreateAgentForm from "@/features/agent/component/CreateAgentForm"
import { createAgentAPI } from "../api/agentAPI";
import type {CreateAgentFormData} from "@/features/agent/schema/types"


export default function CreateAgent() {
  const navigate = useNavigate();
  const initialValues: CreateAgentFormData = { name: "" };
  const {register,handleSubmit,formState: { errors }} = useForm({ defaultValues: initialValues, mode: "onChange" });
  const queryClient = useQueryClient();


  const { mutate, isPending } = useMutation({
    mutationFn: createAgentAPI,
      onError:(error)=>{
        toast.error(error.message)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agents"]});
      toast.success(data.message);
      navigate("/agent");
    }
  })

  const handleForm = async (formData: CreateAgentFormData) => {
    if(isPending) return;
    mutate(formData)
    
  };

  return (
    <div className="form-page">
      <div className="form-page-inner">
        <div className="form-page-header">
          <h1 className="form-page-title">Crear Nuevo Agente</h1>
        </div>

        <div className="form-nav">
          <Link to="/agent" className="form-nav-back">
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
            <CreateAgentForm register={register} errors={errors} />
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
              "Crear Agente"
            )}
            </button>
          </form>
        </div>

        <div className="form-footer">
          <p>Los cambios se aplicarán inmediatamente después de crear el agente</p>
        </div>
      </div>
    </div>
  );
}
