import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { FlowBuilderPage } from "./pages/flow-builder";
import { LayoutPrivateProvider } from "@contexts/layout-private.context";
import { LayoutMain } from "./layouts/main";
import { DashboardPage } from "./pages/dashboard";
import { DnDProvider } from "@contexts/DnD.context";
import { ReactFlowProvider } from "@xyflow/react";

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
        <Route caseSensitive element={<LayoutPrivateProvider />} path="auth">
          <Route path="" caseSensitive element={<LayoutMain />}>
            <Route
              path=""
              caseSensitive
              element={<Navigate to="dashboard" />}
            />
            <Route path="dashboard" caseSensitive element={<DashboardPage />} />
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

        <Route
          path="*"
          caseSensitive
          element={<Navigate to="/auth/dashboard" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
