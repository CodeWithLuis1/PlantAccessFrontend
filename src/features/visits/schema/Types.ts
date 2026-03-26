import { paginationSchema } from "@/shared/schemas/paginateSchemas"
import { z } from "zod"

export const createVisitSchema = z.object({
    company_id: z.number(),
    company_person_id: z.number(),
    date: z.string(),
    department_id: z.number(),
    responsible_person: z.string(),
    destination: z.string(),
    companions: z.array(z.object({
        company_person_id: z.number(),
    })).optional(),
})

export const checkInSchema = z.object({
    entry_time: z.string(),
    badge_number: z.string(),
    agent_id: z.number(),
    companions: z.array(z.object({
        badge_number: z.string(),
    })).optional(),
})

export const checkOutSchema = z.object({
    exit_time: z.string(),
})

const companyPersonSchema = z.object({
    id: z.number(),
    name: z.string(),
    document_number: z.string(),
    document_photo_front: z.string().nullable().optional(),
    license_number: z.string().nullable().optional(),
    license_photo: z.string().nullable().optional(),
})

export const visitResponseSchema = z.object({
    id: z.number(),
    date: z.string().nullable().optional(),
    entry_time: z.string().nullable().optional(),
    exit_time: z.string().nullable().optional(),
    visit_status_id: z.number().nullable().optional(),
    company_id: z.number().nullable().optional(),
    company_person_id: z.number().nullable().optional(),
    department_id: z.number().nullable().optional(),
    destination: z.string().nullable().optional(),
    responsible_person: z.string().nullable().optional(),
    badge_number: z.string().nullable().optional(),
    agent_id: z.number().nullable().optional(),
    visit_status: z.object({ id: z.number(), name: z.string() }).nullable().optional(),
    company: z.object({ id: z.number(), name: z.string() }).nullable().optional(),
    company_person: companyPersonSchema.nullable().optional(),
    department: z.object({ id: z.number(), name: z.string() }).nullable().optional(),
    agent: z.object({ id: z.number(), name: z.string() }).nullable().optional(),
    visit_companions: z.array(z.object({
        id: z.number(),
        company_person_id: z.number(),
        badge_number: z.string().nullable().optional(),
        company_person: z.object({ id: z.number(), name: z.string(), document_number: z.string() }).nullable().optional(),
    })).nullable().optional(),
})

export const getVisitsSchema = paginationSchema(visitResponseSchema)

export type GetVisitsApiResponse = z.infer<typeof getVisitsSchema>
export type CreateVisitFormData = z.infer<typeof createVisitSchema>
export type CheckInFormData = z.infer<typeof checkInSchema>
export type CheckOutFormData = z.infer<typeof checkOutSchema>
export type VisitResponse = z.infer<typeof visitResponseSchema>
