/**
 * Login 组件
 * ==========
 * YYC³ 登录页面
 * 未来科技感设计，赛博朋克风格
 * 支持 Email + Password 认证
 *
 * 预设账号（Mock 模式）：
 *   admin@yyc-matrix.local / admin123
 *   dev@yyc-matrix.local   / dev123
 */

import { AlertCircle, Eye, EyeOff, Lock, Mail, Zap } from "lucide-react";
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { YYC3Logo } from "./YYC3Logo";

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data) {
        onLoginSuccess();
      }
    } catch (err) {
      setError("登录失败，请检查网络连接");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #060e1f 0%, #0a1628 30%, #081430 60%, #040c1a 100%)" }}>

      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }} />
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.08]"
          style={{ background: "radial-gradient(circle, #00d4ff, transparent 70%)" }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #7b2ff7, transparent 70%)" }} />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[420px] mx-4">
        <div className="rounded-2xl bg-[rgba(8,25,55,0.7)] backdrop-blur-2xl border border-[rgba(0,180,255,0.15)] shadow-[0_0_60px_rgba(0,180,255,0.08)] p-8 md:p-10">

          {/* Logo & Title */}
          <div className="text-center mb-8">
            <YYC3Logo size={64} showGlow className="mb-4" />
            <h1 className="text-[#00d4ff] tracking-[0.3em] mb-1" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.4rem" }}>
              YYC³
            </h1>
            <p className="text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.75rem", letterSpacing: "0.15em" }}>
              本地多端推理矩阵数据库 · 数据看盘
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[rgba(0,212,255,0.5)] mb-1.5" style={{ fontSize: "0.72rem" }}>
                登录邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(0,212,255,0.3)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yyc-matrix.local"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[rgba(0,40,80,0.4)] border border-[rgba(0,180,255,0.15)] text-[#e0f0ff] placeholder-[rgba(0,212,255,0.25)] focus:outline-none focus:border-[rgba(0,212,255,0.5)] focus:shadow-[0_0_15px_rgba(0,180,255,0.1)] transition-all"
                  style={{ fontSize: "0.85rem" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[rgba(0,212,255,0.5)] mb-1.5" style={{ fontSize: "0.72rem" }}>
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(0,212,255,0.3)]" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入密码"
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-[rgba(0,40,80,0.4)] border border-[rgba(0,180,255,0.15)] text-[#e0f0ff] placeholder-[rgba(0,212,255,0.25)] focus:outline-none focus:border-[rgba(0,212,255,0.5)] focus:shadow-[0_0_15px_rgba(0,180,255,0.1)] transition-all"
                  style={{ fontSize: "0.85rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[rgba(0,212,255,0.1)] transition-all"
                >
                  {showPwd
                    ? <EyeOff className="w-4 h-4 text-[rgba(0,212,255,0.4)]" />
                    : <Eye className="w-4 h-4 text-[rgba(0,212,255,0.4)]" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(255,51,102,0.08)] border border-[rgba(255,51,102,0.2)]">
                <AlertCircle className="w-4 h-4 text-[#ff3366] shrink-0" />
                <span className="text-[#ff3366]" style={{ fontSize: "0.75rem" }}>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white transition-all hover:shadow-[0_0_25px_rgba(0,180,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden min-h-[48px]"
              style={{ fontSize: "0.9rem", letterSpacing: "0.1em" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  验证中...
                </span>
              ) : (
                "登 录"
              )}
            </button>
          </form>

          {/* Footer hints */}
          <div className="mt-6 pt-4 border-t border-[rgba(0,180,255,0.08)]">
            <div className="flex items-center gap-2 text-[rgba(0,212,255,0.3)]" style={{ fontSize: "0.65rem" }}>
              <Zap className="w-3 h-3" />
              <span>本地闭环系统 · YYC³ Family 内部专用</span>
            </div>
            <div className="mt-2 px-3 py-2 rounded-lg bg-[rgba(0,40,80,0.15)] border border-[rgba(0,180,255,0.06)]">
              <p className="text-[rgba(0,212,255,0.3)]" style={{ fontSize: "0.62rem" }}>
                Demo 账号: admin@yyc-matrix.local / admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
