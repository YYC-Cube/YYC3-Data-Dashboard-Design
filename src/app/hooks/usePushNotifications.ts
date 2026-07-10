/**
 * usePushNotifications Hook
 * =========================
 * 推送通知管理
 * - 权限请求
 * - 通知发送
 * - 订阅管理
 */

import { useState, useEffect, useCallback } from "react";

export function usePushNotifications() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const isSupported = "Notification" in window;
    setSupported(isSupported);
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!supported) return "denied" as NotificationPermission;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [supported]);

  const showNotification = useCallback(
    (title: string, options: NotificationOptions = {}) => {
      if (permission !== "granted") return null;

      try {
        return new Notification(title, {
          icon: "/yyc3-icons/pwa/icon-192x192.png",
          badge: "/yyc3-icons/pwa/icon-72x72.png",
          tag: "yyc3-notification",
          ...options,
        });
      } catch {
        // 通知创建失败（可能在不支持的环境中）
        return null;
      }
    },
    [permission]
  );

  /** 发送系统告警通知 */
  const sendAlert = useCallback(
    (
      level: "info" | "warning" | "error",
      message: string,
      detail?: string
    ) => {
      const titles = {
        info: "YYC3 信息",
        warning: "YYC3 告警",
        error: "YYC3 错误",
      };

      return showNotification(titles[level], {
        body: detail ? `${message}\n${detail}` : message,
        tag: `yyc3-alert-${level}`,
        requireInteraction: level === "error",
      });
    },
    [showNotification]
  );

  return {
    permission,
    supported,
    requestPermission,
    showNotification,
    sendAlert,
  };
}
