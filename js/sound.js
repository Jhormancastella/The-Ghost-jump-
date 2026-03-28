class SoundManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.isMusicPlaying = false;
        
        this.loadSound('jump',     'https://res.cloudinary.com/dipv76dpn/video/upload/v1774738391/jump_snm83q.wav');
        this.loadSound('coin',     'https://res.cloudinary.com/dipv76dpn/video/upload/v1774738333/coin_kp3l5o.wav');
        this.loadSound('powerup',  'https://res.cloudinary.com/dipv76dpn/video/upload/v1774738391/powerup_vsyhsu.wav');
        this.loadSound('gameover', 'https://res.cloudinary.com/dipv76dpn/video/upload/v1774738391/gameover_rnmha2.wav');
        this.loadSound('hit',      'https://res.cloudinary.com/dipv76dpn/video/upload/v1774738391/hit_o7c1cg.wav');
        
        this.music = new Audio('https://res.cloudinary.com/dipv76dpn/video/upload/v1774738392/background_music_a2pqd9.mp3');
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