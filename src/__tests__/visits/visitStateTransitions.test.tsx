/**
 * Tests de transiciones de estado de visitas.
 *
 * Verifica que EditVisit muestre los controles correctos según el
 * estado de la visita: PROGRAMADA, EN PLANTA, FINALIZADA, CANCELADA.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import EditVisit from '@/features/visits/pages/EditVisit'
import { getVisitByIdAPI } from '@/features/visits/api/VisitAPI'
import { useAuth } from '@/hooks/useAuth'
import type { VisitResponse } from '@/features/visits/schema/Types'

vi.mock('@/features/visits/api/VisitAPI', () => ({
    getVisitByIdAPI: vi.fn(),
    updateVisitAPI: vi.fn(),
    deleteVisitAPI: vi.fn(),
}))

vi.mock('@/hooks/useAuth', () => ({
    useAuth: vi.fn(),
}))

vi.mock('react-toastify', () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}))

// Permisos completos para que todos los botones sean visibles
const ALL_PERMS = ['visits:edit', 'visits:delete', 'visits:checkin', 'visits:checkout']

function makeVisit(statusName: string): VisitResponse {
    return {
        id: 1,
        visit_status: { id: 1, name: statusName },
        visit_status_id: 1,
        company: { id: 1, name: 'Empresa Test' },
        company_person: {
            id: 1,
            name: 'Juan Pérez',
            document_number: '1234567890101',
            document_photo_front: null,
            license_number: null,
            license_photo: null,
        },
        department: { id: 1, name: 'Seguridad' },
        responsible_person: 'María López',
        destination: 'Bodega 3',
        date: '2026-03-25T00:00:00Z',
        entry_time: null,
        exit_time: null,
        badge_number: null,
        agent_id: null,
        agent: null,
        company_id: 1,
        company_person_id: 1,
        department_id: 1,
        visit_companions: null,
    }
}

function setup() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/visits/1']}>
                <Routes>
                    <Route path="/visits/:visitId" element={<EditVisit />} />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    )
}

describe('EditVisit — renderizado según estado de visita', () => {
    beforeEach(() => {
        vi.mocked(useAuth).mockReturnValue({ permissions: ALL_PERMS } as any)
    })

    it('PROGRAMADA: muestra el enlace de registrar entrada', async () => {
        vi.mocked(getVisitByIdAPI).mockResolvedValue(makeVisit('PROGRAMADA'))
        setup()

        expect(await screen.findByRole('link', { name: /registrar entrada/i })).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: /registrar salida/i })).not.toBeInTheDocument()
        expect(screen.queryByText('Esta visita ya no puede ser modificada.')).not.toBeInTheDocument()
    })

    it('EN PLANTA: muestra el enlace de registrar salida', async () => {
        vi.mocked(getVisitByIdAPI).mockResolvedValue(makeVisit('EN PLANTA'))
        setup()

        expect(await screen.findByRole('link', { name: /registrar salida/i })).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: /registrar entrada/i })).not.toBeInTheDocument()
        expect(screen.queryByText('Esta visita ya no puede ser modificada.')).not.toBeInTheDocument()
    })

    it('FINALIZADA: muestra mensaje de solo lectura sin botones de acción', async () => {
        vi.mocked(getVisitByIdAPI).mockResolvedValue(makeVisit('FINALIZADA'))
        setup()

        expect(await screen.findByText('Esta visita ya no puede ser modificada.')).toBeInTheDocument()
        expect(screen.queryByText('Registrar entrada')).not.toBeInTheDocument()
        expect(screen.queryByText('Registrar salida')).not.toBeInTheDocument()
    })

    it('CANCELADA: muestra mensaje de solo lectura sin botones de acción', async () => {
        vi.mocked(getVisitByIdAPI).mockResolvedValue(makeVisit('CANCELADA'))
        setup()

        expect(await screen.findByText('Esta visita ya no puede ser modificada.')).toBeInTheDocument()
        expect(screen.queryByText('Registrar entrada')).not.toBeInTheDocument()
        expect(screen.queryByText('Registrar salida')).not.toBeInTheDocument()
    })

    it('EN PLANTA sin permiso visits:checkout: muestra mensaje de espera en vez del enlace de salida', async () => {
        vi.mocked(useAuth).mockReturnValue({ permissions: ['visits:checkin'] } as any)
        vi.mocked(getVisitByIdAPI).mockResolvedValue(makeVisit('EN PLANTA'))
        setup()

        expect(await screen.findByText(/El visitante está actualmente en planta/i)).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: /registrar salida/i })).not.toBeInTheDocument()
    })

    it('muestra el badge de estado correcto para cada transición', async () => {
        const statusCases: Array<[string]> = [
            ['PROGRAMADA'],
            ['EN PLANTA'],
            ['FINALIZADA'],
            ['CANCELADA'],
        ]

        for (const [statusName] of statusCases) {
            vi.mocked(getVisitByIdAPI).mockResolvedValue(makeVisit(statusName))
            const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
            const { unmount } = render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter initialEntries={['/visits/1']}>
                        <Routes>
                            <Route path="/visits/:visitId" element={<EditVisit />} />
                        </Routes>
                    </MemoryRouter>
                </QueryClientProvider>
            )
            expect(await screen.findByText(statusName)).toBeInTheDocument()
            unmount()
        }
    })
})
