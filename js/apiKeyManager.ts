type StatusType = 'success' | 'error' | 'testing';

interface ChatterInterface {
    setApiKey(key: string | null): void;
    testApiKey(key: string): Promise<{ message: string }>;
}

declare global {
    interface Window {
        game: {
            chatterProbability: number;
        };
    }
}

export class ApiKeyManager {
    private chatter: ChatterInterface;

    constructor(chatter: ChatterInterface) {
        this.chatter = chatter;
        this.setupEventListeners();
        this.initializeUI();
    }

    private setupEventListeners(): void {
        const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
        const saveButton = document.getElementById('saveApiKey') as HTMLButtonElement;
        const testButton = document.getElementById('testApiKey') as HTMLButtonElement;
        const clearButton = document.getElementById('clearApiKey') as HTMLButtonElement;
        const freqSlider = document.getElementById('chatterFreq') as HTMLInputElement;
        const freqValue = document.getElementById('freqValue') as HTMLSpanElement;
        const apiStatus = document.getElementById('apiStatus') as HTMLDivElement;
        
        // 저장 버튼 이벤트
        saveButton.addEventListener('click', () => this.handleSaveApiKey());
        
        // 테스트 버튼 이벤트
        testButton.addEventListener('click', () => this.handleTestApiKey());
        
        // 삭제 버튼 이벤트
        clearButton.addEventListener('click', () => this.handleClearApiKey());
        
        // 입력 필드 포커스 이벤트
        apiKeyInput.addEventListener('focus', () => this.handleInputFocus());
        
        // 혼잣말 빈도 슬라이더 이벤트
        freqSlider.addEventListener('input', (e) => this.handleFrequencyChange(e));
    }

    private initializeUI(): void {
        this.loadSavedApiKey();
        this.loadSavedFrequency();
    }

    private loadSavedApiKey(): void {
        const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
        const savedKey = localStorage.getItem('openai_api_key');
        if (savedKey) {
            apiKeyInput.value = savedKey.substring(0, 10) + '...';
        }
    }

    private loadSavedFrequency(): void {
        const freqSlider = document.getElementById('chatterFreq') as HTMLInputElement;
        const freqValue = document.getElementById('freqValue') as HTMLSpanElement;
        const savedFreq = localStorage.getItem('chatter_frequency') || '30';
        
        freqSlider.value = savedFreq;
        freqValue.textContent = savedFreq + '%';
        
        // 게임 객체에 빈도 설정 (전역 접근)
        if (window.game) {
            window.game.chatterProbability = parseFloat(savedFreq) / 100;
        }
    }

    private handleSaveApiKey(): void {
        const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
        const key = apiKeyInput.value.trim();
        
        if (key && key.length > 10) {
            this.chatter.setApiKey(key);
            apiKeyInput.value = key.substring(0, 10) + '...';
            alert('API 키가 저장되었습니다.');
        } else {
            alert('유효한 API 키를 입력해주세요.');
        }
    }

    private async handleTestApiKey(): Promise<void> {
        const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
        const testButton = document.getElementById('testApiKey') as HTMLButtonElement;
        const apiStatus = document.getElementById('apiStatus') as HTMLDivElement;
        const key = apiKeyInput.value.trim();
        
        if (!key || key.includes('...')) {
            this.showStatus('error', 'API 키를 입력해주세요.');
            return;
        }

        this.showStatus('testing', 'API 키 테스트 중...');
        testButton.disabled = true;

        try {
            const result = await this.chatter.testApiKey(key);
            this.showStatus('success', result.message);
        } catch (error) {
            this.showStatus('error', (error as Error).message);
        } finally {
            testButton.disabled = false;
        }
    }

    private handleClearApiKey(): void {
        const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
        
        this.chatter.setApiKey(null);
        apiKeyInput.value = '';
        this.clearStatus();
        alert('API 키가 삭제되었습니다.');
    }

    private handleInputFocus(): void {
        const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
        if (apiKeyInput.value.includes('...')) {
            apiKeyInput.value = '';
        }
    }

    private handleFrequencyChange(event: Event): void {
        const freqValue = document.getElementById('freqValue') as HTMLSpanElement;
        const value = (event.target as HTMLInputElement).value;
        
        freqValue.textContent = value + '%';
        localStorage.setItem('chatter_frequency', value);
        
        // 게임 객체에 빈도 설정 (전역 접근)
        if (window.game) {
            window.game.chatterProbability = parseFloat(value) / 100;
        }
    }

    private showStatus(type: StatusType, message: string): void {
        const apiStatus = document.getElementById('apiStatus') as HTMLDivElement;
        apiStatus.className = `api-status ${type}`;
        apiStatus.textContent = message;
    }

    private clearStatus(): void {
        const apiStatus = document.getElementById('apiStatus') as HTMLDivElement;
        apiStatus.className = '';
        apiStatus.textContent = '';
    }
}