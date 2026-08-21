"""诊断接口：开始诊断、提交答案。"""

from fastapi import APIRouter

from app.services import tutor
from packages.contracts.models import (
    DiagnosisResult,
    DiagnosisSession,
    DiagnosisStartRequest,
    DiagnosisSubmitRequest,
)

router = APIRouter(prefix="/api/v1/diagnosis", tags=["diagnosis"])


@router.post("/start", response_model=DiagnosisSession, summary="Start diagnosis session")
def start_diagnosis(payload: DiagnosisStartRequest) -> DiagnosisSession:
    return tutor.start_diagnosis(payload)


@router.post("/submit", response_model=DiagnosisResult, summary="Submit diagnosis answers")
def submit_diagnosis(payload: DiagnosisSubmitRequest) -> DiagnosisResult:
    return tutor.submit_diagnosis(
        payload.session_id, payload.student_id, payload.answers
    )
