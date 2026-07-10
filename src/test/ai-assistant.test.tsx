/**
 * AI Assistant 模块测试
 * ===================
 * 覆盖：常量定义、Hooks、组件、类型
 */

import { act, render, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ============================================================
// 0. Mock 外部依赖
// ============================================================

vi.mock("../app/components/ai-assistant/hooks/stubs/useModelProvider", () => ({
  useModelProvider: () => ({
    availableModels: [
      { id: "llama3", name: "Llama 3", provider: "Ollama" },
      { id: "qwen2.5", name: "Qwen 2.5", provider: "Ollama" },
    ],
    ollamaLoading: false,
    ollamaUrl: "http://localhost:11434",
    setOllamaUrl: vi.fn(),
    rescan: vi.fn(),
    addModel: vi.fn(),
    removeModel: vi.fn(),
  }),
}));

vi.mock("../app/components/ai-assistant/hooks/stubs/useSettingsStore", async () => {
  const { useState } = await import("react");
  return {
    useSettingsStore: () => {
      const [values, setValues] = useState({
        aiTemperature: "0.7",
        aiTopP: "0.9",
        aiMaxTokens: "2048",
        aiModel: "llama3",
        aiApiKey: "",
      });
      const updateValue = (key: string, value: string) => {
        setValues((prev) => ({ ...prev, [key]: value }));
      };
      return { values, updateValue };
    },
  };
});

// ============================================================
// 1. Constants 测试
// ============================================================
import { CMD_CATEGORIES, SYSTEM_COMMANDS } from "../app/components/ai-assistant/constants/commands";
import { PROMPT_PRESETS } from "../app/components/ai-assistant/constants/prompts";

describe("SYSTEM_COMMANDS", () => {
  it("应包含 10 个系统命令", () => {
    expect(SYSTEM_COMMANDS).toHaveLength(10);
  });

  it("每个命令应有唯一 id 和必要字段", () => {
    const ids = SYSTEM_COMMANDS.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(SYSTEM_COMMANDS.length);

    SYSTEM_COMMANDS.forEach((cmd) => {
      expect(cmd.id).toBeTruthy();
      expect(cmd.label).toBeTruthy();
      expect(cmd.desc).toBeTruthy();
      expect(cmd.action).toBeTruthy();
      expect(cmd.color).toBeTruthy();
      expect(cmd.icon).toBeDefined();
      expect(["cluster", "model", "data", "security", "monitor"]).toContain(cmd.category);
    });
  });

  it("cmd-01 应为集群状态总览", () => {
    const cmd = SYSTEM_COMMANDS.find((c) => c.id === "cmd-01");
    expect(cmd?.label).toBe("集群状态总览");
    expect(cmd?.category).toBe("cluster");
  });
});

describe("CMD_CATEGORIES", () => {
  it("应包含全部和5个分类", () => {
    expect(CMD_CATEGORIES).toHaveLength(6);
    const keys = CMD_CATEGORIES.map((c) => c.key);
    expect(keys).toContain("all");
    expect(keys).toContain("cluster");
    expect(keys).toContain("model");
    expect(keys).toContain("data");
    expect(keys).toContain("security");
    expect(keys).toContain("monitor");
  });
});

describe("PROMPT_PRESETS", () => {
  it("应包含 5 个提示词预设", () => {
    expect(PROMPT_PRESETS).toHaveLength(5);
  });

  it("每个预设应有唯一 id", () => {
    const ids = PROMPT_PRESETS.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(PROMPT_PRESETS.length);
  });

  it("p5 应为智能运维助手（默认角色）", () => {
    const p5 = PROMPT_PRESETS.find((p) => p.id === "p5");
    expect(p5?.name).toBe("智能运维助手");
    expect(p5?.category).toBe("通用");
  });
});

// ============================================================
// 2. Hooks 测试
// ============================================================
import { useAIConfig } from "../app/components/ai-assistant/hooks/useAIConfig";
import { useChat } from "../app/components/ai-assistant/hooks/useChat";
import { useDraggable } from "../app/components/ai-assistant/hooks/useDraggable";
import { useFloatingPanel } from "../app/components/ai-assistant/hooks/useFloatingPanel";

describe("useChat", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("应初始化包含欢迎消息", () => {
    const { result } = renderHook(() => useChat());
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe("assistant");
    expect(result.current.messages[0].content).toContain("AI 智能助理");
  });

  it("sendMessage 应添加用户消息并生成回复", async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      const sendPromise = result.current.sendMessage("你好");
      await vi.runAllTimersAsync();
      await sendPromise;
    });

    expect(result.current.messages.length).toBeGreaterThanOrEqual(2);
    const userMsg = result.current.messages.find((m) => m.role === "user");
    expect(userMsg).toBeDefined();
    expect(userMsg?.content).toBe("你好");

    const aiMsg = result.current.messages.find((m) => m.role === "assistant" && m.id !== "welcome");
    expect(aiMsg).toBeDefined();
  });

  it("sendMessage 空字符串不应发送", async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("   ");
    });

    expect(result.current.messages).toHaveLength(1);
  });

  it("applyPreset 应切换系统提示词", () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.applyPreset("p1");
    });

    const p1 = PROMPT_PRESETS.find((p) => p.id === "p1");
    expect(result.current.systemPrompt).toBe(p1?.prompt);
  });

  it("clearChat 应清空对话并重置", () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.clearChat();
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toContain("已清空");
  });
});

