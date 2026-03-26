import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,ResponsiveContainer,} from "recharts"
import {Users, UserCheck, Building2, Clock, CheckCircle, XCircle, CalendarDays, FileDown,} from "lucide-react"
import { getDashboardSummaryAPI, getInPlantAtAPI, getVisitsByCompanyAPI } from "@/features/visitReport/api/ReportsAPI"
import { ExcelReportAPI } from "@/features/visitReport/api/ExcelReportAPI"

const TODAY = new Date().toISOString().split("T")[0]

// ── KPI Card ──────────────────────────────────────────────────────────────────
type KpiCardProps = {
    label:     string
    value:     number
    icon:      React.ReactNode
    colorClass: string
}

function KpiCard({ label, value, icon, colorClass }: KpiCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
                <p className="text-xs text-slate-500 font-medium leading-tight">{label}</p>
            </div>
        </div>
    )
}

// ── Section Header 
function SectionHeader({ title }: { title: string }) {
    return (
        <div className="table-header rounded-xl mb-4 px-5 py-3">
            <h2 className="table-title text-base">{title}</h2>
        </div>
    )
}

// ── Dashboard 
export default function DashboardView() {
    const [summaryDate,    setSummaryDate]    = useState(TODAY)
    const [inPlantDate,    setInPlantDate]    = useState(TODAY)
    const [inPlantFrom,    setInPlantFrom]    = useState("08:00")
    const [inPlantTo,      setInPlantTo]      = useState("17:00")
    const [companyFrom,    setCompanyFrom]    = useState(TODAY.slice(0, 7) + "-01")
    const [companyTo,      setCompanyTo]      = useState(TODAY)
    const [inPlantSearch,  setInPlantSearch]  = useState("")
    const [downloadingExcel, setDownloadingExcel] = useState(false)

    async function handleDownloadExcel() {
        setDownloadingExcel(true)
        try {
            const blob = await ExcelReportAPI({ from: companyFrom, to: companyTo })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `reporte_${companyFrom}_${companyTo}.xlsx`
            a.click()
            URL.revokeObjectURL(url)
        } finally {
            setDownloadingExcel(false)
        }
    }

    const { data: summary, isLoading: loadingSummary } = useQuery({
        queryKey: ["dashboard-summary", summaryDate],
        queryFn:  () => getDashboardSummaryAPI(summaryDate),
    })

    const { data: inPlantData, isLoading: loadingInPlant } = useQuery({
        queryKey: ["in-plant-at", inPlantDate, inPlantFrom, inPlantTo],
        queryFn:  () => getInPlantAtAPI({ date: inPlantDate, from: inPlantFrom, to: inPlantTo }),
    })

    const { data: companyData, isLoading: loadingCompany } = useQuery({
        queryKey: ["visits-by-company", companyFrom, companyTo],
        queryFn:  () => getVisitsByCompanyAPI({ from: companyFrom, to: companyTo }),
    })

    const filteredVisits = (inPlantData?.visits ?? []).filter((visit) => {
        const term = inPlantSearch.toLowerCase()
        return (
            visit.main_visitor.name?.toLowerCase().includes(term) ||
            visit.company?.toLowerCase().includes(term) ||
            visit.department?.toLowerCase().includes(term)
        )
    })

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 space-y-8">

            {/* ── Page title ─────────────────────────────────────────── */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                    <CalendarDays size={20} className="text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                    <p className="text-sm text-slate-500">Control de acceso a planta</p>
                </div>
            </div>

            {/* ── KPI Section ────────────────────────────────────────── */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <SectionHeader title="Resumen del día" />
                    <input
                        type="date"
                        value={summaryDate}
                        onChange={(e) => setSummaryDate(e.target.value)}
                        className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                </div>

                {loadingSummary ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 7 }).map((_, index) => (
                            <div key={index} className="bg-white rounded-2xl border border-slate-200 h-24 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KpiCard label="Visitas programadas"  value={summary?.total_visits_today     ?? 0} icon={<CalendarDays size={22} className="text-white" />} colorClass="bg-gradient-to-br from-amber-400 to-amber-500" />
                        <KpiCard label="Ingresos confirmados por garita" value={summary?.total_check_ins_today  ?? 0} icon={<UserCheck    size={22} className="text-white" />} colorClass="bg-gradient-to-br from-blue-500 to-blue-700"  />
                        <KpiCard label="Visitantes que se encuentran en planta"      value={summary?.currently_in_plant     ?? 0} icon={<Users        size={22} className="text-white" />} colorClass="bg-gradient-to-br from-emerald-400 to-emerald-600" />
                        <KpiCard label="Acompañantes hoy"     value={summary?.total_companions_today ?? 0} icon={<Users        size={22} className="text-white" />} colorClass="bg-gradient-to-br from-violet-400 to-violet-600" />
                        <KpiCard label="Pendientes de confirmación de ingreso a planta"           value={summary?.pending_today          ?? 0} icon={<Clock        size={22} className="text-white" />} colorClass="bg-gradient-to-br from-orange-400 to-orange-500" />
                        <KpiCard label="Visitas Finalizadas"          value={summary?.completed_today        ?? 0} icon={<CheckCircle  size={22} className="text-white" />} colorClass="bg-gradient-to-br from-teal-400 to-teal-600"    />
                        <KpiCard label="Canceladas"           value={summary?.cancelled_today        ?? 0} icon={<XCircle      size={22} className="text-white" />} colorClass="bg-gradient-to-br from-red-400 to-red-600"      />
                    </div>
                )}
            </section>

            {/* ── Charts + In-plant grid ──────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Visits by company bar chart */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-md p-5">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <SectionHeader title="Visitas por empresa" />
                        <div className="flex gap-2 flex-wrap">
                            <input
                                type="date"
                                value={companyFrom}
                                onChange={(e) => setCompanyFrom(e.target.value)}
                                className="border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                            <span className="text-slate-400 self-center text-xs">—</span>
                            <input
                                type="date"
                                value={companyTo}
                                onChange={(e) => setCompanyTo(e.target.value)}
                                className="border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                            <button
                                onClick={handleDownloadExcel}
                                disabled={downloadingExcel}
                                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <FileDown size={14} />
                                {downloadingExcel ? "Descargando..." : "Excel"}
                            </button>
                        </div>
                    </div>

                    {loadingCompany ? (
                        <div className="h-64 animate-pulse bg-slate-100 rounded-xl" />
                    ) : (companyData?.companies?.length ?? 0) === 0 ? (
                        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                            Sin datos para el rango seleccionado
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={companyData?.companies} margin={{ top: 4, right: 8, left: -10, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="company_name"
                                    tick={{ fontSize: 11, fill: "#64748b" }}
                                    angle={-35}
                                    textAnchor="end"
                                    interval={0}
                                />
                                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: "0.75rem", border: "1px solid #e2e8f0", fontSize: "0.8rem" }}
                                    formatter={(value) => [value, "Visitas"]}
                                />
                                <Bar dataKey="total_visits" radius={[6, 6, 0, 0]} fill="#f59e0b" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}

                    {(companyData?.companies?.length ?? 0) > 0 && (
                        <div className="mt-3 flex justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                            <span>{companyData?.total_companies} empresas</span>
                            <span>{companyData?.total_visits} visitas totales</span>
                        </div>
                    )}
                </section>

                {/* In-plant at time range */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-md p-5">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <SectionHeader title="Personas en planta" />
                        <div className="flex gap-2 flex-wrap items-center">
                            <input
                                type="date"
                                value={inPlantDate}
                                onChange={(e) => setInPlantDate(e.target.value)}
                                className="border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                            <input
                                type="time"
                                value={inPlantFrom}
                                onChange={(e) => setInPlantFrom(e.target.value)}
                                className="border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                            <span className="text-slate-400 text-xs">—</span>
                            <input
                                type="time"
                                value={inPlantTo}
                                onChange={(e) => setInPlantTo(e.target.value)}
                                className="border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                        </div>
                    </div>

                    <input
                        type="text"
                        placeholder="Buscar por nombre, empresa o departamento..."
                        value={inPlantSearch}
                        onChange={(e) => setInPlantSearch(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-700 mb-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />

                    {loadingInPlant ? (
                        <div className="space-y-2">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="h-14 animate-pulse bg-slate-100 rounded-xl" />
                            ))}
                        </div>
                    ) : filteredVisits.length === 0 ? (
                        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                            Sin registros en ese rango de hora
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {filteredVisits.map((visit) => (
                                <div
                                    key={visit.visit_id}
                                    className="border border-slate-200 rounded-xl p-3 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {visit.main_visitor.name ?? `Visita #${visit.visit_id}`}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {visit.company} · {visit.department}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs text-slate-500">
                                                {visit.entry_time} — {visit.exit_time ?? "en planta"}
                                            </p>
                                            <span className={`badge text-xs ${visit.exit_time ? "badge-info" : "badge-success"}`}>
                                                {visit.exit_time ? "Finalizada" : "En planta"}
                                            </span>
                                        </div>
                                    </div>
                                    {visit.companions.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {visit.companions.map((companion, index) => (
                                                <span key={index} className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full px-2 py-0.5 text-xs">
                                                    <Users size={10} />
                                                    {companion.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {(inPlantData?.total_visits ?? 0) > 0 && (
                        <div className="mt-3 flex justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                            <span>{inPlantData?.total_visits} visitas</span>
                            <span>{inPlantData?.total_people} personas en total</span>
                        </div>
                    )}
                </section>
            </div>

            {/* ── Company detail table ────────────────────────────────── */}
            {(companyData?.companies?.length ?? 0) > 0 && (
                <section>
                    <SectionHeader title="Detalle por empresa" />
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Empresa</th>
                                    <th className="table-cell-center">Total visitas</th>
                                    <th className="table-cell-center">Total personas</th>
                                    <th className="table-cell-center">Última visita</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companyData?.companies.map((company: import("../schema/types").CompanyVisitSummary, index: number) => (
                                    <tr key={company.company_id}>
                                        <td className="text-slate-400 text-xs">{index + 1}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                                    <Building2 size={14} className="text-white" />
                                                </div>
                                                <span className="font-medium text-slate-800">{company.company_name}</span>
                                            </div>
                                        </td>
                                        <td className="table-cell-center">
                                            <span className="badge badge-warning">{company.total_visits}</span>
                                        </td>
                                        <td className="table-cell-center text-slate-600">{company.total_people}</td>
                                        <td className="table-cell-center text-slate-500 text-xs">{company.last_visit?.slice(0, 10)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    )
}