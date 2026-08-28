import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { AI伙伴 } from "@/components/companion/AI伙伴";
import { 卡片, 卡片内容 } from "@/components/ui/卡片";
import { 按钮 } from "@/components/ui/按钮";
import { useAppStore } from "@/stores/应用状态";
import { cn } from "@/lib/工具函数";

const SUBJECTS = [
  { value: "math", label: "数学" },
  { value: "chinese", label: "语文" },
  { value: "english", label: "英语" },
];

export function 拍照改卷页() {
  const { studentId } = useAppStore();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [subject, setSubject] = useState("math");
  const [note, setNote] = useState("");
  const [selfCorrect, setSelfCorrect] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data: history } = useQuery({
    queryKey: ["practices", studentId],
    queryFn: () => api.listPractices(studentId),
  });

  const upload = useMutation({
    mutationFn: () => api.uploadPractice(studentId, subject, note, selfCorrect, file!),
    onSuccess: (res) => {
      setFeedback(res.ai_feedback);
      setFile(null);
      setPreview("");
      setNote("");
      qc.invalidateQueries({ queryKey: ["practices"] });
    },
  });

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setFeedback(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(f);
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-5 py-2">
      <div className="flex items-center gap-3">
        <AI伙伴 size={56} showBubble={false} />
        <div>
          <h2 className="text-xl font-black text-foreground">AI 智能改卷 📸</h2>
          <p className="text-sm text-muted-foreground">拍照你做的练习，AI 帮你批改并记住，长期给出建议</p>
        </div>
      </div>

      {/* 上传区 */}
      <卡片>
        <卡片内容 className="p-5">
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPick} />
          {preview ? (
            <div className="relative overflow-hidden rounded-xl ring-1 ring-white/15">
              <img src={preview} alt="练习照片" className="max-h-72 w-full object-contain" />
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview("");
                }}
                className="absolute right-2 top-2 rounded-lg bg-black/60 px-2 py-1 text-xs text-white"
              >
                重新选择
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-white/15 bg-white/5 py-10 text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
            >
              <span className="text-3xl" aria-hidden>📷</span>
              <span className="text-sm font-semibold">点击拍照 / 选择练习图片</span>
              <span className="text-[11px]">支持手机拍照上传，10MB 以内</span>
            </button>
          )}

          {/* 学科 */}
          <div className="mt-4 flex gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSubject(s.value)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-semibold ring-1 transition",
                  subject === s.value ? "bg-primary/20 text-foreground ring-primary/50" : "bg-white/5 text-muted-foreground ring-white/10",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* 题目说明 */}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="这道题考的是什么？你的答案是什么？（可简单描述，AI 会记住）"
            className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
          />

          {/* 对错自评 */}
          <div className="mt-3 flex items-center gap-4">
            <span className="text-sm text-muted-foreground">你觉得自己这题：</span>
            {[
              { v: true, label: "✅ 做对了", cls: "text-emerald-400 ring-emerald-400/40" },
              { v: false, label: "❌ 做错了", cls: "text-rose-400 ring-rose-400/40" },
            ].map((o) => (
              <button
                key={String(o.v)}
                type="button"
                onClick={() => setSelfCorrect(o.v)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-semibold ring-1 transition",
                  selfCorrect === o.v ? `bg-white/10 ${o.cls}` : "bg-white/5 text-muted-foreground ring-white/10",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>

          <按钮
            className="mt-4 h-11 w-full"
            disabled={!file || upload.isPending}
            onClick={() => upload.mutate()}
          >
            {upload.isPending ? "AI 批改中…" : "🤖 AI 批改"}
          </按钮>

          {feedback && (
            <div className="mt-3 rounded-xl bg-primary/10 px-4 py-3 text-sm text-foreground ring-1 ring-primary/25">
              <span className="font-bold">🤖 AI 批改：</span>
              {feedback}
            </div>
          )}
        </卡片内容>
      </卡片>

      {/* 历史 */}
      {history && history.length > 0 && (
        <div>
          <h3 className="mb-2 text-base font-bold text-foreground">📁 批改记录（{history.length}）</h3>
          <div className="space-y-2">
            {history.slice(0, 5).map((h) => (
              <div key={h.practice_id} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                {h.image_path && <img src={`http://localhost:8000${h.image_path}`} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs text-foreground">{h.note || SUBJECTS.find((s) => s.value === h.subject)?.label}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {h.self_correct ? "✅ 做对" : "❌ 做错"} · {new Date(h.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
