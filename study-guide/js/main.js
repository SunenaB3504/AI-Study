// Main Application Script
document.addEventListener('DOMContentLoaded', () => {
    // Initialize modules
    if (window.progressTracker) {
        console.log('Progress Tracker initialized');
    }

    if (window.ttsManager) {
        console.log('TTS Manager initialized');
    }

    // Bind main navigation events
    bindNavigationEvents();

    // Initialize chapter-specific functionality
    initializeChapterFeatures();

    // Load saved preferences
    loadUserPreferences();
});

function bindNavigationEvents() {
    // Progress button functionality
    const progressBtn = document.getElementById('progress-btn');
    if (progressBtn) {
        progressBtn.addEventListener('click', showProgressModal);
    }

    // Chapter card click tracking
    document.querySelectorAll('.chapter-card a').forEach(link => {
        link.addEventListener('click', (e) => {
            const chapterId = e.target.closest('.chapter-card').querySelector('.status-indicator').dataset.chapter;
            trackChapterVisit(chapterId);
        });
    });
}

function initializeChapterFeatures() {
    // Add TTS buttons to content sections
    addTTSButtonsToSections();

    // Initialize progress tracking for sections
    initializeSectionTracking();

    // Add keyboard shortcuts
    bindKeyboardShortcuts();
}

function addTTSButtonsToSections() {
    // Add TTS buttons to major content sections
    const sections = document.querySelectorAll('section, .content-section, article > div');
    sections.forEach((section, index) => {
        if (section.id || section.classList.contains('content-section')) {
            const ttsBtn = document.createElement('button');
            ttsBtn.className = 'tts-section-btn bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm ml-2';
            ttsBtn.textContent = '🔊 Listen';
            ttsBtn.dataset.sectionId = section.id || `section-${index}`;

            ttsBtn.addEventListener('click', () => {
                if (window.ttsManager) {
                    const text = section.textContent || section.innerText;
                    window.ttsManager.speak(text);
                }
            });

            // Add to section header if exists
            const header = section.querySelector('h1, h2, h3, h4, h5, h6');
            if (header) {
                header.appendChild(ttsBtn);
            }
        }
    });
}

function initializeSectionTracking() {
    // Add progress tracking to sections
    const sections = document.querySelectorAll('section, .content-section');
    sections.forEach((section, index) => {
        const sectionId = section.id || `section-${index}`;
        const chapterId = getCurrentChapterId();

        // Add mark complete button
        const completeBtn = document.createElement('button');
        completeBtn.className = 'mark-complete-btn bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm ml-2';
        completeBtn.textContent = 'Mark Complete';
        completeBtn.dataset.chapter = chapterId;
        completeBtn.dataset.section = sectionId;

        // Check if already completed
        if (window.progressTracker && window.progressTracker.isSectionComplete(chapterId, sectionId)) {
            completeBtn.textContent = '✓ Completed';
            completeBtn.classList.remove('bg-blue-500');
            completeBtn.classList.add('bg-green-500');
        }

        // Add to section header
        const header = section.querySelector('h1, h2, h3, h4, h5, h6');
        if (header) {
            header.appendChild(completeBtn);
        }
    });
}

function bindKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + T: Toggle TTS
        if ((e.ctrlKey || e.metaKey) && e.key === 't') {
            e.preventDefault();
            if (window.ttsManager) {
                window.ttsManager.toggleTTS();
            }
        }

        // Space: Play/Pause TTS
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            if (window.ttsManager) {
                if (window.ttsManager.isSpeaking()) {
                    window.ttsManager.pause();
                } else {
                    window.ttsManager.play();
                }
            }
        }

        // Escape: Stop TTS
        if (e.key === 'Escape') {
            if (window.ttsManager) {
                window.ttsManager.stop();
            }
        }
    });
}

function showProgressModal() {
    // Create modal for detailed progress view
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold">Your Progress</h2>
                <button id="close-modal" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div id="progress-details">
                <!-- Progress details will be populated here -->
            </div>
            <div class="mt-4 flex gap-2">
                <button id="export-progress" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                    Export Progress
                </button>
                <button id="reset-progress" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                    Reset Progress
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Populate progress details
    const detailsEl = modal.querySelector('#progress-details');
    if (window.progressTracker) {
        const progress = window.progressTracker.exportProgress();
        detailsEl.innerHTML = `
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="text-center p-4 bg-blue-50 rounded">
                    <div class="text-2xl font-bold text-blue-600">${progress.completedChapters}</div>
                    <div class="text-gray-600">Chapters Completed</div>
                </div>
                <div class="text-center p-4 bg-green-50 rounded">
                    <div class="text-2xl font-bold text-green-600">${progress.completedSections}</div>
                    <div class="text-gray-600">Sections Completed</div>
                </div>
            </div>
            <div class="mb-4">
                <h3 class="text-lg font-semibold mb-2">Chapter Progress</h3>
                <div class="space-y-2">
                    ${Object.keys(progress.chapters).map(chapterId => `
                        <div class="flex justify-between items-center">
                            <span>Chapter ${chapterId}</span>
                            <span class="${progress.chapters[chapterId] ? 'text-green-600' : 'text-gray-400'}">
                                ${progress.chapters[chapterId] ? '✓' : '○'}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Bind modal events
    modal.querySelector('#close-modal').addEventListener('click', () => {
        modal.remove();
    });

    modal.querySelector('#export-progress').addEventListener('click', () => {
        exportProgress();
    });

    modal.querySelector('#reset-progress').addEventListener('click', () => {
        if (window.progressTracker) {
            window.progressTracker.resetProgress();
        }
        modal.remove();
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function exportProgress() {
    if (!window.progressTracker) return;

    const progress = window.progressTracker.exportProgress();
    const dataStr = JSON.stringify(progress, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = 'study-guide-progress.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function trackChapterVisit(chapterId) {
    // Track when user visits a chapter
    if (window.progressTracker) {
        // Mark as in progress if not completed
        if (!window.progressTracker.isChapterComplete(chapterId)) {
            // Could add in-progress tracking here
        }
    }
}

function getCurrentChapterId() {
    // Extract chapter ID from URL or page content
    const path = window.location.pathname;
    const match = path.match(/chapter(\d+)/);
    return match ? match[1] : '1';
}

function loadUserPreferences() {
    // Load user preferences from localStorage
    const preferences = JSON.parse(localStorage.getItem('study-guide-preferences') || '{}');

    // Apply TTS settings
    if (preferences.tts && window.ttsManager) {
        if (preferences.tts.enabled) {
            window.ttsManager.isEnabled = true;
            document.getElementById('tts-toggle').textContent = '🔊 TTS Enabled';
            document.getElementById('tts-toggle').classList.remove('bg-green-500');
            document.getElementById('tts-toggle').classList.add('bg-red-500');
        }
        if (preferences.tts.rate) window.ttsManager.setRate(preferences.tts.rate);
        if (preferences.tts.pitch) window.ttsManager.setPitch(preferences.tts.pitch);
    }
}

function saveUserPreferences() {
    // Save user preferences to localStorage
    const preferences = {
        tts: {
            enabled: window.ttsManager ? window.ttsManager.isEnabled : false,
            rate: window.ttsManager ? window.ttsManager.rate : 1,
            pitch: window.ttsManager ? window.ttsManager.pitch : 1
        }
    };

    localStorage.setItem('study-guide-preferences', JSON.stringify(preferences));
}

// Save preferences before page unload
window.addEventListener('beforeunload', saveUserPreferences);

// Utility functions
function debounce(func, wait) {
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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}