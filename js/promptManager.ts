// 프롬프트 및 폴백 메시지 관리 클래스
export class PromptManager {
    private prompts: { [key: string]: string };
    private fallbackTexts: { [key: string]: string[] };

    constructor() {
        this.prompts = {};
        this.fallbackTexts = {};
        this.initializePrompts();
        this.initializeFallbackTexts();
    }

    // 상황별 프롬프트 초기화
    private initializePrompts(): void {
        this.prompts = {
            hunting: "음식을 찾는 상황입니다. 배고픔을 표현하는 인터넷 커뮤니티 스타일 혼잣말을 하세요. 예시: ㅇㄱㄹㅇ배고픔, 먹방가즈아, 간식ㄱㄱ",
            eating: "음식을 먹는 중입니다. 맛있다는 기쁨을 인터넷 밈으로 표현하는 혼잣말을 하세요. 예시: ㅗㅜㅑ맛있어, 개꿀맛ㅋㅋ, 존맛탱",
            danger: "위험한 상황입니다. 당황하는 감정을 인터넷 용어로 표현하는 혼잣말을 하세요. 예시: ㅁㅊ위험해, 망했다ㅋㅋ, 헐위험",
            idle: "심심한 상황입니다. 지루함을 표현하는 인터넷 용어 혼잣말을 하세요. 예시: ㅇㅇ지루해, 뭐하지ㅋㅋ, 심심하네",
            competitive: "경쟁 상황입니다. 도전적인 감정을 인터넷 용어로 표현하는 혼잣말을 하세요. 예시: ㄱㄱ싸자, 내가이김ㅋ, 덤벼라",
            ai_hunting: "AI 뱀이 음식을 탐색중입니다. 논리적이고 체계적인 혼잣말을 하세요. 예시: 경로계산중, 타겟스캔, 최적화필요",
            ai_eating: "AI 뱀이 음식을 섭취했습니다. 효율성에 대한 논리적 혼잣말을 하세요. 예시: 효율성증가, 에너지충전, 성능향상",
            ai_danger: "AI 뱀이 위험을 감지했습니다. 냉정한 분석적 혼잣말을 하세요. 예시: 위험감지됨, 회피필요, 재계산중"
        };
    }

    // 폴백 텍스트 초기화
    private initializeFallbackTexts(): void {
        this.fallbackTexts = {
            hunting: [
                "ㅇㄱㄹㅇ 배고픔", "먹방가즈아", "사과 ㅊㅊ", "배고파죽겠네", "간식 어딨지ㅋ", 
                "냠냠타임", "꿀조합 찾자", "먹부림ㅋㅋ", "배고프다진짜", "음식 ㄱㄱ"
            ],
            eating: [
                "ㅗㅜㅑ 맛있어", "개맛있네ㅋㅋ", "꿀맛이네", "존맛탱", "더줘ㅋㅋ", 
                "극락이다", "맛도리", "굿굿", "개존맛", "꿀빰"
            ],
            danger: [
                "ㅁㅊ위험해", "아 시발", "어우야", "망했다ㅋㅋ", "죽겠네", 
                "헐 위험", "도망가자", "아니야;;", "진짜위험", "사고뻔함"
            ],
            idle: [
                "ㅇㅇ지루해", "뭐하지ㅋㅋ", "심심하네", "날씨조타", "여유롭네", 
                "힐링타임", "피곤해", "한가하다", "평온함", "졸려죽겠어"
            ],
            competitive: [
                "ㄱㄱ싸자", "내가이김ㅋ", "덤벼라", "이길거야", "지지않아", 
                "1등각", "넘파이팅", "빨리가자", "대결이다", "승부욕ㅋ"
            ],
            ai_hunting: [
                "경로 계산 중", "최적화 필요", "타겟 스캔", "분석 중", "탐색 알고리즘", 
                "거리 측정", "패턴 분석", "최단경로", "목표 설정", "데이터 처리", 
                "좌표 계산", "효율 검토", "시스템 스캔", "정보 수집", "루트 탐색"
            ],
            ai_eating: [
                "효율성 증가", "에너지 충전", "성능 향상", "데이터 수집", "연산 최적화", 
                "시스템 업그레이드", "배터리 보충", "메모리 확장", "처리속도 증가", "알고리즘 개선", 
                "코어 강화", "네트워크 향상", "부스트 모드", "터보 충전", "파워 업"
            ],
            ai_danger: [
                "위험 감지됨", "회피 필요", "안전 모드", "재계산 중", "충돌 경고", 
                "리스크 분석", "방어 시스템", "긴급 회피", "안전 프로토콜", "위험도 측정", 
                "보안 모드", "대피 경로", "경고 신호", "방어막 활성", "비상 모드"
            ]
        };
    }

