/**
 * Media Tab — Digital Album
 * Upload photos/videos, smooth auto-advancing slideshow with calm crossfade + Ken Burns,
 * mute toggle, prev/next. Uses requestAnimationFrame-safe timers.
 */
export class MediaManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.mediaFiles = []; // { type: 'image'|'video', url, name }
        this.currentIndex = -1;
        this.slideTimer = null;
        this.slideshowDelay = 6000;
        this.isMuted = true;
        this.isPlaying = false;
        this.shuffledOrder = [];
        this.transitioning = false;

        this.init();
    }

    init() {
        this.renderUploadArea();
        this.setupControls();
    }

    renderUploadArea() {
        const uploadArea = document.createElement('div');
        uploadArea.className = 'media-upload-area';
        uploadArea.id = 'media-upload-area';
        uploadArea.innerHTML = `
            <div class="upload-icon">🖼️</div>
            <h3>Digital Album</h3>
            <p>Add photos and videos to create a beautiful slideshow</p>
            <button class="upload-btn" id="media-add-btn">+ Add Media</button>
            <input type="file" id="media-file-input" accept="image/*,video/*" multiple style="display:none;">
        `;

        this.slideshowEl = document.createElement('div');
        this.slideshowEl.className = 'slideshow-container';
        this.slideshowEl.id = 'slideshow-container';
        this.slideshowEl.style.display = 'none';

        this.container.querySelector('#media-content')?.remove();
        const wrapper = document.createElement('div');
        wrapper.id = 'media-content';
        wrapper.style.cssText = 'width:100%;height:100%;position:relative;display:flex;justify-content:center;align-items:center;';
        wrapper.appendChild(uploadArea);
        wrapper.appendChild(this.slideshowEl);

        this.container.insertBefore(wrapper, this.container.querySelector('.controls-overlay'));
    }

    setupControls() {
        const controls = document.getElementById('media-controls');
        if (!controls) return;

        controls.innerHTML = `
            <button id="media-upload-more" title="Add more">+ Add</button>
            <button id="media-play-btn" title="Play/Pause">▶ Play</button>
            <button id="media-prev-slide" title="Previous">◀</button>
            <span class="media-file-count" id="media-count">0 files</span>
            <button id="media-next-slide" title="Next">▶</button>
            <button id="media-mute-btn" title="Toggle audio">🔇 Muted</button>
        `;

        document.getElementById('media-add-btn')?.addEventListener('click', () => document.getElementById('media-file-input')?.click());
        document.getElementById('media-upload-more')?.addEventListener('click', () => document.getElementById('media-file-input')?.click());
        document.getElementById('media-file-input')?.addEventListener('change', (e) => this.handleFileUpload(e.target.files));
        document.getElementById('media-play-btn')?.addEventListener('click', () => this.toggleSlideshow());
        document.getElementById('media-prev-slide')?.addEventListener('click', () => this.prevSlide());
        document.getElementById('media-next-slide')?.addEventListener('click', () => this.nextSlide());
        document.getElementById('media-mute-btn')?.addEventListener('click', () => this.toggleMute());
    }

    handleFileUpload(files) {
        if (!files || files.length === 0) return;

        for (const file of files) {
            const url = URL.createObjectURL(file);
            const type = file.type.startsWith('video') ? 'video' : 'image';
            this.mediaFiles.push({ type, url, name: file.name });
        }

        this.updateCount();
        this.shuffleOrder();

        if (this.mediaFiles.length > 0 && this.currentIndex === -1) {
            this.showSlideshow();
            this.showSlide(0);
        }
    }

    updateCount() {
        const el = document.getElementById('media-count');
        if (el) el.textContent = `${this.mediaFiles.length} file${this.mediaFiles.length !== 1 ? 's' : ''}`;
    }

    shuffleOrder() {
        this.shuffledOrder = [...Array(this.mediaFiles.length).keys()];
        for (let i = this.shuffledOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.shuffledOrder[i], this.shuffledOrder[j]] = [this.shuffledOrder[j], this.shuffledOrder[i]];
        }
    }

    showSlideshow() {
        const uploadArea = document.getElementById('media-upload-area');
        if (uploadArea) uploadArea.style.display = 'none';
        this.slideshowEl.style.display = 'block';
    }

    /**
     * Show a slide with smooth crossfade. Prevents overlapping transitions.
     */
    showSlide(shuffledIdx) {
        if (this.mediaFiles.length === 0 || this.transitioning) return;
        this.transitioning = true;

        const fileIdx = this.shuffledOrder[shuffledIdx % this.shuffledOrder.length];
        const media = this.mediaFiles[fileIdx];
        this.currentIndex = shuffledIdx % this.shuffledOrder.length;

        const existingSlides = Array.from(this.slideshowEl.querySelectorAll('.slideshow-slide'));

        // Create new slide
        const slide = document.createElement('div');
        slide.className = 'slideshow-slide';

        if (media.type === 'image') {
            const img = document.createElement('img');
            img.src = media.url;
            img.alt = media.name;
            img.draggable = false;
            // Wait for image to load before showing
            img.onload = () => this._fadeInSlide(slide, existingSlides);
            img.onerror = () => {
                this.transitioning = false;
                this.nextSlide();
            };
            slide.appendChild(img);
        } else {
            const video = document.createElement('video');
            video.src = media.url;
            video.autoplay = true;
            video.loop = true;
            video.muted = this.isMuted;
            video.playsInline = true;
            video.onloadeddata = () => this._fadeInSlide(slide, existingSlides);
            video.onerror = () => {
                this.transitioning = false;
                this.nextSlide();
            };
            slide.appendChild(video);
        }

        this.slideshowEl.appendChild(slide);

        // Fallback: if media doesn't fire load event within 3s, force it
        setTimeout(() => {
            if (!slide.classList.contains('active')) {
                this._fadeInSlide(slide, existingSlides);
            }
        }, 3000);
    }

    _fadeInSlide(newSlide, oldSlides) {
        if (newSlide.classList.contains('active')) return; // Already done

        // Fade in new slide
        requestAnimationFrame(() => {
            newSlide.classList.add('active');
        });

        // Fade out and remove old slides after transition completes
        oldSlides.forEach(s => {
            s.classList.add('fading-out');
            // Stop videos on old slides
            s.querySelectorAll('video').forEach(v => { v.pause(); v.src = ''; });
        });

        // Cleanup old slides after crossfade (2.5s)
        setTimeout(() => {
            oldSlides.forEach(s => {
                if (s.parentNode) s.remove();
            });
            this.transitioning = false;
        }, 2500);
    }

    nextSlide() {
        if (this.mediaFiles.length === 0 || this.transitioning) return;
        const next = (this.currentIndex + 1) % this.shuffledOrder.length;
        this.showSlide(next);
    }

    prevSlide() {
        if (this.mediaFiles.length === 0 || this.transitioning) return;
        const prev = (this.currentIndex - 1 + this.shuffledOrder.length) % this.shuffledOrder.length;
        this.showSlide(prev);
    }

    toggleSlideshow() {
        const btn = document.getElementById('media-play-btn');
        if (this.isPlaying) {
            this.stopSlideshow();
            if (btn) btn.textContent = '▶ Play';
        } else {
            this.startSlideshow();
            if (btn) btn.textContent = '⏸ Pause';
        }
    }

    startSlideshow() {
        if (this.mediaFiles.length === 0) return;
        this.isPlaying = true;

        if (this.currentIndex === -1) {
            this.showSlideshow();
            this.showSlide(0);
        }

        // Clear any existing timer
        this._clearSlideTimer();
        this._scheduleNext();
    }

    _scheduleNext() {
        this._clearSlideTimer();
        this.slideTimer = setTimeout(() => {
            if (!this.isPlaying) return;
            this.nextSlide();
            // Schedule again after this slide's transition completes
            setTimeout(() => {
                if (this.isPlaying) this._scheduleNext();
            }, 2600); // Wait for crossfade to complete
        }, this.slideshowDelay);
    }

    _clearSlideTimer() {
        if (this.slideTimer) {
            clearTimeout(this.slideTimer);
            this.slideTimer = null;
        }
    }

    stopSlideshow() {
        this.isPlaying = false;
        this._clearSlideTimer();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        const btn = document.getElementById('media-mute-btn');
        if (btn) btn.textContent = this.isMuted ? '🔇 Muted' : '🔊 Sound';

        this.slideshowEl.querySelectorAll('video').forEach(v => {
            v.muted = this.isMuted;
        });
    }

    setDelay(ms) {
        this.slideshowDelay = ms;
        if (this.isPlaying) {
            this._clearSlideTimer();
            this._scheduleNext();
        }
    }
}
