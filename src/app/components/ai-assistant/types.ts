/**
 * @file types.ts
 * @description AI 助手类型定义（自包含版本）
 * @author YanYuCloudCube Team
 * @version v1.1.0
 */

/** AI 助理聊天消息 */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

/** AI 助理系统命令类别 */
export type CommandCategory = "cluster" | "model" | "data" | "security" | "monitor";

export type AITab = "chat" | "commands" | "prompts" | "settings";

export interface FloatingPanelState {
  isOpen: boolean;
  isMaximized: boolean;
  activeTab: AITab;
}

export interface ChatState {
  messages: ChatMessage[];
  inputValue: string;
  isTyping: boolean;
  systemPrompt: string;
}

export interface AIConfigState {
  apiKey: string;
  selectedModel: string;
  temperature: number;
  topP: number;
  maxTokens: number;
}

export interface AIAssistantProps {
  isMobile?: boolean;
}
