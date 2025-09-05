// Chapter-specific functionality
class ChapterManager {
    constructor() {
        this.currentChapter = this.getCurrentChapter();
        this.progressTracker = new ProgressTracker();
        this.tts = new TTS();
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateReadingProgress();
        this.loadChapterProgress();
    }

    getCurrentChapter() {
        const path = window.location.pathname;
        const match = path.match(/chapter(\d+)\.html/);
        return match ? parseInt(match[1]) : 1;
    }

    bindEvents() {
        // TTS toggle
        const ttsToggle = document.getElementById('tts-toggle');
        if (ttsToggle) {
            ttsToggle.addEventListener('click', () => {
                if (this.tts.isEnabled) {
                    this.tts.disable();
                    ttsToggle.textContent = '🔊 Enable TTS';
                    ttsToggle.className = 'bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors';
                } else {
                    this.tts.enable();
                    ttsToggle.textContent = '🔇 Disable TTS';
                    ttsToggle.className = 'bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors';
                }
            });
        }

        // Mark chapter complete
        const markCompleteBtn = document.getElementById('mark-chapter-complete');
        if (markCompleteBtn) {
            markCompleteBtn.addEventListener('click', () => {
                this.markChapterComplete();
            });
        }

        // Track reading progress
        window.addEventListener('scroll', this.debounce(() => {
            this.updateReadingProgress();
        }, 100));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 't':
                        e.preventDefault();
                        this.tts.toggle();
                        break;
                    case 'm':
                        e.preventDefault();
                        this.markChapterComplete();
                        break;
                }
            }
        });
    }

    updateReadingProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;

        const progressElement = document.getElementById('reading-progress');
        if (progressElement) {
            progressElement.textContent = Math.round(scrollPercent) + '%';
        }

        // Update progress in localStorage
        this.progressTracker.updateChapterProgress(this.currentChapter, scrollPercent);
    }

    loadChapterProgress() {
        const progress = this.progressTracker.getChapterProgress(this.currentChapter);
        if (progress > 0) {
            // Scroll to last read position
            const scrollPosition = (progress / 100) * (document.documentElement.scrollHeight - window.innerHeight);
            window.scrollTo(0, scrollPosition);
        }
    }

    markChapterComplete() {
        this.progressTracker.markChapterComplete(this.currentChapter);

        // Update button
        const markCompleteBtn = document.getElementById('mark-chapter-complete');
        if (markCompleteBtn) {
            markCompleteBtn.textContent = '✓ Chapter Complete';
            markCompleteBtn.className = 'bg-gray-500 text-white px-4 py-2 rounded-lg cursor-not-allowed';
            markCompleteBtn.disabled = true;
        }

        // Show success message
        this.showNotification('Chapter marked as complete!', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${
            type === 'success' ? 'bg-green-500' : 'bg-blue-500'
        }`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChapterManager();
});