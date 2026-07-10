import { Bell, ChevronDown, LogOut, Menu, Search, Settings, Shield, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import type { ConnectionState } from "../hooks/useWebSocketData";
import { ConnectionStatus } from "./ConnectionStatus";
import { YYC3Logo } from "./YYC3Logo";

export const navItems = [
  { label: "数据监控", path: "/" },
  { label: "操作审计", path: "/audit" },
  { label: "用户管理", path: "/users" },
  { label: "系统设置", path: "/settings" },
];

interface TopBarProps {
  connectionState: ConnectionState;
  reconnectCount: number;
  lastSyncTime: string;
  onReconnect: () => void;
  isMobile: boolean;
  isTablet: boolean;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onLogout: () => void;
  userEmail: string;
  userRole: string;
}

export function TopBar({
  connectionState,
  reconnectCount,
  lastSyncTime,
  onReconnect,
  isMobile,
  isTablet,
  mobileMenuOpen,
  onToggleMobileMenu,
  onLogout,
  userEmail,
  userRole,
}: TopBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = userEmail ? userEmail.split("@")[0] : "Admin";
  const roleLabel = userRole === "admin" ? "超级管理员" : userRole === "developer" ? "开发者" : "用户";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="w-full shrink-0">
      {/* Top Function Bar */}
      <div className={`flex items-center justify-between bg-[rgba(6,14,31,0.9)] backdrop-blur-xl border-b border-[rgba(0,180,255,0.1)] ${isMobile ? "px-3 py-2" : "px-6 py-3"}`}>

        {/* Left: Hamburger (mobile) + Logo */}
        <div className="flex items-center gap-2">
          {/* Hamburger menu - mobile & tablet */}
          {(isMobile || isTablet) && (
            <button
              onClick={onToggleMobileMenu}
              className="p-2 rounded-lg bg-[rgba(0,40,80,0.3)] border border-[rgba(0,180,255,0.15)] hover:border-[rgba(0,212,255,0.4)] transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {mobileMenuOpen
                ? <X className="w-5 h-5 text-[#00d4ff]" />
                : <Menu className="w-5 h-5 text-[rgba(0,212,255,0.7)]" />}
            </button>
          )}

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <YYC3Logo size={isMobile ? 36 : 40} showGlow showPulse />
            <div className={isMobile ? "hidden" : "block"}>
              <span className="text-[#00d4ff] tracking-[0.2em]" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.1rem" }}>
                YYC
              </span>
              <span className="text-[rgba(0,212,255,0.5)] ml-2 tracking-wider hidden lg:inline" style={{ fontSize: "0.7rem" }}>
                MATRIX v3.2
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search - hidden on mobile */}
        {!isMobile && (
          <div className={`relative flex items-center transition-all duration-300 ${searchFocused ? "w-80 lg:w-96" : "w-52 lg:w-72"}`}>
            <Search className="absolute left-3 w-4 h-4 text-[rgba(0,212,255,0.5)]" />
            <input
              type="text"
              placeholder="搜索节点、模型、日志..."
              className={`
                w-full pl-10 pr-4 py-2 rounded-lg
                bg-[rgba(0,40,80,0.5)] backdrop-blur-sm
                border transition-all duration-300
                text-[#e0f0ff] placeholder-[rgba(0,212,255,0.3)]
                ${searchFocused
                  ? "border-[rgba(0,212,255,0.5)] shadow-[0_0_20px_rgba(0,180,255,0.15)]"
                  : "border-[rgba(0,180,255,0.15)]"
                }
                focus:outline-none
              `}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <kbd className="absolute right-3 px-1.5 py-0.5 rounded bg-[rgba(0,180,255,0.1)] border border-[rgba(0,180,255,0.2)] text-[rgba(0,212,255,0.4)] hidden lg:block" style={{ fontSize: "0.65rem" }}>
              ⌘K
            </kbd>
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Connection Status */}
          <ConnectionStatus
            state={connectionState}
            reconnectCount={reconnectCount}
            lastSyncTime={lastSyncTime}
            onReconnect={onReconnect}
            compact={isMobile || isTablet}
          />

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
              className="relative p-2 rounded-lg bg-[rgba(0,40,80,0.3)] border border-[rgba(0,180,255,0.15)] hover:border-[rgba(0,212,255,0.4)] transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <Bell className="w-5 h-5 text-[rgba(0,212,255,0.7)]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff3366] flex items-center justify-center shadow-[0_0_8px_rgba(255,51,102,0.5)]" style={{ fontSize: "0.6rem", color: "white" }}>
                3
              </span>
            </button>
            {notifOpen && (
              <div className={`absolute top-12 rounded-xl bg-[rgba(8,25,55,0.95)] backdrop-blur-xl border border-[rgba(0,180,255,0.2)] shadow-[0_10px_50px_rgba(0,0,0,0.5)] z-50 p-4 ${isMobile ? "right-[-60px] w-[calc(100vw-24px)]" : "right-0 w-80"}`}>
                <h4 className="text-[#00d4ff] mb-3" style={{ fontSize: "0.85rem" }}>通知中心</h4>
                {[
                  { msg: "节点 GPU-A100-03 推理延迟异常", time: "2分钟前", type: "warn" },
                  { msg: "模型 LLaMA-70B 部署完成", time: "15分钟前", type: "success" },
                  { msg: "存储集群 C2 容量预警 (85%)", time: "1小时前", type: "error" },
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[rgba(0,180,255,0.05)] cursor-pointer mb-1 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === "warn" ? "bg-[#ffdd00]" : n.type === "success" ? "bg-[#00ff88]" : "bg-[#ff3366]"
                      }`} />
                    <div>
                      <p className="text-[#c0dcf0]" style={{ fontSize: "0.8rem" }}>{n.msg}</p>
                      <p className="text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.7rem" }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Avatar + Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
              className={`flex items-center gap-2 rounded-lg bg-[rgba(0,40,80,0.3)] border transition-all min-h-[44px] ${userMenuOpen
                  ? "border-[rgba(0,212,255,0.5)] shadow-[0_0_15px_rgba(0,180,255,0.15)]"
                  : "border-[rgba(0,180,255,0.15)] hover:border-[rgba(0,212,255,0.4)]"
                } ${isMobile ? "p-1.5" : "p-1.5 pr-3"}`}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#7b2ff7] flex items-center justify-center">
                <span className="text-white" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.7rem" }}>{initials}</span>
              </div>
              {!isMobile && (
                <>
                  <span className="text-[#c0dcf0]" style={{ fontSize: "0.85rem" }}>{displayName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[rgba(0,212,255,0.5)] transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                </>
              )}
            </button>

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <div className={`absolute top-12 rounded-xl bg-[rgba(8,25,55,0.95)] backdrop-blur-xl border border-[rgba(0,180,255,0.2)] shadow-[0_10px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden ${isMobile ? "right-0 w-56" : "right-0 w-64"}`}>
                {/* User info header */}
                <div className="px-4 py-3 border-b border-[rgba(0,180,255,0.1)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#7b2ff7] flex items-center justify-center">
                      <span className="text-white" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.8rem" }}>{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#e0f0ff] truncate" style={{ fontSize: "0.85rem" }}>{displayName}</p>
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3 h-3 text-[rgba(0,212,255,0.4)]" />
                        <span className="text-[rgba(0,212,255,0.5)]" style={{ fontSize: "0.68rem" }}>{roleLabel}</span>
                      </div>
                    </div>
                  </div>
                  {userEmail && (
                    <p className="text-[rgba(0,212,255,0.35)] mt-1.5 truncate" style={{ fontSize: "0.65rem" }}>{userEmail}</p>
                  )}
                </div>

                {/* Menu Items */}
                <div className="py-1.5">
                  <button
                    onClick={() => { navigate("/users"); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[rgba(0,212,255,0.7)] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.05)] transition-all"
                    style={{ fontSize: "0.8rem" }}
                  >
                    <User className="w-4 h-4" />
                    个人信息
                  </button>
                  <button
                    onClick={() => { navigate("/settings"); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[rgba(0,212,255,0.7)] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.05)] transition-all"
                    style={{ fontSize: "0.8rem" }}
                  >
                    <Settings className="w-4 h-4" />
                    系统设置
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-[rgba(0,180,255,0.1)] py-1.5">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[#ff3366] hover:bg-[rgba(255,51,102,0.08)] transition-all"
                    style={{ fontSize: "0.8rem" }}
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Navigation Bar - hidden on mobile/tablet (use bottom nav or slide menu) */}
      {!isMobile && !isTablet && (
        <div className="flex items-center gap-1 px-6 py-2 bg-[rgba(6,14,31,0.7)] backdrop-blur-lg border-b border-[rgba(0,180,255,0.08)]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  relative px-5 py-2 rounded-lg transition-all duration-300
                  ${isActive
                    ? "bg-[rgba(0,212,255,0.12)] text-[#00d4ff] shadow-[0_0_15px_rgba(0,180,255,0.1)]"
                    : "text-[rgba(0,212,255,0.5)] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.05)]"
                  }
                `}
                style={{ fontSize: "0.9rem", letterSpacing: "0.05em" }}
              >
                {item.label}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#00d4ff] shadow-[0_0_10px_rgba(0,212,255,0.5)]" />
                )}
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-[rgba(0,212,255,0.3)]" style={{ fontSize: "0.75rem" }}>
              同步: {lastSyncTime}
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ${connectionState === "connected" || connectionState === "simulated" ? "bg-[#00ff88] animate-pulse" : "bg-[#ff3366]"}`} />
          </div>
        </div>
      )}

      {/* Mobile/Tablet slide-down menu */}
      {(isMobile || isTablet) && mobileMenuOpen && (
        <div className="absolute left-0 right-0 top-full z-50 bg-[rgba(6,14,31,0.95)] backdrop-blur-2xl border-b border-[rgba(0,180,255,0.15)] shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
          {/* Mobile search */}
          {isMobile && (
            <div className="px-4 pt-3">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-[rgba(0,212,255,0.5)]" />
                <input
                  type="text"
                  placeholder="搜索节点、模型、日志..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[rgba(0,40,80,0.5)] border border-[rgba(0,180,255,0.15)] text-[#e0f0ff] placeholder-[rgba(0,212,255,0.3)] focus:outline-none focus:border-[rgba(0,212,255,0.4)]"
                />
              </div>
            </div>
          )}
          {/* Nav items */}
          <div className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    onToggleMobileMenu();
                  }}
                  className={`
                    w-full text-left px-4 py-3 rounded-xl transition-all min-h-[44px]
                    ${isActive
                      ? "bg-[rgba(0,212,255,0.12)] text-[#00d4ff] border border-[rgba(0,212,255,0.25)]"
                      : "text-[rgba(0,212,255,0.6)] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.05)] border border-transparent"
                    }
                  `}
                  style={{ fontSize: "0.95rem", letterSpacing: "0.05em" }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
