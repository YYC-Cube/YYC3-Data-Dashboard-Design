import React, { createContext, useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "../styles/index.css";
import { Login } from "./components/Login";
import { supabase } from "./lib/supabaseClient";
import { router } from "./routes";

/** 认证上下文 - 提供登出功能和当前用户信息 */
export const AuthContext = createContext<{
  logout: () => void;
  userEmail: string;
  userRole: string;
}>({
  logout: () => { },
  userEmail: "",
  userRole: "",
});

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // 检查现有会话
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(!!data.session);
      if (data.session) {
        setUserEmail((data.session as any).user?.email ?? "admin@yyc-matrix.local");
        setUserRole((data.session as any).user?.role ?? "admin");
      }
    });
  }, []);

  const handleLoginSuccess = useCallback(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail((data.session as any)?.user?.email ?? "admin@yyc-matrix.local");
      setUserRole((data.session as any)?.user?.role ?? "admin");
    });
    setAuthenticated(true);
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthenticated(false);
    setUserEmail("");
    setUserRole("");
  }, []);

  // 初始化检查中 - 显示加载
  if (authenticated === null) {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #060e1f 0%, #0a1628 30%, #081430 60%, #040c1a 100%)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[rgba(0,212,255,0.2)] border-t-[#00d4ff] rounded-full animate-spin" />
          <span className="text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.75rem" }}>
            正在初始化...
          </span>
        </div>
      </div>
    );
  }

  // 未登录 - 显示登录页
  if (!authenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // 已登录 - 显示主应用
  return (
    <AuthContext.Provider value={{ logout: handleLogout, userEmail, userRole }}>
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
