import api from "@/shared/api/axios";
import { isAxiosError } from "axios";

export async function ExcelReportAPI(params:{ date: string; from: string; to: string }) {
    try {
        const {data} = await api.get("/reports/excel", {params})
        return data
    } catch (error) {
        if(isAxiosError(error) && error.message){
            throw new Error(error.message)
        }
    }
}