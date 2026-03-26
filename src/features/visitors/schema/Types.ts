import { paginationSchema } from "@/shared/schemas/paginateSchemas"
import {z} from "zod"

export const createVisitorSchema = z.object({
    company_id: z.number(),
    name: z.string(),
    document_number: z.string(),
    document_photo_front: z.string(),
    document_photo_back: z.string(),
    license_number: z.string(),
    license_photo: z.string(),
})

export const responseVisitorSchema = z.object({
    id: z.number(),
    company_id: z.number(),
    name: z.string(),
    document_number: z.string(),
    document_photo_front: z.string().nullable(),
    document_photo_back: z.string().nullable(),
    license_number: z.string().nullable(),
    license_photo: z.string().nullable(),
    company: z.object({
        name: z.string()
    }).nullable(),
})

export const getVisitorByIdSchema = z.object({
    id: z.number(),
    company_id: z.number(),
    name: z.string(),
    document_number: z.string(),
    document_photo_front: z.string().nullable(),
    document_photo_back: z.string().nullable(),
    license_number: z.string().nullable(),
    license_photo: z.string().nullable(),
})

export const getVisitor = paginationSchema(responseVisitorSchema)
export type CreateVisitorFormData = z.infer<typeof createVisitorSchema>
export type VisitorByIdData = z.infer<typeof getVisitorByIdSchema>
export type ResponseVisitorSchema = z.infer<typeof getVisitor>
