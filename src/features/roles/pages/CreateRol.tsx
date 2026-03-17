import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import CrearRolForm from "@/features/roles/components/CreateRolForm"
import { createRoleAPI } from "@/features/roles/api/RolAPI";
import type { CreateRolFormData } from "@/features/roles/schemas/types";

export default function CreateRol() {
  const navigate = useNavigate();
  const initialValues: CreateRolFormData = { name: "" };
  const {register,handleSubmit,formState: { errors },
  } = useForm<CreateRolFormData>({ defaultValues: initialValues, mode: "onChange" });

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateRolFormData) => createRoleAPI(data),
    onError:(error) => {
        toast.error(error.message)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success(data?.message);
      navigate("/role");
    },
  });

  const handleForm = async (data: CreateRolFormData) => mutate(data);

  return (
    <div className="form-page">
      <div className="form-page-inner">
        <div className="form-page-header">
          <h1 className="form-page-title">Crear Nuevo Rol</h1>
        </div>

        <div className="form-nav">
          <Link to="/role" className="form-nav-back">
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
            <CrearRolForm register={register} errors={errors} />
            <button type="submit" className="form-submit" disabled={isPending}>
              {isPending?(
                    <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span>
                                Guardando...
                    </span>
              ):(
                "Crear Rol"
              )}
            </button>
          </form>
        </div>

        <div className="form-footer">
          <p>Los cambios se aplicarán inmediatamente después de crear el rol</p>
        </div>
      </div>
    </div>
  );
}