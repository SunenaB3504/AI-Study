// Text-to-Speech Module
class TTSManager {
    constructor() {
        this.synth = window.speechSynthesis;
        this.isEnabled = false;
        this.currentUtterance = null;
        this.isPlaying = false;
        this.isPaused = false;
        this.voice = null;
        this.rate = 1;
        this.pitch = 1;
        this.volume = 1;
        this.currentText = '';
        this.currentPosition = 0;
        this.init();
    }

    init() {
        // Check if TTS is supported
        if (!this.synth) {
            console.warn('Text-to-speech is not supported in this browser');
            return;
        }

        // Load available voices
        this.loadVoices();

        // Set up voice loading event
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }

        this.bindEvents();
    }

    loadVoices() {
        const voices = this.synth.getVoices();
        // Prefer English voices
        this.voice = voices.find(voice => voice.lang.startsWith('en')) || voices[0];
    }

    bindEvents() {
        // TTS toggle button
        const ttsToggle = document.getElementById('tts-toggle');
        if (ttsToggle) {
            ttsToggle.addEventListener('click', () => this.toggleTTS());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!this.isEnabled) return;

            // Ctrl+T: Toggle TTS
            if (e.ctrlKey && e.key === 't') {
                e.preventDefault();
                this.toggleTTS();
            }

            // Space: Play/Pause
            if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                if (this.isPlaying) {
                    this.pause();
                } else {
                    this.play();
                }
            }

            // Escape: Stop
            if (e.key === 'Escape') {
                e.preventDefault();
                this.stop();
            }
        });

        // Add TTS controls to page
        this.createTTSControls();
    }

    toggleTTS() {
        this.isEnabled = !this.isEnabled;
        const button = document.getElementById('tts-toggle');

        if (this.isEnabled) {
            button.textContent = '🔊 TTS Enabled';
            button.classList.remove('bg-green-500');
            button.classList.add('bg-red-500');
            this.showTTSControls();
        } else {
            button.textContent = '🔊 Enable TTS';
            button.classList.remove('bg-red-500');
            button.classList.add('bg-green-500');
            this.stop();
            this.hideTTSControls();
        }
        this.updateButtonStates();
    }

    createTTSControls() {
        const controls = document.createElement('div');
        controls.id = 'tts-controls';
        controls.className = 'tts-controls hidden fixed top-20 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50';
        controls.innerHTML = `
            <div class="flex flex-col gap-3 min-w-64">
                <div class="flex items-center justify-between">
                    <h3 class="font-semibold text-gray-800">TTS Controls</h3>
                    <button id="tts-close" class="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
                </div>

                <div class="flex gap-2">
                    <button id="tts-play" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm flex-1">
                        ▶️ Play
                    </button>
                    <button id="tts-pause" class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded text-sm flex-1">
                        ⏸️ Pause
                    </button>
                    <button id="tts-stop" class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm flex-1">
                        ⏹️ Stop
                    </button>
                </div>

                <div class="space-y-2">
                    <div class="flex gap-2 items-center">
                        <label class="text-sm text-gray-600 min-w-12">Speed:</label>
                        <input type="range" id="tts-rate" min="0.5" max="2" step="0.1" value="1" class="flex-1">
                        <span id="rate-value" class="text-sm text-gray-600 min-w-8">1x</span>
                    </div>
                    <div class="flex gap-2 items-center">
                        <label class="text-sm text-gray-600 min-w-12">Pitch:</label>
                        <input type="range" id="tts-pitch" min="0" max="2" step="0.1" value="1" class="flex-1">
                        <span id="pitch-value" class="text-sm text-gray-600 min-w-8">1</span>
                    </div>
                </div>

                <div class="border-t pt-2">
                    <h4 class="text-sm font-semibold text-gray-700 mb-1">Keyboard Shortcuts:</h4>
                    <div class="text-xs text-gray-600 space-y-1">
                        <div><kbd class="bg-gray-100 px-1 rounded">Ctrl+T</kbd> Toggle TTS</div>
                        <div><kbd class="bg-gray-100 px-1 rounded">Space</kbd> Play/Pause</div>
                        <div><kbd class="bg-gray-100 px-1 rounded">Esc</kbd> Stop</div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(controls);
        this.bindTTSControlEvents();
    }

    bindTTSControlEvents() {
        const playBtn = document.getElementById('tts-play');
        const pauseBtn = document.getElementById('tts-pause');
        const stopBtn = document.getElementById('tts-stop');
        const closeBtn = document.getElementById('tts-close');
        const rateInput = document.getElementById('tts-rate');
        const pitchInput = document.getElementById('tts-pitch');
        const rateValue = document.getElementById('rate-value');
        const pitchValue = document.getElementById('pitch-value');

        if (playBtn) {
            playBtn.addEventListener('click', () => this.play());
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pause());
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stop());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideTTSControls());
        }

        if (rateInput) {
            rateInput.addEventListener('input', (e) => {
                this.rate = parseFloat(e.target.value);
                rateValue.textContent = this.rate + 'x';
                if (this.currentUtterance) {
                    this.currentUtterance.rate = this.rate;
                }
            });
        }

        if (pitchInput) {
            pitchInput.addEventListener('input', (e) => {
                this.pitch = parseFloat(e.target.value);
                pitchValue.textContent = this.pitch.toFixed(1);
                if (this.currentUtterance) {
                    this.currentUtterance.pitch = this.pitch;
                }
            });
        }

        // Initialize button states
        this.updateButtonStates();
    }

    showTTSControls() {
        const controls = document.getElementById('tts-controls');
        if (controls) {
            controls.classList.remove('hidden');
            controls.classList.add('animate-fade-in');
        }
    }

    hideTTSControls() {
        const controls = document.getElementById('tts-controls');
        if (controls) {
            controls.classList.add('hidden');
            controls.classList.remove('animate-fade-in');
        }
    }

    speak(text, options = {}) {
        if (!this.isEnabled || !this.synth) return;

        // Stop any current speech
        this.stop();

        this.currentUtterance = new SpeechSynthesisUtterance(text);

        // Apply settings
        this.currentUtterance.voice = this.voice;
        this.currentUtterance.rate = this.rate;
        this.currentUtterance.pitch = this.pitch;
        this.currentUtterance.volume = this.volume;

        // Apply options
        if (options.lang) this.currentUtterance.lang = options.lang;
        if (options.onstart) this.currentUtterance.onstart = options.onstart;
        if (options.onend) this.currentUtterance.onend = options.onend;
        if (options.onerror) this.currentUtterance.onerror = options.onerror;

        // Default event handlers
        this.currentUtterance.onstart = () => {
            this.isPlaying = true;
            this.isPaused = false;
            this.updateButtonStates();
            if (options.onstart) options.onstart();
        };

        this.currentUtterance.onend = () => {
            this.isPlaying = false;
            this.isPaused = false;
            this.updateButtonStates();
            if (options.onend) options.onend();
        };

        this.currentUtterance.onpause = () => {
            this.isPaused = true;
            this.isPlaying = false;
            this.updateButtonStates();
        };

        this.currentUtterance.onresume = () => {
            this.isPlaying = true;
            this.isPaused = false;
            this.updateButtonStates();
        };

        this.currentUtterance.onerror = (error) => {
            this.isPlaying = false;
            this.isPaused = false;
            this.updateButtonStates();
            console.error('TTS Error:', error);
            if (options.onerror) options.onerror(error);
        };

        this.synth.speak(this.currentUtterance);
    }

    play() {
        if (this.isPaused && this.currentText) {
            // Resume from pause
            this.resume();
        } else {
            // Start new speech
            const content = this.getPageContent();
            if (content) {
                this.currentText = content;
                this.currentPosition = 0;
                this.speak(this.currentText);
            }
        }
        this.updateButtonStates();
    }

    pause() {
        if (this.synth.speaking && !this.synth.paused) {
            this.synth.pause();
            this.isPaused = true;
            this.isPlaying = false;
        }
        this.updateButtonStates();
    }

    stop() {
        if (this.synth.speaking || this.synth.paused) {
            this.synth.cancel();
            this.isPlaying = false;
            this.isPaused = false;
            this.currentPosition = 0;
        }
        this.updateButtonStates();
    }

    resume() {
        if (this.synth.paused) {
            this.synth.resume();
            this.isPaused = false;
            this.isPlaying = true;
        }
        this.updateButtonStates();
    }

    updateButtonStates() {
        const playBtn = document.getElementById('tts-play');
        const pauseBtn = document.getElementById('tts-pause');
        const stopBtn = document.getElementById('tts-stop');

        if (!playBtn || !pauseBtn || !stopBtn) return;

        // Reset all buttons
        playBtn.disabled = false;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;

        if (this.isPlaying) {
            playBtn.textContent = '▶️ Playing';
            playBtn.classList.add('bg-green-500');
            playBtn.classList.remove('bg-blue-500');
            pauseBtn.textContent = '⏸️ Pause';
        } else if (this.isPaused) {
            playBtn.textContent = '▶️ Resume';
            playBtn.classList.add('bg-green-500');
            playBtn.classList.remove('bg-blue-500');
            pauseBtn.textContent = '⏸️ Paused';
            pauseBtn.disabled = true;
        } else {
            playBtn.textContent = '▶️ Play';
            playBtn.classList.remove('bg-green-500');
            playBtn.classList.add('bg-blue-500');
            pauseBtn.textContent = '⏸️ Pause';
            pauseBtn.disabled = true;
        }

        stopBtn.disabled = !this.isPlaying && !this.isPaused;
    }

    getPageContent() {
        // Get main content from the page
        const mainContent = document.querySelector('main') ||
                           document.querySelector('.content') ||
                           document.querySelector('article') ||
                           document.body;

        if (!mainContent) return '';

        // Remove script tags and other non-content elements
        const content = mainContent.cloneNode(true);
        const scripts = content.querySelectorAll('script, style, nav, header, footer, .tts-controls');
        scripts.forEach(script => script.remove());

        // Get text content
        return content.textContent || content.innerText || '';
    }

    speakSection(sectionId) {
        const section = document.getElementById(sectionId) || document.querySelector(sectionId);
        if (section) {
            const text = section.textContent || section.innerText;
            this.speak(text);
        }
    }

    isSpeaking() {
        return this.isPlaying;
    }

    getVoices() {
        return this.synth.getVoices();
    }

    setVoice(voice) {
        this.voice = voice;
    }

    setRate(rate) {
        this.rate = Math.max(0.1, Math.min(10, rate));
    }

    setPitch(pitch) {
        this.pitch = Math.max(0, Math.min(2, pitch));
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
}

// Initialize TTS when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ttsManager = new TTSManager();
});