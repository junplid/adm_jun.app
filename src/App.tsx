import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { FlowBuilderPage } from "./pages/flow-builder";
import { LayoutPrivateProvider } from "@contexts/layout-private.provider";
import { LayoutMain } from "./layouts/main";
import { DashboardPage } from "./pages/dashboard";
import { ReactFlowProvider } from "@xyflow/react";
import { LoginPage } from "./pages/login";
import { SignupPage } from "./pages/signup";
import { AuthProvider } from "@contexts/auth.provider";
import { FlowsPage } from "./pages/workbench/flows";
import { VariablesPage } from "./pages/workbench/variables";
import { DialogProvider } from "@contexts/dialog.provider";
import { ConnectionsWAPage } from "./pages/connections";
import { SocketProvider } from "@contexts/socket.provider";
import { ChatbotsPage } from "./pages/chatbots";
import { TermsOfUsePage } from "./pages/terms-of-use";
import { PrivacyPolicyPage } from "./pages/privacy-policy";
import { CampaignsPage } from "./pages/campaigns";
import { StoragePage } from "./pages/workbench/storage";
import { AgentsAIPage } from "./pages/workbench/agents-ai";
import { LayoutInboxesPageProvider } from "./pages/inboxes/page.context";
import { InboxUsersPage } from "./pages/inboxes/users";
import { InboxDepartmentsPage } from "./pages/inboxes/departments";
import { FbPixelsPage } from "./pages/workbench/fbPixels";
import { LayoutWorkbenchPageProvider } from "./pages/workbench/page.context";
import { TagsPage } from "./pages/workbench/tags";
import { LayoutIntegrationsPageProvider } from "./pages/integrations/page.context";
import { PaymentsPage } from "./pages/integrations/payments";
import { TrelloPage } from "./pages/integrations/trello";
import { LayoutSitesPageProvider } from "./pages/menus-online/page.context";
import { MenuOnlinePage } from "./pages/menus-online/menu";
import { AppointmentsPage } from "./pages/appointments";
import { OrdersPage } from "./pages/orders";
import { LayoutSettingsPageProvider } from "./pages/settings/page.context";
import { SettingsAccountPage } from "./pages/settings/account";
import FarewellPage from "./pages/farewell";
import DataDeletionPage from "./pages/data-deletion";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          caseSensitive
          element={
            <AuthProvider>
              <DialogProvider>
                <SocketProvider>
                  <LayoutPrivateProvider />
                </SocketProvider>
              </DialogProvider>
            </AuthProvider>
          }
          path="auth"
        >
          <Route path="" caseSensitive element={<LayoutMain />}>
            <Route
              path=""
              caseSensitive
              element={<Navigate to="dashboard" />}
            />
            <Route path="dashboard" caseSensitive element={<DashboardPage />} />
            {/*<Route path="projects" caseSensitive element={<BusinessesPage />} /*/}
            <Route path="flows" caseSensitive element={<FlowsPage />} />
            <Route path="variables" caseSensitive element={<VariablesPage />} />
            <Route
              path="connections"
              caseSensitive
              element={<ConnectionsWAPage />}
            />
            <Route path="campaigns" caseSensitive element={<CampaignsPage />} />
            <Route path="chatbots" caseSensitive element={<ChatbotsPage />} />
            <Route path="agents-ai" caseSensitive element={<AgentsAIPage />} />
            {/* <Route path="help" caseSensitive>
            </Route> */}
            <Route caseSensitive element={<LayoutInboxesPageProvider />}>
              <Route
                path="inboxes/attendants"
                caseSensitive
                element={<InboxUsersPage />}
              />
              <Route
                path="inboxes/departments"
                caseSensitive
                element={<InboxDepartmentsPage />}
              />
            </Route>
            <Route caseSensitive element={<LayoutSettingsPageProvider />}>
              <Route
                path="settings/account"
                caseSensitive
                element={<SettingsAccountPage />}
              />
            </Route>
            <Route caseSensitive element={<LayoutWorkbenchPageProvider />}>
              <Route
                path="workbench/storage"
                caseSensitive
                element={<StoragePage />}
              />
              <Route
                path="workbench/variables"
                caseSensitive
                element={<VariablesPage />}
              />
              <Route
                path="workbench/tags"
                caseSensitive
                element={<TagsPage />}
              />
              <Route
                path="workbench/agents-ai"
                caseSensitive
                element={<AgentsAIPage />}
              />
              <Route
                path="workbench/fb-pixels"
                caseSensitive
                element={<FbPixelsPage />}
              />
              <Route
                path="workbench/flows"
                caseSensitive
                element={<FlowsPage />}
              />
            </Route>
            <Route caseSensitive element={<LayoutIntegrationsPageProvider />}>
              <Route
                path="integrations/payments"
                caseSensitive
                element={<PaymentsPage />}
              />
              <Route
                path="integrations/trello"
                caseSensitive
                element={<TrelloPage />}
              />
            </Route>
            <Route path="orders" caseSensitive element={<OrdersPage />} />

            <Route
              path="appointments"
              caseSensitive
              element={<AppointmentsPage />}
            />

            <Route
              caseSensitive
              path="menus-online"
              element={<LayoutSitesPageProvider />}
            >
              <Route path=":uuid" caseSensitive element={<MenuOnlinePage />} />
            </Route>
          </Route>

          <Route
            path="flows/:id"
            caseSensitive
            element={
              <ReactFlowProvider>
                <FlowBuilderPage />
              </ReactFlowProvider>
            }
          />
          <Route
            path="*"
            caseSensitive
            element={<Navigate to="/auth/dashboard" />}
          />
        </Route>

        <Route path="/terms-of-use" element={<TermsOfUsePage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/farewell" element={<FarewellPage />} />
        <Route path="/data-deletion" element={<DataDeletionPage />} />

        <Route
          path="*"
          caseSensitive
          element={<Navigate to="/auth/dashboard" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
