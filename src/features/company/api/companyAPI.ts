import { isAxiosError } from "axios";
import api from "@/shared/api/axios";
import type {CreateCompanyFormData}  from "@/features/company/schema/types"
import {getCompanyResponse,companyForSelectSchema, getCompanyByIdSchema}  from "@/features/company/schema/types"

export async function createCompanyAPI(formData: CreateCompanyFormData) {
    try {
        const {data} = await api.post("/company",formData)
        return data;
    } catch (error) {
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.message)
        }
    }
}

export async function getCompanyAPI(page: number = 1) {
    try {
        const limit = 10;
        const {data} = await api.get("/company", {params:{page, limit}});
        const response = getCompanyResponse.safeParse(data);
        return response.data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.error("Error en getCompanyAPI:", error.response.data);
        } else {
        console.error("Error desconocido en getCompanyAPI:", error);
        }
        throw error;
  }
}

export async function getCompanyForSelectAPI() {
    try {
        const {data} = await api.get("/company", { params: { all: true } })
        const parsedData = companyForSelectSchema
            .array()
            .safeParse(data.response);
        if(!parsedData.success){
            throw new Error("Formato inválido de visitante para el select")
        }
        return parsedData.data;
    } catch (error) {
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.message)
        }
    }
}

export async function getCompanyByIdAPI(companyId: number) {
    try {
        const {data} = await api.get(`/company/${companyId}`)
        const response = getCompanyByIdSchema.safeParse(data.data)
        if(!response.success){
            throw new Error("Error al validar los datos del visitante")
        }
        return response.data
        
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.message)
        }
    }
}

type CompanyAPIType = {
    companyId: number;
    formData: CreateCompanyFormData
}

export async function updateCompanyAPI({companyId, formData}:CompanyAPIType) {
    try {
        const {data} = await api.patch(`/company/${companyId}`, formData)
        return data

    } catch (error) { 
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.message)
        }
    }
}