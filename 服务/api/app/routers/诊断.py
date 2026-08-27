"""诊断接口：开始诊断、提交答案。"""

from fastapi import APIRouter

from app.services import 伴学服务
from 包.contracts.模型 import (
    DiagnosisResult,
    DiagnosisSession,
    DiagnosisStartRequest,
    DiagnosisSubmitRequest,
)

router = APIRouter(prefix="/api/v1/diagnosis", tags=["diagnosis"])


@router.post("/start", response_model=DiagnosisSession, summary="Start diagnosis session")
def start_diagnosis(payload: DiagnosisStartRequest) -> DiagnosisSession:
    return 伴学服务.start_diagnosis(payload)


@router.post("/submit", response_model=DiagnosisResult, summary="Submit diagnosis answers")
def submit_diagnosis(payload: DiagnosisSubmitRequest) -> DiagnosisResult:
    return 伴学服务.submit_diagnosis(
        payload.session_id, payload.student_id, payload.answers
    )