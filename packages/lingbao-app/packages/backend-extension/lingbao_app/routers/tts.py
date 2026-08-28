"""Kokoro TTS 接入(参考 voicebox backend/backends/kokoro_backend.py)

默认调用本地 Kokoro 服务(voicebox 风格:端口 17493)
如未启动 Kokoro,降级到 mock 返回。
"""
import os
import httpx
from fastapi import APIRouter
from fastapi.responses import Response
from pydantic import BaseModel

router = APIRouter(prefix="/api/tts", tags=["tts"])

KOKORO_URL = os.environ.get("KOKORO_URL", "http://localhost:17493")

class SynthesizeReq(BaseModel):
    text: str
    voice: str = "zf_xiaoxiao"  # Kokoro 中文童声
    speed: float = 1.0


@router.post("/synthesize", summary="Kokoro TTS 合成")
async def synthesize(req: SynthesizeReq):
    # 调用 Kokoro 服务
    try:
        async with httpx.AsyncClient(timeout=10) as c:
            r = await c.post(KOKORO_URL + "/synthesize", json={"text": req.text, "voice": req.voice, "speed": req.speed})
            if r.status_code == 200 and r.headers.get("content-type", "").startswith("audio/"):
                return Response(content=r.content, media_type=r.headers.get("content-type", "audio/wav"))
    except Exception as e:
        print("[tts] kokoro unavailable, fallback to mock:", e)
    # fallback: 返回 metadata,前端用 Web Speech API 兜底
    return {"text": req.text, "voice": req.voice, "fallback": "web-speech-api"}


@router.get("/voices", summary="列出可用 Kokoro 音色")
def voices():
    return {
        "chinese_female": [
            {"id": "zf_xiaoxiao", "name": "小小", "desc": "明亮可爱中文女童声(默认)"},
            {"id": "zf_xiaoni", "name": "小妮", "desc": "温柔中文女童声"},
            {"id": "zf_xiaobei", "name": "小北", "desc": "清爽中文女童声"},
            {"id": "zf_xiaoyi", "name": "小艺", "desc": "活泼中文女童声"},
        ],
        "english_female": [
            {"id": "af_heart", "name": "Heart", "desc": "Warm American female"},
            {"id": "af_bella", "name": "Bella", "desc": "Soft American female"},
        ],
    }