/**
 * Tests unitarios para checkInAPI y checkOutAPI.
 *
 * Verifica el manejo correcto de éxito, errores del servidor (Axios)
 * y errores de red (no-Axios) que anteriormente se silenciaban.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest'
import { checkInAPI, checkOutAPI } from '@/features/visits/api/VisitAPI'
import api from '@/shared/api/axios'

vi.mock('@/shared/api/axios', () => ({
    default: { patch: vi.fn() },
}))

/** Crea un objeto que imita un AxiosError con respuesta del servidor */
function makeAxiosError(responseMessage: string, status = 422) {
    const err = new Error(responseMessage) as Error & {
        isAxiosError: boolean
        response: { data: { message: string }; status: number }
    }
    err.isAxiosError = true
    err.response = { data: { message: responseMessage }, status }
    return err
}

const BASE_CHECKIN = {
    entry_time: '08:30',
    badge_number: 'G-001',
    agent_id: 1,
}

// ── checkInAPI ──────────────────────────────────────────────────────────────

describe('checkInAPI', () => {
    beforeEach(() => { vi.clearAllMocks() })

    it('retorna los datos del servidor en una solicitud exitosa', async () => {
        vi.mocked(api.patch).mockResolvedValue({
            data: { message: 'Check-in registrado correctamente' },
        })

        const result = await checkInAPI({ visitId: 1, formData: BASE_CHECKIN })

        expect(result).toEqual({ message: 'Check-in registrado correctamente' })
        expect(api.patch).toHaveBeenCalledWith('/visit/1/checkin', BASE_CHECKIN)
    })

    it('lanza un Error con el mensaje del servidor cuando la API responde con error', async () => {
        vi.mocked(api.patch).mockRejectedValue(
            makeAxiosError('El número de gafete ya está en uso')
        )

        await expect(
            checkInAPI({ visitId: 1, formData: BASE_CHECKIN })
        ).rejects.toThrow('El número de gafete ya está en uso')
    })

    it('relanza errores de red sin silenciarlos (bug fix: antes retornaba undefined)', async () => {
        const networkError = new Error('Network Error')
        vi.mocked(api.patch).mockRejectedValue(networkError)

        await expect(
            checkInAPI({ visitId: 1, formData: BASE_CHECKIN })
        ).rejects.toThrow('Network Error')
    })

    it('incluye acompañantes en el payload cuando se proporcionan', async () => {
        vi.mocked(api.patch).mockResolvedValue({ data: { message: 'OK' } })

        const formDataWithCompanions = {
            ...BASE_CHECKIN,
            companions: [{ badge_number: 'G-002' }, { badge_number: 'G-003' }],
        }

        await checkInAPI({ visitId: 5, formData: formDataWithCompanions })

        expect(api.patch).toHaveBeenCalledWith('/visit/5/checkin', formDataWithCompanions)
    })
})

// ── checkOutAPI ─────────────────────────────────────────────────────────────

describe('checkOutAPI', () => {
    beforeEach(() => { vi.clearAllMocks() })

    it('retorna los datos del servidor en una solicitud exitosa', async () => {
        vi.mocked(api.patch).mockResolvedValue({
            data: { message: 'Salida registrada correctamente' },
        })

        const result = await checkOutAPI({ visitId: 1, formData: { exit_time: '17:00' } })

        expect(result).toEqual({ message: 'Salida registrada correctamente' })
        expect(api.patch).toHaveBeenCalledWith('/visit/1/checkout', { exit_time: '17:00' })
    })

    it('lanza un Error con el mensaje del servidor cuando la API responde con error', async () => {
        vi.mocked(api.patch).mockRejectedValue(
            makeAxiosError('La visita no está en estado EN PLANTA')
        )

        await expect(
            checkOutAPI({ visitId: 1, formData: { exit_time: '17:00' } })
        ).rejects.toThrow('La visita no está en estado EN PLANTA')
    })

    it('relanza errores de red sin silenciarlos (bug fix: antes retornaba undefined)', async () => {
        const networkError = new Error('Network Error')
        vi.mocked(api.patch).mockRejectedValue(networkError)

        await expect(
            checkOutAPI({ visitId: 1, formData: { exit_time: '17:00' } })
        ).rejects.toThrow('Network Error')
    })
})
