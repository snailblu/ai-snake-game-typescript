// 메시지 검증 및 중복 검사 전담 클래스
export class MessageValidator {
    constructor(maxRecentMessages = 5, maxRecentFallbacks = 3) {
        this.maxRecentMessages = maxRecentMessages;
        this.maxRecentFallbacks = maxRecentFallbacks;
        
        // 전역 최근 메시지 추적 (LLM + 폴백 모두 포함)
        this.recentMessages = new Map(); // key: 뱀타입, value: 최근 사용한 메시지들
        
        // 폴백 메시지 중복 방지
        this.recentFallbacks = new Map(); // key: 뱀타입_상황, value: 최근 사용한 메시지들
    }

    // 메시지가 중복인지 확인하고 최근 메시지에 추가
    checkAndAddRecentMessage(message, isAI = false) {
        const snakeType = isAI ? 'AI' : '플레이어';
        const recentMessages = this.recentMessages.get(snakeType) || [];
        
        // 최근 메시지와 중복 확인
        if (recentMessages.includes(message)) {
            return false; // 중복됨
        }
        
        // 최근 메시지 목록 업데이트
        const updatedRecent = [message, ...recentMessages.slice(0, this.maxRecentMessages - 1)];
        this.recentMessages.set(snakeType, updatedRecent);
        
        return true; // 중복 아님
    }

    // 폴백 메시지 중복 검사
    checkFallbackDuplication(message, situation, isAI = false) {
        const snakeType = isAI ? 'AI' : '플레이어';
        const fallbackKey = `${snakeType}_${situation}`;
        const recentFallbacks = this.recentFallbacks.get(fallbackKey) || [];
        
        return !recentFallbacks.includes(message);
    }

    // 폴백 메시지를 최근 사용 목록에 추가
    addRecentFallback(message, situation, isAI = false) {
        const snakeType = isAI ? 'AI' : '플레이어';
        const fallbackKey = `${snakeType}_${situation}`;
        const recentFallbacks = this.recentFallbacks.get(fallbackKey) || [];
        
        const updatedRecent = [message, ...recentFallbacks.slice(0, this.maxRecentFallbacks - 1)];
        this.recentFallbacks.set(fallbackKey, updatedRecent);
    }

    // 사용 가능한 폴백 메시지 필터링
    filterAvailableFallbacks(allTexts, situation, isAI = false) {
        const snakeType = isAI ? 'AI' : '플레이어';
        const fallbackKey = `${snakeType}_${situation}`;
        
        // 최근 사용한 메시지들 가져오기 (전역 + 상황별)
        const recentFallbacks = this.recentFallbacks.get(fallbackKey) || [];
        const globalRecentMessages = this.recentMessages.get(snakeType) || [];
        
        // 전역 및 상황별 중복 모두 제외
        return allTexts.filter(text => 
            !recentFallbacks.includes(text) && !globalRecentMessages.includes(text)
        );
    }

    // 메시지 검증 (길이, 특수문자 등)
    validateMessage(message) {
        if (!message || typeof message !== 'string') {
            return false;
        }
        
        const trimmed = message.trim();
        
        // 빈 메시지 검사
        if (trimmed.length === 0) {
            return false;
        }
        
        // 너무 긴 메시지 검사
        if (trimmed.length > 20) {
            return false;
        }
        
        return true;
    }

    // 스마트 텍스트 자르기 (단어/문장 경계에서 자르기)
    smartTruncate(text, maxLength = 15) {
        if (!text || text.length <= maxLength) {
            return text;
        }
        
        // 먼저 따옴표와 특수문자 제거
        let cleanText = text.replace(/["""'''`]/g, '').trim();
        
        if (cleanText.length <= maxLength) {
            return cleanText;
        }
        
        // 공백 기준으로 단어 분리
        const words = cleanText.split(/\s+/);
        let result = '';
        
        for (const word of words) {
            const testResult = result + (result ? ' ' : '') + word;
            if (testResult.length <= maxLength) {
                result = testResult;
            } else {
                break;
            }
        }
        
        // 결과가 없으면 원본을 maxLength로 자르기
        if (!result) {
            result = cleanText.substring(0, maxLength);
        }
        
        // 문장 끝 처리 (자연스러운 종료)
        if (result.length < cleanText.length) {
            // 마지막 문자가 완전하지 않으면 자연스럽게 처리
            if (!/[.!?ㅋㅎ]$/.test(result)) {
                // 감탄사나 웃음 표현으로 끝나지 않으면 자연스럽게 마무리
                if (result.includes('ㅋ') || result.includes('ㅎ') || result.includes('!')) {
                    // 이미 감정 표현이 있으면 그대로
                } else {
                    // 자연스러운 마무리 추가
                    if (result.length <= maxLength - 1) {
                        result += 'ㅋ';
                    }
                }
            }
        }
        
        return result;
    }

    // 중복 방지를 위한 메시지 변형
    createUniqueMessage(baseMessage, attempts = 0) {
        if (attempts === 0) {
            return baseMessage;
        }
        
        // 시도 횟수에 따라 다른 방식으로 변형
        switch (attempts % 3) {
            case 1:
                return baseMessage + 'ㅋ';
            case 2:
                return baseMessage.replace(/ㅋ+$/, '') + '!';
            default:
                return baseMessage + ` #${attempts}`;
        }
    }

    // 최근 메시지 목록 반환
    getRecentMessages(isAI = false) {
        const snakeType = isAI ? 'AI' : '플레이어';
        return this.recentMessages.get(snakeType) || [];
    }

    // 최근 폴백 메시지 목록 반환
    getRecentFallbacks(situation, isAI = false) {
        const snakeType = isAI ? 'AI' : '플레이어';
        const fallbackKey = `${snakeType}_${situation}`;
        return this.recentFallbacks.get(fallbackKey) || [];
    }

    // 통계 정보 반환
    getStats() {
        return {
            recentMessagesCount: this.recentMessages.size,
            recentFallbacksCount: this.recentFallbacks.size,
            maxRecentMessages: this.maxRecentMessages,
            maxRecentFallbacks: this.maxRecentFallbacks
        };
    }

    // 메시지 기록 초기화
    clearHistory() {
        this.recentMessages.clear();
        this.recentFallbacks.clear();
        console.log('🗑️ [메시지 기록 초기화] 모든 메시지 기록이 제거됨');
    }

    // 특정 뱀의 메시지 기록만 초기화
    clearHistoryForSnake(isAI = false) {
        const snakeType = isAI ? 'AI' : '플레이어';
        this.recentMessages.delete(snakeType);
        
        // 해당 뱀의 모든 폴백 기록도 삭제
        const keysToDelete = [];
        for (const key of this.recentFallbacks.keys()) {
            if (key.startsWith(snakeType + '_')) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.recentFallbacks.delete(key));
        
        console.log(`🗑️ [${snakeType} 뱀 기록 초기화] 해당 뱀의 메시지 기록이 제거됨`);
    }
}