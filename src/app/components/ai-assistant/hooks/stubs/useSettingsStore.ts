"use client"

/**
 * @file hooks/stubs/useSettingsStore.ts
 * @description useSettingsStore stub — 独立运行时的模拟实现
 * @author YanYuCloudCube Team
 * @version v1.0.0
 *
 * 外部项目集成时，替换为真实实现即可：
 *   import { useSettingsStore } from "@/hooks/useSettingsStore";
 */

import { useState, useCallback } from "react";

interface SettingsValues {
  aiApiKey: string;
  aiModel: string;
  aiTemperature: string;
  aiTopP: string;
  aiMaxTokens: string;
  aiBaseUrl: string;
}

const DEFAULT_VALUES: SettingsValues = {
  aiApiKey: "",
  aiModel: "",
  aiTemperature: "0.7",
  aiTopP: "0.9",
  aiMaxTokens: "2048",
  aiBaseUrl: "",
};

export function useSettingsStore() {
  const [values, setValues] = useState<SettingsValues>(() => {
    try {
      const stored = localStorage.getItem("yyc3_settings");
      return stored ? { ...DEFAULT_VALUES, ...JSON.parse(stored) } : DEFAULT_VALUES;
    } catch {
      return DEFAULT_VALUES;
    }
  });

  const updateValue = useCallback((key: keyof SettingsValues, value: string) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem("yyc3_settings", JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  return { values, updateValue };
}
