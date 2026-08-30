import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

/** 桌面端悬浮按钮：弹出二维码，手机扫码直达手机端（/mobile）。
 * 部署环境用公网 origin；仅本地开发用后端返回的局域网 IP（便于同 wifi 手机扫码）。 */
export function MobileQrButton() {
  const [open, setOpen] = useState(false);
  const isDev = window.location.hostname === "localhost";

  const { data } = useQuery({
    queryKey: ["network-host"],
    queryFn: async () => {
      const res = await fetch("/api/v1/network/host");
      if (!res.ok) throw new Error("network host");
      return res.json() as Promise<{ ip: string; frontend_port: number }>;
    },
    enabled: isDev, // 部署环境不查询后端，立即走 origin fallback
    retry: false,
    staleTime: 5 * 60_000,
  });

  const mobileUrl =
    isDev && data
      ? `http://${data.ip}:${data.frontend_port}/mobile`
      : `${window.location.origin}/mobile`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-xl shadow-lg transition hover:scale-105"
        aria-label="手机端入口"
        title="手机扫码进入手机端"
      >
        📱
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl bg-[hsl(var(--card))] p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 text-2xl">📱</div>
            <h3 className="mb-1 text-lg font-bold">手机端入口</h3>
            <p className="mb-4 text-xs text-[hsl(var(--muted-foreground))]">
              手机扫码即可进入手机端学习空间
            </p>
            <div className="mx-auto mb-4 flex w-fit items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-white p-3">
              {mobileUrl ? (
                <QRCodeSVG value={mobileUrl} size={176} />
              ) : (
                <div className="flex h-[176px] w-[176px] items-center justify-center text-xs text-[hsl(var(--muted-foreground))]">
                  正在生成二维码…
                </div>
              )}
            </div>
            <p className="break-all text-[11px] text-[hsl(var(--muted-foreground))]">
              {mobileUrl || "请确认后端服务已启动"}
            </p>
            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full rounded-xl bg-[hsl(var(--primary))] py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))]"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </>
  );
}
