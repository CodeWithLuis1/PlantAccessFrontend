import { useFormContext, Controller, useFieldArray } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import Select from "react-select"
import { ErrorMessage } from "@/shared/components/ErrorMessage"
import { searchableSelectStyles, getSelectClassNames } from "@/shared/components/ui/searchableSelectStyles"
import type { CheckInFormData } from "@/features/visits/schema/Types"
import type { VisitResponse } from "@/features/visits/schema/Types"
import { getAgentForSelectAPI } from "@/features/agent/api/agentAPI"

type CheckInFormProps = {
    visit: VisitResponse | undefined
}

export default function CheckInForm({ visit }: CheckInFormProps) {
    const { register, control, formState: { errors } } = useFormContext<CheckInFormData>()
    const { fields } = useFieldArray({ control, name: "companions" })

    const { data: agents } = useQuery({
        queryKey: ["agent-select"],
        queryFn: getAgentForSelectAPI,
    })

    const agentOptions = agents?.map(a => ({ value: a.id, label: a.name })) ?? []

    if (!visit) return null

    return (
        <div className="form-container">

            <div className="form-group">
                <label className="form-label">Persona que llegó</label>
                <p className="form-input form-input-normal bg-slate-50 text-slate-700">
                    {visit.company_person
                        ? `${visit.company_person.name} - DPI: ${visit.company_person.document_number}`
                        : "—"}
                </p>
            </div>

            <div className="form-group">
                <label htmlFor="badge_number" className="form-label">
                    Número de gafete <span className="required">*</span>
                </label>
                <input
                    id="badge_number"
                    type="text"
                    placeholder="Ej. G-045"
                    className={`form-input ${errors.badge_number ? "form-input-error" : "form-input-normal"}`}
                    {...register("badge_number", { required: "El número de gafete es obligatorio" })}
                />
                {errors.badge_number && <ErrorMessage>{errors.badge_number.message}</ErrorMessage>}
            </div>

            <div className="form-group">
                <label htmlFor="entry_time" className="form-label">
                    Hora de entrada <span className="required">*</span>
                </label>
                <input
                    id="entry_time"
                    type="time"
                    className={`form-input ${errors.entry_time ? "form-input-error" : "form-input-normal"}`}
                    {...register("entry_time", { required: "La hora de entrada es obligatoria" })}
                />
                {errors.entry_time && <ErrorMessage>{errors.entry_time.message}</ErrorMessage>}
            </div>

            <div className="form-group">
                <label className="form-label">
                    Agente que registra <span className="required">*</span>
                </label>
                <Controller
                    name="agent_id"
                    control={control}
                    rules={{ required: "El agente es obligatorio" }}
                    render={({ field }) => (
                        <Select
                            {...field}
                            options={agentOptions}
                            placeholder="Seleccionar agente..."
                            isClearable
                            isSearchable
                            noOptionsMessage={() => "No hay agentes disponibles"}
                            value={agentOptions.find(o => o.value === field.value) || null}
                            onChange={selected => field.onChange(selected?.value ?? null)}
                            classNames={getSelectClassNames(!!errors.agent_id)}
                            styles={searchableSelectStyles}
                        />
                    )}
                />
                {errors.agent_id && <ErrorMessage>{errors.agent_id.message}</ErrorMessage>}
            </div>

            {fields.length > 0 && (
                <div className="form-group">
                    <label className="form-label mb-2">Acompañantes</label>
                    {fields.map((field, index) => {
                        const companion = visit.visit_companions?.[index]
                        return (
                            <div key={field.id} className="border border-slate-200 rounded-lg p-3 mb-2 space-y-2">
                                <p className="text-sm font-medium text-slate-600">Acompañante {index + 1}</p>
                                <p className="text-sm text-slate-700 bg-slate-50 rounded px-3 py-2">
                                    {companion?.company_person
                                        ? `${companion.company_person.name} - DPI: ${companion.company_person.document_number}`
                                        : "—"}
                                </p>
                                <input
                                    type="text"
                                    placeholder="Número de gafete (Ej. G-046)"
                                    className="form-input form-input-normal"
                                    {...register(`companions.${index}.badge_number` as `companions.${number}.badge_number`, { required: true })}
                                />
                            </div>
                        )
                    })}
                </div>
            )}

        </div>
    )
}