import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import AppLayout from '@/app/layouts/AppLayout';
import { Spinner } from "@/shared/components/Spinner";
import ProtectedRoute from "@/shared/components/ProtectedRoute";

const NotFound      = lazy(() => import("@/app/pages/NotFound"));
const Forbidden     = lazy(() => import("@/app/pages/Forbidden"));
const DoYouNeedHelp = lazy(() => import("@/features/needHelp/page/DoYouNeedHelp"));

const routes = [
  { path: "/role",              component: lazy(() => import("@/features/roles/pages/TableRoleView")),      permission: "roles:view" },
  { path: "/role/create",       component: lazy(() => import("@/features/roles/pages/CreateRol")),          permission: "roles:create" },
  { path: "/role/:roleId/edit", component: lazy(() => import("@/features/roles/pages/EditRole")),           permission: "roles:edit" },

  { path: "/user",              component: lazy(() => import("@/features/users/pages/TableUserView")),      permission: "users:view" },
  { path: "/user/create",       component: lazy(() => import("@/features/users/pages/CreateUser")),         permission: "users:create" },
  { path: "/user/:userId/edit", component: lazy(() => import("@/features/users/pages/EditUser")),           permission: "users:edit" },

  { path: "/agent",             component: lazy(() => import("@/features/agent/page/TableAgent")),          permission: "agents:view" },
  { path: "/agent/create",      component: lazy(() => import("@/features/agent/page/CreateAgent")),         permission: "agents:create" },
  { path: "/agent/:agentId/edit", component: lazy(() => import("@/features/agent/page/EditAgent")),         permission: "agents:edit" },

  { path: "/company",           component: lazy(() => import("@/features/company/page/TableCompany")),      permission: "companies:view" },
  { path: "/company/create",    component: lazy(() => import("@/features/company/page/CreateCompany")),     permission: "companies:create" },
  { path: "/company/:companyId/edit", component: lazy(() => import("@/features/company/page/EditCompany")), permission: "companies:edit" },

  { path: "/department",        component: lazy(() => import("@/features/department/page/DepartmentTable")),   permission: "departments:view" },
  { path: "/department/create", component: lazy(() => import("@/features/department/page/CreateDepartment")),  permission: "departments:create" },
  { path: "/department/:departmentId/edit", component: lazy(() => import("@/features/department/page/EditDepartment")), permission: "departments:edit" },

  { path: "/people",           component: lazy(() => import("@/features/visitors/page/TableVisitor")),     permission: "people:view" },
  { path: "/people/create",    component: lazy(() => import("@/features/visitors/page/CreateVisitor")),    permission: "people:create" },
  { path: "/people/:visitorId/edit", component: lazy(() => import("@/features/visitors/page/EditVisitor")), permission: "people:edit" },

  { path: "/report",            component: lazy(() => import("@/features/visitReport/page/DashboardView")), permission: "reports:view" },

  { path: "/visits",            component: lazy(() => import("@/features/visits/pages/TableVisits")),       permission: "visits:view" },
  { path: "/visits/create",     component: lazy(() => import("@/features/visits/pages/CreateVisit")),       permission: "visits:create" },
  { path: "/visits/:visitId/checkin",  component: lazy(() => import("@/features/visits/pages/CheckInView")), permission: "visits:checkin" },
  { path: "/visits/:visitId/checkout", component: lazy(() => import("@/features/visits/pages/CheckOutView")), permission: "visits:checkout" },
  { path: "/visit/:visitId/edit",      component: lazy(() => import("@/features/visits/pages/EditVisit")),    permission: "visits:view" },
];

export default function AdminRoutes() {
  return (
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/403"  element={<Suspense fallback={<Spinner />}><Forbidden /></Suspense>} />
        <Route path="/404"  element={<Suspense fallback={<Spinner />}><NotFound /></Suspense>} />
        <Route path="/help" element={<Suspense fallback={<Spinner />}><DoYouNeedHelp /></Suspense>} />
        <Route path="*"     element={<Suspense fallback={<Spinner />}><NotFound /></Suspense>} />

        {routes.map(({ path, component: Component, permission }) => (
          <Route
            key={path}
            element={<ProtectedRoute permission={permission} />}
          >
            <Route
              path={path}
              element={
                <Suspense fallback={<Spinner />}>
                  <Component />
                </Suspense>
              }
            />
          </Route>
        ))}
      </Route>
    </Route>
  );
}
