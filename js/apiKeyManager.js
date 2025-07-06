export class ApiKeyManager {
    constructor(chatter) {
        this.chatter = chatter;
        this.setupEventListeners();
        this.initializeUI();
    }

    setupEventListeners() {
        const apiKeyInput = document.getElementById('apiKey');
        const saveButton = document.getElementById('saveApiKey');
        const testButton = document.getElementById('testApiKey');
        const clearButton = document.getElementById('clearApiKey');
        const freqSlider = document.getElementById('chatterFreq');
        const freqValue = document.getElementById('freqValue');
        const apiStatus = document.getElementById('apiStatus');
        
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

    initializeUI() {
        this.loadSavedApiKey();
        this.loadSavedFrequency();
    }

    loadSavedApiKey() {
        const apiKeyInput = document.getElementById('apiKey');
        const savedKey = localStorage.getItem('openai_api_key');
        if (savedKey) {
            apiKeyInput.value = savedKey.substring(0, 10) + '...';
        }
    }

    loadSavedFrequency() {
        const freqSlider = document.getElementById('chatterFreq');
        const freqValue = document.getElementById('freqValue');
        const savedFreq = localStorage.getItem('chatter_frequency') || 30;
        
        freqSlider.value = savedFreq;
        freqValue.textContent = savedFreq + '%';
        
        // 게임 객체에 빈도 설정 (전역 접근)
        if (window.game) {
            window.game.chatterProbability = parseFloat(savedFreq) / 100;
        }
    }

    handleSaveApiKey() {
        const apiKeyInput = document.getElementById('apiKey');
        const key = apiKeyInput.value.trim();
        
        if (key && key.length > 10) {
            this.chatter.setApiKey(key);
            apiKeyInput.value = key.substring(0, 10) + '...';
            alert('API 키가 저장되었습니다.');
        } else {
            alert('유효한 API 키를 입력해주세요.');
        }
    }

    async handleTestApiKey() {
        const apiKeyInput = document.getElementById('apiKey');
        const testButton = document.getElementById('testApiKey');
        const apiStatus = document.getElementById('apiStatus');
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
            this.showStatus('error', error.message);
        } finally {
            testButton.disabled = false;
        }
    }

    handleClearApiKey() {
        const apiKeyInput = document.getElementById('apiKey');
        
        this.chatter.setApiKey(null);
        apiKeyInput.value = '';
        this.clearStatus();
        alert('API 키가 삭제되었습니다.');
    }

    handleInputFocus() {
        const apiKeyInput = document.getElementById('apiKey');
        if (apiKeyInput.value.includes('...')) {
            apiKeyInput.value = '';
        }
    }

    handleFrequencyChange(event) {
        const freqValue = document.getElementById('freqValue');
        const value = event.target.value;
        
        freqValue.textContent = value + '%';
        localStorage.setItem('chatter_frequency', value);
        
        // 게임 객체에 빈도 설정 (전역 접근)
        if (window.game) {
            window.game.chatterProbability = parseFloat(value) / 100;
        }
    }

    showStatus(type, message) {
        const apiStatus = document.getElementById('apiStatus');
        apiStatus.className = `api-status ${type}`;
        apiStatus.textContent = message;
    }

    clearStatus() {
        const apiStatus = document.getElementById('apiStatus');
        apiStatus.className = '';
        apiStatus.textContent = '';
    }
}