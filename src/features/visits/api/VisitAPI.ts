import { isAxiosError } from "axios"
import { z } from "zod"
import api from "@/shared/api/axios"
import type { CreateVisitFormData, CheckInFormData, CheckOutFormData } from "../schema/Types"
import { visitResponseSchema, getVisitsSchema } from "../schema/Types"

const visitsListSchema = z.array(visitResponseSchema)
const visitorSelectSchema = z.object({ id: z.number(), name: z.string() })
const visitorPersonSelectSchema = z.object({ id: z.number(), name: z.string(), document_number: z.string() })

export async function createVisitAPI(formData: CreateVisitFormData) {
    try {
        const { data } = await api.post("/visit", formData)
        console.log('The data we sent to create a ', data)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message)
        }
    }
}

export async function getVisitsTodayAPI() {
    try {
        const { data } = await api.get("/visit/today")
        return visitsListSchema.parse(data.data)
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.message)
        }
    }
}

export async function getVisitsAPI(page: number = 1, filters?: { date?: string; status?: string }) {
    try {
        const limit = 10;
        const { data } = await api.get("/visit", { params: { page, limit, ...filters } })
        const parsedData = getVisitsSchema.parse(data)
        return {
            visits: parsedData.response,
            lastPage: parsedData.lastPage,
        }
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message)
        }
        throw error
    }
}

export async function getVisitByIdAPI(visitId: number) {
    try {
        const { data } = await api.get(`/visit/${visitId}`)
        return visitResponseSchema.parse(data.data)
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message ?? error.message)
        }
        throw error
    }
}

export async function checkInAPI({ visitId, formData }: { visitId: number; formData: CheckInFormData }) {
    console.log("checkInAPI - visitId:", visitId, "formData:", formData)
    try {
        const { data } = await api.patch(`/visit/${visitId}/checkin`, formData)
        console.log("checkInAPI - response:", data)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.error("checkInAPI - error response:", error.response.data)
            throw new Error(error.response.data.message)
        }
        throw error
    }
}

export async function checkOutAPI({ visitId, formData }: { visitId: number; formData: CheckOutFormData }) {
    try {
        const { data } = await api.patch(`/visit/${visitId}/checkout`, formData)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message)
        }
        throw error
    }
}

export async function cancelVisitAPI(visitId: number) {
    try {
        const { data } = await api.patch(`/visit/${visitId}/cancel`)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message)
        }
    }
}

// Obtener visitantes (empresas/proveedores) para el select de crear visita
export async function getVisitorsForSelectAPI() {
    try {
        const { data } = await api.get("/company", { params: { all: true } })
        const parsed = visitorSelectSchema.array().safeParse(data.response)
        if (!parsed.success) throw new Error("Formato inválido de visitante para el select")
        return parsed.data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.message)
        }
    }
}

export async function updateVisitAPI({ visitId, formData }: { visitId: number; formData: CreateVisitFormData }) {
    try {
        const { data } = await api.patch(`/visit/${visitId}`, formData)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message)
        }
        throw error
    }
}

export async function deleteVisitAPI(visitId: number) {
    try {
        const { data } = await api.delete(`/visit/${visitId}`)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message)
        }
        throw error
    }
}

// Obtener personas de un visitante/empresa especifico (para el select del check-in)
export async function getVisitorPersonsByVisitorAPI(visitorId: number) {
    try {
        const { data } = await api.get(`/company-person/by-company/${visitorId}`)
        const parsed = visitorPersonSelectSchema.array().safeParse(data.data)
        if (!parsed.success) throw new Error("Formato inválido de personas del visitante")
        return parsed.data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.message)
        }
    }
}
