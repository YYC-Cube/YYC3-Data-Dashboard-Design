/**
 * YYC3Logo.tsx
 * =============
 * YYC³ 品牌 Logo 组件 — 使用官方 PNG 图标资源
 * 全端统一引用：public/yyc3-icons/android/playstore-icon.png
 */

const LOGO_SRC = "/yyc3-icons/android/playstore-icon.png";

interface YYC3LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  showGlow?: boolean;
  showPulse?: boolean;
}

export function YYC3Logo({
  size = 40,
  className = "",
  showText = false,
  showGlow = false,
  showPulse = false,
}: YYC3LogoProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <img
        src={LOGO_SRC}
        alt="YYC³ Logo"
        width={size}
        height={size}
        className="object-contain rounded-lg"
        style={{ width: size, height: size }}
        draggable={false}
      />
      {showGlow && (
        <div
          className="absolute inset-0 rounded-lg opacity-30"
          style={{
            boxShadow: `0 0 ${size * 0.5}px rgba(0,180,255,0.4)`,
          }}
        />
      )}
      {showPulse && (
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.6)] animate-pulse" />
      )}
    </div>
  );
}

export default YYC3Logo;