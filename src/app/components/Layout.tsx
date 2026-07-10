import React, { useState, useContext } from "react";
import { Outlet } from "react-router";
import { Toaster } from "sonner";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { AIAssistant } from "./ai-assistant";
import { PWAInstallPrompt } from "./PWAInstallPrompt";
import { OfflineIndicator } from "./OfflineIndicator";
import { useWebSocketData } from "../hooks/useWebSocketData";
import { useMobileView } from "../hooks/useMobileView";
import { AuthContext } from "../App";

/**
 * WebSocket 上下文
 * 通过 React Context 将 WebSocket 数据传递到所有子页面
 */
export const WebSocketContext = React.createContext<ReturnType<typeof useWebSocketData> | null>(null);
export const ViewContext = React.createContext<ReturnType<typeof useMobileView> | null>(null);

export function Layout() {
  const wsData = useWebSocketData();
  const view = useMobileView();
  const auth = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <WebSocketContext.Provider value={wsData}>
      <ViewContext.Provider value={view}>
        <div className="h-screen w-screen flex flex-col overflow-hidden" style={{
          background: "linear-gradient(135deg, #060e1f 0%, #0a1628 30%, #081430 60%, #040c1a 100%)",
        }}>
          {/* Animated background elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `
                linear-gradient(rgba(0,212,255,1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)
              `,
              backgroundSize: view.isMobile ? "40px 40px" : "60px 60px",
            }} />
            {/* Gradient orbs */}
            <div className="absolute top-[-20%] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full opacity-[0.06]"
              style={{ background: "radial-gradient(circle, #00d4ff, transparent 70%)" }} />
            <div className="absolute bottom-[-20%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full opacity-[0.04]"
              style={{ background: "radial-gradient(circle, #7b2ff7, transparent 70%)" }} />
            <div className="absolute top-[40%] left-[50%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full opacity-[0.03]"
              style={{ background: "radial-gradient(circle, #00ff88, transparent 70%)" }} />
            {/* Scan line */}
            <div className="absolute w-full h-[2px] opacity-[0.03] animate-[scanline_8s_linear_infinite]"
              style={{ background: "linear-gradient(90deg, transparent, #00d4ff, transparent)" }} />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <TopBar
              connectionState={wsData.connectionState}
              reconnectCount={wsData.reconnectCount}
              lastSyncTime={wsData.lastSyncTime}
              onReconnect={wsData.manualReconnect}
              isMobile={view.isMobile}
              isTablet={view.isTablet}
              mobileMenuOpen={mobileMenuOpen}
              onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
              onLogout={auth.logout}
              userEmail={auth.userEmail}
              userRole={auth.userRole}
            />
            <div className={`flex-1 overflow-auto ${view.isMobile ? "p-2 pb-20" : view.isTablet ? "p-3 pb-20" : "p-4"}`}>
              <Outlet />
            </div>
            {/* Bottom Nav - mobile & tablet only */}
            {(view.isMobile || view.isTablet) && <BottomNav />}
          </div>

          {/* AI 智能助理浮窗 */}
          <AIAssistant isMobile={view.isMobile} />

          {/* PWA 安装提示 */}
          <PWAInstallPrompt />

          {/* 离线状态指示器 */}
          <OfflineIndicator />

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "rgba(8, 25, 55, 0.95)",
                border: "1px solid rgba(0, 180, 255, 0.2)",
                color: "#e0f0ff",
                backdropFilter: "blur(10px)",
              },
            }}
          />

          <style>{`
            @keyframes scanline {
              0% { top: 0%; }
              100% { top: 100%; }
            }
          `}</style>
        </div>
      </ViewContext.Provider>
    </WebSocketContext.Provider>
  );
}