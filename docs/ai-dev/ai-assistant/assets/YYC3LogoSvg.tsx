/**
 * YYC3LogoSvg.tsx
 * ================
 * YYC³ 品牌 Logo — 使用本地 PNG 图标资源
 * 自包含版本：使用项目 public/yyc3-logo-blue/ 资源
 */

import React from "react";

const logoSrc = "/yyc3-icons/android/playstore-icon.png";

interface YYC3LogoSvgProps {
  size?: number;
  className?: string;
  showText?: boolean;
  style?: React.CSSProperties;
}

export function YYC3LogoSvg({
  size = 40,
  className = "",
  showText = true,
  style,
}: YYC3LogoSvgProps) {
  void showText; // 参数保留供外部使用，当前版本不需要显示文字
  return (
    <img
      src={logoSrc}
      alt="YYC³ Logo"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={style}
      draggable={false}
    />
  );
}

export default YYC3LogoSvg;
