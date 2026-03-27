class SoundManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.isMusicPlaying = false;
        
        // Load sounds (placeholders for now, user should add files to assets/sounds/)
        this.loadSound('jump', 'assets/sounds/jump.mp3');
        this.loadSound('coin', 'assets/sounds/coin.mp3');
        this.loadSound('powerup', 'assets/sounds/powerup.mp3');
        this.loadSound('gameover', 'assets/sounds/gameover.mp3');
        this.loadSound('hit', 'assets/sounds/hit.mp3');
        
        // Background music
        this.music = new Audio('assets/sounds/background_music.mp3');
        this.music.loop = true;
    }

    loadSound(name, src) {
        const audio = new Audio(src);
        this.sounds[name] = audio;
    }

    play(name) {
        if (!this.sounds[name]) return;
        
        const sound = this.sounds[name].cloneNode();
        sound.volume = (CONFIG.settings.masterVolume / 100) * (CONFIG.settings.sfxVolume / 100);
        sound.play().catch(e => console.log("Audio play blocked by browser", e));
    }

    startMusic() {
        if (this.isMusicPlaying) return;
        
        this.updateMusicVolume();
        this.music.play()
            .then(() => this.isMusicPlaying = true)
            .catch(e => console.log("Music play blocked by browser", e));
    }

    stopMusic() {
        this.music.pause();
        this.isMusicPlaying = false;
    }

    updateVolumes() {
        this.updateMusicVolume();
    }

    updateMusicVolume() {
        if (this.music) {
            this.music.volume = (CONFIG.settings.masterVolume / 100) * (CONFIG.settings.musicVolume / 100);
        }
    }
}

// Global instance
window.soundManager = new SoundManager();