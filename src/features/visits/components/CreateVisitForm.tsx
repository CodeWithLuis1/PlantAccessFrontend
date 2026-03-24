import { useFormContext, Controller, useFieldArray } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import Select from "react-select"
import { ErrorMessage } from "@/shared/components/ErrorMessage"
import { toUpper } from "@/shared/helpers/textTransformUppercase"
import { searchableSelectStyles, getSelectClassNames } from "@/shared/components/ui/searchableSelectStyles"
import type { CreateVisitFormData } from "@/features/visits/schema/Types"
import { getVisitorsForSelectAPI } from "@/features/visits/api/VisitAPI"
import { departmentForSelectAPI } from "@/features/department/api/departmentAPI"
import { Plus, Trash2 } from "lucide-react"
import { getVisitorPersonsByVisitorAPI } from "@/features/visits/api/VisitAPI"

export default function CreateVisitForm() {
    const { register, control, watch, formState: { errors } } = useFormContext<CreateVisitFormData>()
    const { fields, append, remove } = useFieldArray({ control, name: "companions" })

    const visitorId = watch("visitor_id")

    const { data: visitors } = useQuery({
        queryKey: ["visitors-select"],
        queryFn: getVisitorsForSelectAPI,
    })

    const { data: departments } = useQuery({
        queryKey: ["department-select"],
        queryFn: departmentForSelectAPI,
    })

    const { data: visitorPersons } = useQuery({
        queryKey: ["visitor-persons-select", visitorId],
        queryFn: () => getVisitorPersonsByVisitorAPI(visitorId),
        enabled: !!visitorId && visitorId > 0,
    })

    const visitorOptions = visitors?.map(v => ({ value: v.id, label: v.name })) ?? []
    const departmentOptions = departments?.map(d => ({ value: d.id, label: d.name })) ?? []
    const personOptions = visitorPersons?.map(p => ({ value: p.id, label: `${p.name} - DPI: ${p.document_number}` })) ?? []

    return (
        <div className="form-container">
            <div className="form-group">
                <label className="form-label">
                    Visitante / Empresa <span className="required">*</span>
                </label>
                <Controller
                    name="visitor_id"
                    control={control}
                    rules={{ required: "El visitante es obligatorio" }}
                    render={({ field }) => (
                        <Select
                            {...field}
                            options={visitorOptions}
                            placeholder="Buscar empresa o proveedor..."
                            isClearable
                            isSearchable
                            noOptionsMessage={() => "No se encontraron visitantes"}
                            value={visitorOptions.find(o => o.value === field.value) || null}
                            onChange={selected => field.onChange(selected?.value ?? null)}
                            classNames={getSelectClassNames(!!errors.visitor_id)}
                            styles={searchableSelectStyles}
                        />
                    )}
                />
                {errors.visitor_id && <ErrorMessage>{errors.visitor_id.message}</ErrorMessage>}
            </div>

            <div className="form-group">
                <label className="form-label">
                    Persona que llegará <span className="required">*</span>
                </label>
                <Controller
                    name="visitor_person_id"
                    control={control}
                    rules={{ required: "Debe seleccionar la persona que llegará" }}
                    render={({ field }) => (
                        <Select
                            {...field}
                            options={personOptions}
                            placeholder="Seleccionar persona..."
                            isClearable
                            isSearchable
                            isDisabled={!visitorId || visitorId === 0}
                            noOptionsMessage={() => "No hay personas registradas para este visitante"}
                            value={personOptions.find(o => o.value === field.value) || null}
                            onChange={selected => field.onChange(selected?.value ?? null)}
                            classNames={getSelectClassNames(!!errors.visitor_person_id)}
                            styles={searchableSelectStyles}
                        />
                    )}
                />
                {errors.visitor_person_id && <ErrorMessage>{errors.visitor_person_id.message}</ErrorMessage>}
            </div>

            <div className="form-group">
                <div className="flex items-center justify-between mb-2">
                    <label className="form-label mb-0">Acompañantes</label>
                    <button
                        type="button"
                        onClick={() => append({ visitor_person_id: 0 })}
                        className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium"
                        disabled={!visitorId || visitorId === 0}
                    >
                        <Plus size={16} /> Agregar acompañante
                    </button>
                </div>

                {fields.length === 0 && (
                    <p className="text-sm text-slate-400 italic">Sin acompañantes</p>
                )}

                {fields.map((field, index) => (
                    <div key={field.id} className="border border-slate-200 rounded-lg p-3 mb-2 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600">Acompañante {index + 1}</span>
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-red-400 hover:text-red-600"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <Controller
                            name={`companions.${index}.visitor_person_id` as `companions.${number}.visitor_person_id`}
                            control={control}
                            rules={{ required: true }}
                            render={({ field: f }) => (
                                <Select
                                    {...f}
                                    options={personOptions}
                                    placeholder="Seleccionar persona..."
                                    isClearable
                                    isSearchable
                                    noOptionsMessage={() => "No hay personas disponibles"}
                                    value={personOptions.find(o => o.value === f.value) || null}
                                    onChange={selected => f.onChange(selected?.value ?? null)}
                                    styles={searchableSelectStyles}
                                />
                            )}
                        />
                    </div>
                ))}
            </div>

            <div className="form-group">
                <label htmlFor="date" className="form-label">
                    Fecha de visita <span className="required">*</span>
                </label>
                <input
                    id="date"
                    type="date"
                    className={`form-input ${errors.date ? "form-input-error" : "form-input-normal"}`}
                    {...register("date", { required: "La fecha es obligatoria" })}
                />
                {errors.date && <ErrorMessage>{errors.date.message}</ErrorMessage>}
            </div>

            <div className="form-group">
                <label className="form-label">
                    Departamento destino <span className="required">*</span>
                </label>
                <Controller
                    name="department_id"
                    control={control}
                    rules={{ required: "El departamento es obligatorio" }}
                    render={({ field }) => (
                        <Select
                            {...field}
                            options={departmentOptions}
                            placeholder="Seleccionar departamento..."
                            isClearable
                            noOptionsMessage={() => "No hay departamentos disponibles"}
                            value={departmentOptions.find(o => o.value === field.value) || null}
                            onChange={selected => field.onChange(selected?.value ?? null)}
                            classNames={getSelectClassNames(!!errors.department_id)}
                            styles={searchableSelectStyles}
                        />
                    )}
                />
                {errors.department_id && <ErrorMessage>{errors.department_id.message}</ErrorMessage>}
            </div>

            <div className="form-group">
                <label htmlFor="responsible_person" className="form-label">
                    Persona responsable <span className="required">*</span>
                </label>
                <input
                    id="responsible_person"
                    type="text"
                    placeholder="Nombre de quien recibe la visita"
                    readOnly
                    className={`form-input form-input-normal bg-slate-50 cursor-default`}
                    {...register("responsible_person", {
                        setValueAs: toUpper,
                        required: "La persona responsable es obligatoria",
                    })}
                />
                {errors.responsible_person && <ErrorMessage>{errors.responsible_person.message}</ErrorMessage>}
            </div>

            <div className="form-group">
                <label htmlFor="destination" className="form-label">
                    Destino / Área <span className="required">*</span>
                </label>
                <input
                    id="destination"
                    type="text"
                    placeholder="Ej. Oficina de Gerencia, Bodega 2..."
                    className={`form-input ${errors.destination ? "form-input-error" : "form-input-normal"}`}
                    {...register("destination", {
                        setValueAs: toUpper,
                        required: "El destino es obligatorio",
                    })}
                />
                {errors.destination && <ErrorMessage>{errors.destination.message}</ErrorMessage>}
            </div>

        </div>
    )
}