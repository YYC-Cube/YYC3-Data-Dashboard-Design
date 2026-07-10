import { Activity, AlertTriangle, Check, Database, LogOut, Play, RefreshCw as Refresh, Server, Square, Terminal, Wifi, X } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

interface LogEntry {
  timestamp: string;
  message: string;
}

interface ServiceConfig {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  port: string;
  command: string;
  status: "stopped" | "running" | "error";
  pid?: number;
  lastCheck?: Date;
  logs?: LogEntry[];
}

interface LocalServiceManagerProps {}

export function LocalServiceManager({}: LocalServiceManagerProps) {
  const [services, setServices] = useState<ServiceConfig[]>([
    {
      id: "frontend",
      name: "前端应用",
      icon: Server,
      port: "3118",
      command: "pnpm dev",
      status: "stopped",
      logs: [],
    },
    {
      id: "websocket",
      name: "WebSocket 服务器",
      icon: Wifi,
      port: "3113",
      command: "pnpm ws-server",
      status: "stopped",
      logs: [],
    },
    {
      id: "database",
      name: "PostgreSQL 数据库",
      icon: Database,
      port: "5433",
      command: "brew services start postgresql@15",
      status: "stopped",
      logs: [],
    },
    {
      id: "ollama",
      name: "Ollama AI 服务",
      icon: Activity,
      port: "11434",
      command: "ollama serve",
      status: "stopped",
      logs: [],
    },
  ]);

  const [editingService, setEditingService] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [startingService, setStartingService] = useState<string | null>(null);
  const [stoppingService, setStoppingService] = useState<string | null>(null);

  const checkServiceStatus = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/services/${serviceId}/status`);
      if (response.ok) {
        const data = await response.json();
        setServices(prev => prev.map(s => s.id === serviceId ? { ...s, ...data } : s));
      }
    } catch (error) {
      console.error(`Failed to check status for ${serviceId}:`, error);
    }
  };

  const startService = async (serviceId: string) => {
    setStartingService(serviceId);
    try {
      const response = await fetch(`/api/services/${serviceId}/start`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setServices(prev => prev.map(s => s.id === serviceId ? { ...s, ...data, status: "running" } : s));
        toast.success(`${services.find(s => s.id === serviceId)?.name} 已启动`, {
          description: `端口: ${services.find(s => s.id === serviceId)?.port}`,
        });
      } else {
        throw new Error("启动失败");
      }
    } catch (error) {
      setServices(prev => prev.map(s => s.id === serviceId ? { ...s, status: "error" } : s));
      toast.error("启动失败", {
        description: `${services.find(s => s.id === serviceId)?.name} 启动失败，请检查日志`,
      });
    } finally {
      setStartingService(null);
    }
  };

  const stopService = async (serviceId: string) => {
    setStoppingService(serviceId);
    try {
      const response = await fetch(`/api/services/${serviceId}/stop`, {
        method: "POST",
      });

      if (response.ok) {
        setServices(prev => prev.map(s => s.id === serviceId ? { ...s, status: "stopped", pid: undefined } : s));
        toast.success(`${services.find(s => s.id === serviceId)?.name} 已停止`);
      } else {
        throw new Error("停止失败");
      }
    } catch (error) {
      toast.error("停止失败", {
        description: `${services.find(s => s.id === serviceId)?.name} 停止失败`,
      });
    } finally {
      setStoppingService(null);
    }
  };

  const startAllServices = async () => {
    const stoppedServices = services.filter(s => s.status === "stopped");

    if (stoppedServices.length === 0) {
      toast.info("所有服务已在运行中");
      return;
    }

    toast.info(`正在启动 ${stoppedServices.length} 个服务...`);

    for (const service of stoppedServices) {
      await startService(service.id);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    toast.success("所有服务启动完成");
  };

  const stopAllServices = async () => {
    const runningServices = services.filter(s => s.status === "running");

    if (runningServices.length === 0) {
      toast.info("没有运行中的服务");
      return;
    }

    toast.info(`正在停止 ${runningServices.length} 个服务...`);

    for (const service of runningServices) {
      await stopService(service.id);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    toast.success("所有服务已停止");
  };

  const refreshAllServices = async () => {
    toast.info("正在刷新服务状态...");
    await Promise.all(services.map(s => checkServiceStatus(s.id)));
    toast.success("服务状态已刷新");
  };

  const updateServicePort = (serviceId: string, newPort: string) => {
    setServices(prev => prev.map(s => s.id === serviceId ? { ...s, port: newPort } : s));
    toast.success("端口已更新", {
      description: `${services.find(s => s.id === serviceId)?.name} 端口已更新为 ${newPort}`,
    });
  };

  const updateServiceCommand = (serviceId: string, newCommand: string) => {
    setServices(prev => prev.map(s => s.id === serviceId ? { ...s, command: newCommand } : s));
    toast.success("命令已更新", {
      description: `${services.find(s => s.id === serviceId)?.name} 启动命令已更新`,
    });
  };

  const getStatusColor = (status: ServiceConfig["status"]) => {
    switch (status) {
      case "running":
        return "text-[#00ff88]";
      case "error":
        return "text-[#ff4444]";
      default:
        return "text-[rgba(0,212,255,0.4)]";
    }
  };

  const getStatusBg = (status: ServiceConfig["status"]) => {
    switch (status) {
      case "running":
        return "bg-[rgba(0,255,136,0.1)] border-[rgba(0,255,136,0.2)]";
      case "error":
        return "bg-[rgba(255,68,68,0.1)] border-[rgba(255,68,68,0.2)]";
      default:
        return "bg-[rgba(0,40,80,0.15)] border-[rgba(0,180,255,0.08)]";
    }
  };

  const runningCount = services.filter(s => s.status === "running").length;
  const totalCount = services.length;

  return (
    <div className="space-y-6">
      <h3 className="text-[#e0f0ff] mb-4 flex items-center gap-2" style={{ fontSize: "0.95rem" }}>
        <Activity className="w-4 h-4 text-[#00ff88]" />
        本地服务管理
      </h3>

      <div className="p-3 rounded-xl bg-[rgba(0,40,80,0.2)] border border-[rgba(0,180,255,0.08)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-[rgba(0,212,255,0.4)]" />
              <span className="text-[rgba(0,212,255,0.5)]" style={{ fontSize: "0.78rem" }}>
                运行中: {runningCount} / {totalCount}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshAllServices}
              className="p-2 rounded-lg bg-[rgba(0,40,80,0.3)] border border-[rgba(0,180,255,0.1)] text-[rgba(0,212,255,0.4)] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.1)] transition-all"
              title="刷新服务状态"
            >
              <Refresh className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={startAllServices}
            disabled={runningCount === totalCount}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.2)] text-[#00ff88] hover:bg-[rgba(0,255,136,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSize: "0.8rem" }}
          >
            <Play className="w-4 h-4" />
            一键启动所有服务
          </button>
          <button
            onClick={stopAllServices}
            disabled={runningCount === 0}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[rgba(255,68,68,0.1)] border border-[rgba(255,68,68,0.2)] text-[#ff4444] hover:bg-[rgba(255,68,68,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSize: "0.8rem" }}
          >
            <Square className="w-4 h-4" />
            一键停止所有服务
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[rgba(0,212,255,0.6)]" style={{ fontSize: "0.8rem" }}>服务列表</h4>

        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className={`p-4 rounded-xl border transition-all ${
                service.status === "running"
                  ? "bg-[rgba(0,255,136,0.05)] border-[rgba(0,255,136,0.15)]"
                  : service.status === "error"
                  ? "bg-[rgba(255,68,68,0.05)] border-[rgba(255,68,68,0.15)]"
                  : "bg-[rgba(0,40,80,0.15)] border-[rgba(0,180,255,0.06)] hover:border-[rgba(0,180,255,0.15)]"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusBg(service.status)}`}>
                    <Icon className={`w-5 h-5 ${getStatusColor(service.status)}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[#c0dcf0]" style={{ fontSize: "0.82rem" }}>{service.name}</p>
                      {service.status === "running" && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(0,255,136,0.1)] text-[#00ff88]" style={{ fontSize: "0.68rem" }}>
                          <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                          运行中
                        </div>
                      )}
                      {service.status === "error" && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(255,68,68,0.1)] text-[#ff4444]" style={{ fontSize: "0.68rem" }}>
                          <AlertTriangle className="w-3 h-3" />
                          错误
                        </div>
                      )}
                      {service.status === "stopped" && (
                        <div className="px-2 py-0.5 rounded-full bg-[rgba(0,40,80,0.3)] text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.68rem" }}>
                          已停止
                        </div>
                      )}
                    </div>
                    <p className="text-[rgba(0,212,255,0.35)]" style={{ fontSize: "0.68rem" }}>
                      PID: {service.pid || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {service.status === "stopped" ? (
                    <button
                      onClick={() => startService(service.id)}
                      disabled={startingService === service.id}
                      className="p-2 rounded-lg bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.2)] text-[#00ff88] hover:bg-[rgba(0,255,136,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="启动服务"
                    >
                      {startingService === service.id ? (
                        <Refresh className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => stopService(service.id)}
                      disabled={stoppingService === service.id}
                      className="p-2 rounded-lg bg-[rgba(255,68,68,0.1)] border border-[rgba(255,68,68,0.2)] text-[#ff4444] hover:bg-[rgba(255,68,68,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="停止服务"
                    >
                      {stoppingService === service.id ? (
                        <Refresh className="w-4 h-4 animate-spin" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => setEditingService(service.id)}
                    className="p-2 rounded-lg bg-[rgba(0,40,80,0.3)] border border-[rgba(0,180,255,0.1)] text-[rgba(0,212,255,0.4)] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.1)] transition-all"
                    title="编辑配置"
                  >
                    <Terminal className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowLogs(service.id)}
                    className="p-2 rounded-lg bg-[rgba(0,40,80,0.3)] border border-[rgba(0,180,255,0.1)] text-[rgba(0,212,255,0.4)] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.1)] transition-all"
                    title="查看日志"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {editingService === service.id && (
                <div className="space-y-3 mt-4 pt-4 border-t border-[rgba(0,180,255,0.08)]">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-[rgba(0,40,80,0.2)] border border-[rgba(0,180,255,0.08)]">
                      <p className="text-[rgba(0,212,255,0.5)] mb-1" style={{ fontSize: "0.72rem" }}>服务端口</p>
                      <input
                        type="text"
                        value={service.port}
                        onChange={(e) => updateServicePort(service.id, e.target.value)}
                        className="w-full px-2 py-1.5 rounded bg-[rgba(0,40,80,0.4)] border border-[rgba(0,212,255,0.3)] text-[#00d4ff] focus:outline-none focus:border-[rgba(0,212,255,0.5)]"
                        style={{ fontSize: "0.78rem" }}
                      />
                    </div>
                    <div className="p-3 rounded-lg bg-[rgba(0,40,80,0.2)] border border-[rgba(0,180,255,0.08)]">
                      <p className="text-[rgba(0,212,255,0.5)] mb-1" style={{ fontSize: "0.72rem" }}>启动命令</p>
                      <input
                        type="text"
                        value={service.command}
                        onChange={(e) => updateServiceCommand(service.id, e.target.value)}
                        className="w-full px-2 py-1.5 rounded bg-[rgba(0,40,80,0.4)] border border-[rgba(0,212,255,0.3)] text-[#00d4ff] focus:outline-none focus:border-[rgba(0,212,255,0.5)] font-mono"
                        style={{ fontSize: "0.72rem" }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingService(null)}
                      className="px-4 py-2 rounded-lg bg-[rgba(0,40,80,0.3)] border border-[rgba(0,180,255,0.1)] text-[rgba(0,212,255,0.4)] hover:text-[#00d4ff] transition-all"
                      style={{ fontSize: "0.78rem" }}
                    >
                      取消
                    </button>
                    <button
                      onClick={() => setEditingService(null)}
                      className="px-4 py-2 rounded-lg bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.25)] transition-all"
                      style={{ fontSize: "0.78rem" }}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      确认
                    </button>
                  </div>
                </div>
              )}

              {showLogs === service.id && (
                <div className="mt-4 pt-4 border-t border-[rgba(0,180,255,0.08)]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[rgba(0,212,255,0.5)]" style={{ fontSize: "0.8rem" }}>
                      服务日志
                    </p>
                    <button
                      onClick={() => setShowLogs(null)}
                      className="p-1 rounded hover:bg-[rgba(0,212,255,0.1)] transition-all"
                    >
                      <X className="w-4 h-4 text-[rgba(0,212,255,0.4)]" />
                    </button>
                  </div>
                  <div className="p-3 rounded-lg bg-[rgba(0,0,0,0.6)] border border-[rgba(0,180,255,0.1)] max-h-48 overflow-y-auto">
                    <pre className="font-mono text-[rgba(0,255,136,0.8)]" style={{ fontSize: "0.72rem" }}>
                      {service.logs && service.logs.length > 0 ? (
                        service.logs.map((log, idx) => (
                          <div key={idx} className="mb-1">
                            <span className="text-[rgba(0,212,255,0.3)]">[{log.timestamp}]</span> {log.message}
                          </div>
                        ))
                      ) : (
                        <p className="text-[rgba(0,212,255,0.3)] italic">暂无日志</p>
                      )}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-[rgba(0,40,80,0.15)] border border-[rgba(0,180,255,0.06)]">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-[rgba(255,221,0,0.6)]" />
          <p className="text-[rgba(0,212,255,0.5)]" style={{ fontSize: "0.78rem" }}>使用说明</p>
        </div>
        <ul className="space-y-2 text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.75rem", paddingLeft: "1.2rem" }}>
          <li>点击"一键启动所有服务"可快速启动所有本地服务</li>
          <li>可以单独控制每个服务的启动和停止</li>
          <li>编辑端口和启动命令以自定义服务配置</li>
          <li>点击日志图标查看服务的运行日志</li>
          <li>修改配置后请重启相关服务以生效</li>
          <li>确保 PostgreSQL 和 Ollama 已正确安装并运行</li>
        </ul>
      </div>
    </div>
  );
}
