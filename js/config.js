const GHOST_NORMAL_SRC = "https://res.cloudinary.com/dipv76dpn/image/upload/v1774615693/gemini-3.1-flash-image-preview_nano-banana-2__a_Quiero_crear_una_ver_pk0whl.png";
const GHOST_EXPLODED_SRC = "https://res.cloudinary.com/dipv76dpn/image/upload/v1774615653/gemini-3.1-flash-image-preview_nano-banana-2__a_Dame_una_versi%C3%B3n_del_tzs3mm.png";

let isDesktop = window.innerWidth >= 1024;

const CONFIG = {
    WIDTH: isDesktop ? 600 : 400,
    HEIGHT: 700,
    GRAVITY: 0.45,
    NORMAL_JUMP: -14,
    BOOST_JUMP: -19,
    PLAYER_SPEED: 5.5,
    POWERUP_PROB: 0.12,
    BOOST_DURATION: 300,
    DIFFICULTIES: {
        easy: {
            name: 'Clásico',
            gravity: 0.42,
            platformGap: 65,
            enemyProb: 0.18,
            breakableProb: 0.15,
            enemySpeed: 1.0,
            coinProb: 0.4
        },
        medium: {
            name: 'Medio',
            gravity: 0.48,
            platformGap: 72,
            enemyProb: 0.28,
            breakableProb: 0.25,
            enemySpeed: 1.5,
            coinProb: 0.35
        },
        hard: {
            name: 'Difícil',
            gravity: 0.55,
            platformGap: 80,
            enemyProb: 0.38,
            breakableProb: 0.35,
            enemySpeed: 2.2,
            coinProb: 0.25
        }
    },
    settings: {
        masterVolume: 80,
        musicVolume: 60,
        sfxVolume: 100,
        touchControls: true,
        vibration: false,
        particles: true,
        shadows: true,
        language: 'es',
        motionControl: false
    }
};

function updateConfigDimensions() {
    isDesktop = window.innerWidth >= 1024;
    CONFIG.WIDTH = isDesktop ? 600 : 400;
}