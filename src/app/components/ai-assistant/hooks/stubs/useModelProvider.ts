"use client"

/**
 * @file hooks/stubs/useModelProvider.ts
 * @description 模型提供器 — 本地扫描 + 自编辑 + localStorage 持久化
 * @author YanYuCloudCube Team
 * @version v2.0.0
 */

import { useCallback, useEffect, useState } from "react";

export interface ModelEntry {
  id: string;
  name: string;
  provider: string;
  isLocal: boolean;
  baseUrl?: string;
}

const STORAGE_KEY = "yyc3_ai_models";
const OLLAMA_DEFAULT_URL = "http://localhost:11434";

/** 检测是否为本地开发环境，非本地环境跳过 Ollama 扫描 */
const isLocalhost = (): boolean => {
  if (typeof window === "undefined") return false;
  const { hostname } = window.location;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.");
};

const DEFAULT_MODELS: ModelEntry[] = [
  { id: "qwen-72b", name: "Qwen-72B", provider: "ollama", isLocal: true, baseUrl: OLLAMA_DEFAULT_URL },
  { id: "deepseek-v3", name: "DeepSeek-V3", provider: "ollama", isLocal: true, baseUrl: OLLAMA_DEFAULT_URL },
];

function loadModels(): ModelEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch { /* ignore */ }
  return DEFAULT_MODELS;
}

function saveModels(models: ModelEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
  } catch { /* ignore */ }
}

async function scanOllamaModels(baseUrl: string): Promise<ModelEntry[]> {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.models || []).map((m: { name: string; model?: string; size?: number }) => ({
      id: m.name || m.model,
      name: m.name || m.model,
      provider: "ollama",
      isLocal: true,
      baseUrl,
    }));
  } catch {
    return [];
  }
}

export function useModelProvider() {
  const [availableModels, setAvailableModels] = useState<ModelEntry[]>([]);
  const [ollamaLoading, setOllamaLoading] = useState(true);
  const [ollamaUrl, setOllamaUrlState] = useState(() => {
    try {
      return localStorage.getItem("yyc3_ollama_url") || OLLAMA_DEFAULT_URL;
    } catch { return OLLAMA_DEFAULT_URL; }
  });

  // 初始化：加载已保存模型 + 扫描 Ollama（仅本地环境）
  useEffect(() => {
    async function init() {
      setOllamaLoading(true);
      const saved = loadModels();

      // 非本地环境跳过 Ollama 扫描，直接使用已保存模型
      if (!isLocalhost()) {
        setAvailableModels(saved);
        setOllamaLoading(false);
        return;
      }

      // 扫描 Ollama 本地模型
      const ollamaModels = await scanOllamaModels(ollamaUrl);

      // 合并：Ollama 扫描到的 + 手动添加的远程模型
      const remoteModels = saved.filter((m) => !m.isLocal);
      const merged = [...ollamaModels, ...remoteModels];

      // 如果 Ollama 没扫到但 saved 有本地模型，保留
      if (ollamaModels.length === 0 && saved.some((m) => m.isLocal)) {
        const localSaved = saved.filter((m) => m.isLocal);
        const mergedWithLocal = [...localSaved, ...remoteModels];
        setAvailableModels(mergedWithLocal);
        saveModels(mergedWithLocal);
      } else {
        setAvailableModels(merged);
        saveModels(merged);
      }

      setOllamaLoading(false);
    }
    init();
  }, [ollamaUrl]);

  // 重新扫描 Ollama（仅本地环境）
  const rescan = useCallback(async () => {
    if (!isLocalhost()) return;
    setOllamaLoading(true);
    const saved = loadModels();
    const ollamaModels = await scanOllamaModels(ollamaUrl);
    const remoteModels = saved.filter((m) => !m.isLocal);
    const merged = [...ollamaModels, ...remoteModels];
    setAvailableModels(merged);
    saveModels(merged);
    setOllamaLoading(false);
  }, [ollamaUrl]);

  // 添加自定义模型
  const addModel = useCallback((model: Omit<ModelEntry, "id">) => {
    const id = model.name.toLowerCase().replace(/\s+/g, "-");
    const newModel: ModelEntry = { ...model, id };
    setAvailableModels((prev) => {
      const next = [...prev, newModel];
      saveModels(next);
      return next;
    });
  }, []);

  // 删除模型
  const removeModel = useCallback((id: string) => {
    setAvailableModels((prev) => {
      const next = prev.filter((m) => m.id !== id);
      saveModels(next);
      return next;
    });
  }, []);

  // 更新 Ollama URL
  const setOllamaUrl = useCallback((url: string) => {
    setOllamaUrlState(url);
    try {
      localStorage.setItem("yyc3_ollama_url", url);
    } catch { /* ignore */ }
  }, []);

  return {
    availableModels,
    ollamaLoading,
    ollamaUrl,
    setOllamaUrl,
    rescan,
    addModel,
    removeModel,
  };
}
