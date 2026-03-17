import { Link, useNavigate } from "react-router-dom";
import type { CreateUserFormData } from "@/features/users/schemas/types";
import { useForm } from "react-hook-form";
import {useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserAPI } from "@/features/users/api/UserAPI";
import { toast } from "react-toastify";
import CreateUserForm from "@/features/users/components/CreateUserForm";

export default function CreateUserView() {
  const navigate = useNavigate();
  const initialValues: CreateUserFormData = { name:"",username:"", password:"", role_id:0, department_id:0 };

  const {register,handleSubmit,formState: { errors },} = useForm<CreateUserFormData>({
    defaultValues: initialValues,
    mode: "all",
    reValidateMode: "onChange",
  });
  
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: createUserAPI,
    onError: (error) => toast.error(error.message),
    onSuccess: (response) => {
      queryClient.invalidateQueries({queryKey:["users"]})
      toast.success(response);
      navigate("/user");
    },
  });

  const handleForm = async (data: CreateUserFormData) => mutate(data);

  return (
    <div className="form-page">
      <div className="form-page-inner">
        <div className="form-page-header">
          <h1 className="form-page-title">
            Crear Nuevo Usuario
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
            <CreateUserForm register={register} errors={errors} />
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
                "Crear Usuario"
              )}
              
            </button>
          </form>
        </div>

        <div className="form-footer">
          <p>Los cambios se aplicarán inmediatamente después de crear el usuario</p>
        </div>
      </div>
    </div>
  );
}