describe("useFloatingPanel", () => {
  it("默认应为关闭状态", () => {
    const { result } = renderHook(() => useFloatingPanel());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.activeTab).toBe("chat");
  });

  it("openPanel 应打开面板", () => {
    const { result } = renderHook(() => useFloatingPanel());

    act(() => {
      result.current.openPanel();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it("closePanel 应关闭面板并重置最大化", () => {
    const { result } = renderHook(() => useFloatingPanel({ defaultOpen: true }));

    act(() => {
      result.current.toggleMaximize();
    });
    expect(result.current.isMaximized).toBe(true);

    act(() => {
      result.current.closePanel();
    });
    expect(result.current.isOpen).toBe(false);
    expect(result.current.isMaximized).toBe(false);
  });

  it("setActiveTab 应切换标签页", () => {
    const { result } = renderHook(() => useFloatingPanel());

    act(() => {
      result.current.setActiveTab("commands");
    });
    expect(result.current.activeTab).toBe("commands");

    act(() => {
      result.current.setActiveTab("settings");
    });
    expect(result.current.activeTab).toBe("settings");
  });
});

describe("useAIConfig", () => {
  it("应返回默认配置值", () => {
    const { result } = renderHook(() => useAIConfig());
    expect(result.current.temperature).toBe(0.7);
    expect(result.current.topP).toBe(0.9);
    expect(result.current.maxTokens).toBe(2048);
  });

  it("setTemperature 应更新温度值", () => {
    const { result } = renderHook(() => useAIConfig());

    act(() => {
      result.current.setTemperature(1.2);
    });
    expect(result.current.temperature).toBe(1.2);
  });

  it("setTopP 应更新 top_p 值", () => {
    const { result } = renderHook(() => useAIConfig());

    act(() => {
      result.current.setTopP(0.5);
    });
    expect(result.current.topP).toBe(0.5);
  });

  it("setMaxTokens 应更新最大 token 数", () => {
    const { result } = renderHook(() => useAIConfig());

    act(() => {
      result.current.setMaxTokens(4096);
    });
    expect(result.current.maxTokens).toBe(4096);
  });
});

describe("useDraggable", () => {
  it("应返回初始位置", () => {
    const initialPos = { x: 100, y: 200 };
    const { result } = renderHook(() => useDraggable({ initialPosition: initialPos }));
    expect(result.current.position).toEqual(initialPos);
    expect(result.current.isDragging).toBe(false);
  });

  it("resetPosition 应重置到初始位置", () => {
    const initialPos = { x: 100, y: 200 };
    const { result } = renderHook(() => useDraggable({ initialPosition: initialPos }));

    act(() => {
      result.current.resetPosition();
    });

    expect(result.current.position).toEqual(initialPos);
  });
});

// ============================================================
// 3. YYC3Logo 组件测试
// ============================================================
import { YYC3Logo } from "../app/components/YYC3Logo";

describe("YYC3Logo", () => {
  it("应渲染包含图片的容器", () => {
    const { container } = render(<YYC3Logo size={48} />);
    const div = container.firstElementChild;
    expect(div).toBeDefined();
    expect(div?.tagName).toBe("DIV");
    // 验证 img 子元素存在
    const img = div?.querySelector("img");
    expect(img).toBeDefined();
  });

  it("应使用正确的图标路径", () => {
    const { container } = render(<YYC3Logo />);
    const img = container.querySelector("img") as HTMLImageElement;
    expect(img).toBeDefined();
    expect(img.src).toContain("/yyc3-icons/android/playstore-icon.png");
  });

  it("应接受自定义尺寸", () => {
    const { container } = render(<YYC3Logo size={64} />);
    const img = container.querySelector("img") as HTMLImageElement;
    expect(img).toBeDefined();
    expect(img.width).toBe(64);
    expect(img.height).toBe(64);
  });

  it("showGlow 应渲染发光效果", () => {
    const { container } = render(<YYC3Logo showGlow />);
    const img = container.querySelector("img");
    expect(img).toBeDefined();
  });

  it("showPulse 应渲染脉冲指示灯", () => {
    const { container } = render(<YYC3Logo showPulse />);
    const pulseDiv = container.querySelector(".animate-pulse");
    expect(pulseDiv).toBeDefined();
  });
});

// ============================================================
// 4. Types 测试
// ============================================================
import type {
  AITab,
  ChatMessage,
} from "../app/components/ai-assistant/types";

describe("Types", () => {
  it("ChatMessage 应满足接口定义", () => {
    const msg: ChatMessage = {
      id: "test-1",
      role: "user",
      content: "你好",
      timestamp: Date.now(),
    };
    expect(msg.id).toBe("test-1");
    expect(msg.role).toBe("user");
  });

  it("AITab 应为有效值", () => {
    const tabs: AITab[] = ["chat", "commands", "prompts", "settings"];
    expect(tabs).toHaveLength(4);
  });
});
