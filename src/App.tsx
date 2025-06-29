import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { FlowBuilderPage } from "./pages/flow-builder";
import { LayoutPrivateProvider } from "@contexts/layout-private.context";
import { LayoutMain } from "./layouts/main";
import { DashboardPage } from "./pages/dashboard";
import { DnDProvider } from "@contexts/DnD.context";
import { ReactFlowProvider } from "@xyflow/react";
import { LoginPage } from "./pages/login";
import { SignupPage } from "./pages/signup";
import { AuthProvider } from "@contexts/auth.context";
import { BusinessesPage } from "./pages/businesses";
import { FlowsPage } from "./pages/workbench/flows";
import { VariablesPage } from "./pages/workbench/variables";
import { DialogProvider } from "@contexts/dialog.context";
import { ConnectionsWAPage } from "./pages/connectionswa";
import { SocketProvider } from "@contexts/socket.context";
import { ChatbotsPage } from "./pages/chatbots";
import { ReleasesPage } from "./pages/releases";
import { TermsOfServicePage } from "./pages/terms-of-service";
import { PrivacyPolicyPage } from "./pages/privacy-terms";
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

// import { NodeMessage } from "./flow-lib/nodes/Message";
// import { NodeReply } from "./flow-lib/nodes/Reply";
// import { NodeAction } from "./flow-lib/nodes/Action";
// import { NodeAttendantAIService } from "./flow-lib/nodes/AttendantAi";
// import { NodeCheckPoint } from "./flow-lib/nodes/CheckPoint";
// import { NodeDistributeFlow } from "./flow-lib/nodes/DistributeFlow";
// import { NodeEmailSending } from "./flow-lib/nodes/EmailSending";
// import { NodeFacebookConversions } from "./flow-lib/nodes/FacebookConversions";
// import { NodeInsertLeaderInAudience } from "./flow-lib/nodes/InsertLeaderInAudience";
// import { NodeInterruption } from "./flow-lib/nodes/Interruption";
// import { NodeInterruptionLinkTrackingPixel } from "./flow-lib/nodes/InterruptionLinkTrackingPixel";
// import { NodeLinkTranckingPixel } from "./flow-lib/nodes/LinkTrackingPixel";
// import { NodeLogicalCondition } from "./flow-lib/nodes/LogicalCondition";
// import { NodeMathematicalOperators } from "./flow-lib/nodes/MathematicalOperators";
// import { NodeMenu } from "./flow-lib/nodes/Menu";
// import { NodeNewCardTrello } from "./flow-lib/nodes/NewCardTrello";
// import { NodeNotifyNumber } from "./flow-lib/nodes/NotifyNumber";
// import { NodeRemark } from "./flow-lib/nodes/Remark";
// import { NodeSendAudio } from "./flow-lib/nodes/SendAudio";
// import { NodeSendContact } from "./flow-lib/nodes/SendContact";
// import { NodeSendFile } from "./flow-lib/nodes/SendFile";
// import { NodeSendHumanService } from "./flow-lib/nodes/SendHumanService";
// import { NodeSendImage } from "./flow-lib/nodes/SendImage";
// import { NodeSendLink } from "./flow-lib/nodes/SendLink";
// import { NodeSendLocationGPS } from "./flow-lib/nodes/SendLocationGPS";
// import { NodeSendPdf } from "./flow-lib/nodes/SendPdf";
// import { NodeSendVideo } from "./flow-lib/nodes/SendVideo";
// import { NodeSwitch } from "./flow-lib/nodes/Switch";
// import { NodeTime } from "./flow-lib/nodes/Time";
// import { NodeValidation } from "./flow-lib/nodes/Validation";
// import { NodeWebform } from "./flow-lib/nodes/Webform";
// import { NodeWebhook } from "./flow-lib/nodes/Webhook";
// import { CustomEdge } from "./flow-lib/Edges/CustomEdge";
// import ToolBarFlowComponent from "./components/ToolbarFlow";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          caseSensitive
          element={
            <DialogProvider>
              <AuthProvider>
                <SocketProvider>
                  <LayoutPrivateProvider />
                </SocketProvider>
              </AuthProvider>
            </DialogProvider>
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
            <Route
              path="businesses"
              caseSensitive
              element={<BusinessesPage />}
            />
            <Route path="flows" caseSensitive element={<FlowsPage />} />
            <Route path="variables" caseSensitive element={<VariablesPage />} />
            <Route
              path="connectionswa"
              caseSensitive
              element={<ConnectionsWAPage />}
            />
            <Route path="campaigns" caseSensitive element={<CampaignsPage />} />
            <Route path="chatbots" caseSensitive element={<ChatbotsPage />} />
            <Route path="help" caseSensitive>
              <Route path="releases" caseSensitive element={<ReleasesPage />} />
            </Route>
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
            </Route>
          </Route>

          <Route
            path="flows/:id"
            caseSensitive
            element={
              <ReactFlowProvider>
                <DnDProvider>
                  <FlowBuilderPage />
                </DnDProvider>
              </ReactFlowProvider>
            }
          />
          <Route
            path="*"
            caseSensitive
            element={<Navigate to="/auth/dashboard" />}
          />
        </Route>

        {/* <Route
                  path="subscribe-plan"
                  caseSensitive
                  element={<SubscribePlanPage />}
                />
                <Route
                  path="subscribe-extra-package/:id"
                  caseSensitive
                  element={<SubscribeExtraPackagesPage />}
                /> */}

        {/* <Route element={<LogoutLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage2 />} />
              </Route> */}
        {/* <Route
                path="/recover-password/:tk"
                element={<RecoverPasswordPage />}
              /> */}

        {/* <Route path="/checkout/:pl" element={<CheckoutPage />} /> */}

        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/privacy-terms" element={<PrivacyPolicyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="*"
          caseSensitive
          element={<Navigate to="/auth/dashboard" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
