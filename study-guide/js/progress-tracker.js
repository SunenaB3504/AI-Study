// Progress Tracker Module
class ProgressTracker {
    constructor() {
        this.storageKey = 'study-guide-progress';
        this.progress = this.loadProgress();
        this.init();
    }

    init() {
        this.updateUI();
        this.bindEvents();
    }

    loadProgress() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : {
            chapters: {},
            sections: {},
            totalChapters: 23,
            totalSections: 0
        };
    }

    saveProgress() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
    }

    markChapterComplete(chapterId, completed = true) {
        this.progress.chapters[chapterId] = completed;
        this.saveProgress();
        this.updateUI();
    }

    markSectionComplete(chapterId, sectionId, completed = true) {
        if (!this.progress.sections[chapterId]) {
            this.progress.sections[chapterId] = {};
        }
        this.progress.sections[chapterId][sectionId] = completed;
        this.saveProgress();
        this.updateUI();
    }

    isChapterComplete(chapterId) {
        return this.progress.chapters[chapterId] === true;
    }

    isSectionComplete(chapterId, sectionId) {
        return this.progress.sections[chapterId]?.[sectionId] === true;
    }

    getCompletedChaptersCount() {
        return Object.values(this.progress.chapters).filter(Boolean).length;
    }

    getCompletedSectionsCount() {
        let count = 0;
        Object.values(this.progress.sections).forEach(chapter => {
            count += Object.values(chapter).filter(Boolean).length;
        });
        return count;
    }

    getTotalSectionsCount() {
        let count = 0;
        Object.values(this.progress.sections).forEach(chapter => {
            count += Object.keys(chapter).length;
        });
        return count;
    }

    getOverallProgress() {
        const completedChapters = this.getCompletedChaptersCount();
        const totalChapters = this.progress.totalChapters;
        return Math.round((completedChapters / totalChapters) * 100);
    }

    updateUI() {
        // Update main page progress
        const chaptersReadEl = document.getElementById('chapters-read');
        const sectionsCompletedEl = document.getElementById('sections-completed');
        const progressPercentageEl = document.getElementById('progress-percentage');
        const progressBarEl = document.getElementById('progress-bar');

        if (chaptersReadEl) {
            chaptersReadEl.textContent = this.getCompletedChaptersCount();
        }

        if (sectionsCompletedEl) {
            sectionsCompletedEl.textContent = this.getCompletedSectionsCount();
        }

        if (progressPercentageEl) {
            progressPercentageEl.textContent = this.getOverallProgress() + '%';
        }

        if (progressBarEl) {
            progressBarEl.style.width = this.getOverallProgress() + '%';
        }

        // Update chapter status indicators
        document.querySelectorAll('.status-indicator').forEach(indicator => {
            const chapterId = indicator.dataset.chapter;
            const isComplete = this.isChapterComplete(chapterId);

            indicator.classList.remove('completed', 'in-progress');
            if (isComplete) {
                indicator.classList.add('completed');
            }
        });
    }

    bindEvents() {
        // Bind events for chapter pages
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('mark-complete-btn')) {
                const chapterId = e.target.dataset.chapter;
                const sectionId = e.target.dataset.section;
                const completed = !this.isSectionComplete(chapterId, sectionId);

                this.markSectionComplete(chapterId, sectionId, completed);
                e.target.textContent = completed ? '✓ Completed' : 'Mark Complete';
                e.target.classList.toggle('bg-green-500', completed);
                e.target.classList.toggle('bg-blue-500', !completed);
            }
        });
    }

    exportProgress() {
        return {
            ...this.progress,
            completedChapters: this.getCompletedChaptersCount(),
            completedSections: this.getCompletedSectionsCount(),
            overallProgress: this.getOverallProgress()
        };
    }

    resetProgress() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            this.progress = {
                chapters: {},
                sections: {},
                totalChapters: 23,
                totalSections: 0
            };
            this.saveProgress();
            this.updateUI();
        }
    }
}

// Initialize progress tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.progressTracker = new ProgressTracker();
});