    // 프롬프트 가져오기
    getPrompt(situation: string, isAI: boolean = false): string {
        const promptKey = isAI ? `ai_${situation}` : situation;
        return this.prompts[promptKey] || this.prompts.idle;
    }

    // 폴백 텍스트 목록 가져오기
    getFallbackTexts(situation: string, isAI: boolean = false): string[] {
        const key = isAI ? `ai_${situation}` : situation;
        return this.fallbackTexts[key] || this.fallbackTexts.idle;
    }

    // 랜덤 폴백 텍스트 선택
    getRandomFallbackText(situation: string, isAI: boolean = false): string {
        const texts = this.getFallbackTexts(situation, isAI);
        return texts[Math.floor(Math.random() * texts.length)];
    }

    // 특정 폴백 텍스트 제외하고 선택
    getRandomFallbackTextExcluding(situation: string, excludeTexts: string[] = [], isAI: boolean = false): string {
        const allTexts = this.getFallbackTexts(situation, isAI);
        const availableTexts = allTexts.filter(text => !excludeTexts.includes(text));
        
        // 사용 가능한 텍스트가 없으면 전체에서 선택
        const selectedTexts = availableTexts.length > 0 ? availableTexts : allTexts;
        
        return selectedTexts[Math.floor(Math.random() * selectedTexts.length)];
    }

    // 새 프롬프트 추가
    addPrompt(key: string, promptText: string): void {
        this.prompts[key] = promptText;
        console.log(`📝 [프롬프트 추가] ${key}: ${promptText}`);
    }

    // 새 폴백 텍스트 추가
    addFallbackText(situation: string, newTexts: string | string[], isAI: boolean = false): void {
        const key = isAI ? `ai_${situation}` : situation;
        
        if (!this.fallbackTexts[key]) {
            this.fallbackTexts[key] = [];
        }
        
        if (Array.isArray(newTexts)) {
            this.fallbackTexts[key].push(...newTexts);
        } else {
            this.fallbackTexts[key].push(newTexts);
        }
        
        console.log(`📝 [폴백 텍스트 추가] ${key}: ${Array.isArray(newTexts) ? newTexts.length : 1}개 추가`);
    }

    // 프롬프트 업데이트
    updatePrompt(key: string, newPromptText: string): boolean {
        if (this.prompts[key]) {
            const oldPrompt = this.prompts[key];
            this.prompts[key] = newPromptText;
            console.log(`📝 [프롬프트 업데이트] ${key}: "${oldPrompt}" → "${newPromptText}"`);
            return true;
        }
        return false;
    }

    // 사용 가능한 상황 목록 반환
    getAvailableSituations(): string[] {
        const situations = new Set<string>();
        
        Object.keys(this.prompts).forEach(key => {
            if (key.startsWith('ai_')) {
                situations.add(key.replace('ai_', ''));
            } else {
                situations.add(key);
            }
        });
        
        return Array.from(situations);
    }

    // 특정 상황의 폴백 텍스트 개수 반환
    getFallbackTextCount(situation: string, isAI: boolean = false): number {
        const texts = this.getFallbackTexts(situation, isAI);
        return texts.length;
    }

    // 모든 상황의 통계 정보 반환
    getStats(): {
        totalPrompts: number;
        totalSituations: number;
        situationStats: { [key: string]: any };
    } {
        const situations = this.getAvailableSituations();
        const stats = {
            totalPrompts: Object.keys(this.prompts).length,
            totalSituations: situations.length,
            situationStats: {} as { [key: string]: any }
        };
        
        situations.forEach(situation => {
            stats.situationStats[situation] = {
                playerFallbackCount: this.getFallbackTextCount(situation, false),
                aiFallbackCount: this.getFallbackTextCount(situation, true),
                hasPrompt: !!this.prompts[situation],
                hasAiPrompt: !!this.prompts[`ai_${situation}`]
            };
        });
        
        return stats;
    }

    // 설정을 JSON으로 내보내기
    exportConfig(): { prompts: { [key: string]: string }; fallbackTexts: { [key: string]: string[] } } {
        return {
            prompts: { ...this.prompts },
            fallbackTexts: { ...this.fallbackTexts }
        };
    }

    // JSON 설정 가져오기
    importConfig(config: { prompts?: { [key: string]: string }; fallbackTexts?: { [key: string]: string[] } }): void {
        if (config.prompts) {
            this.prompts = { ...config.prompts };
        }
        if (config.fallbackTexts) {
            this.fallbackTexts = { ...config.fallbackTexts };
        }
        console.log('📝 [설정 가져오기] 프롬프트 및 폴백 텍스트가 업데이트됨');
    }

    // 설정 초기화
    resetToDefaults(): void {
        this.initializePrompts();
        this.initializeFallbackTexts();
        console.log('📝 [설정 초기화] 기본 설정으로 복원됨');
    }
}