function hideAllScreens() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('playMenu').classList.add('hidden');
    document.getElementById('skinsMenu').classList.add('hidden');
    document.getElementById('singlePlayerMenu').classList.add('hidden');
    document.getElementById('multiplayerMenu').classList.add('hidden');
    document.getElementById('settingsMenu').classList.add('hidden');
    document.getElementById('pauseScreen').classList.add('hidden');
    document.getElementById('gameoverScreen').classList.add('hidden');
    document.getElementById('gameHud').classList.add('hidden');
    document.getElementById('pauseBtn').classList.add('hidden');
    document.getElementById('touchControls').classList.add('hidden');
    document.getElementById('biomeIndicator').classList.add('hidden');
    document.getElementById('sensorIndicator').classList.add('hidden');
}

function updateSkinsMenuVisibility() {
    const totalCoins = parseInt(localStorage.getItem('ghostJumpTotalCoins') || '0');
    const unlocked = totalCoins >= 100;
    const btn = document.getElementById('skinsMenuBtn');
    const hint = document.getElementById('skinsLockedHint');
    if (btn) btn.classList.toggle('hidden', !unlocked);
    if (hint) hint.classList.toggle('hidden', unlocked);
}

function showSettingsFromPause() {
    document.getElementById('pauseScreen').classList.add('hidden');
    document.getElementById('settingsMenu').classList.remove('hidden');
    document.querySelectorAll('.kb-focus').forEach(el => el.classList.remove('kb-focus'));
    if (window.game) window.game._menuFocusIndex = 0;
    const backBtn = document.querySelector('#settingsMenu .back-btn');
    if (backBtn) {
        backBtn.onclick = () => {
            document.getElementById('settingsMenu').classList.add('hidden');
            document.getElementById('pauseScreen').classList.remove('hidden');
            backBtn.onclick = () => showScreen('mainMenu');
        };
    }
}

function showScreen(screenId) {
    hideAllScreens();
    document.getElementById(screenId).classList.remove('hidden');
    document.querySelectorAll('.kb-focus').forEach(el => el.classList.remove('kb-focus'));
    if (window.game) window.game._menuFocusIndex = 0;
    if (screenId === 'playMenu') updateSkinsMenuVisibility();
}

function selectDifficulty(element, difficulty) {
    document.querySelectorAll('.difficulty-option').forEach(el => {
        el.classList.remove('selected');
    });
    
    element.classList.add('selected');
    if (game) game.difficulty = difficulty;
}

function toggleSwitch(element) {
    element.classList.toggle('active');
    updateSettings();
}

function toggleMotionSwitch(element) {
    element.classList.toggle('active');
    const enabled = element.classList.contains('active');
    if (game) game.setMotionControl(enabled);
    updateSettings();
}

async function requestMotionPermission() {
    try {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            const response = await DeviceOrientationEvent.requestPermission();
            if (response === 'granted') {
                if (game) game.motionAvailable = true;
                alert(t('sensorGranted'));
            } else {
                alert(t('sensorDenied'));
            }
        } else if ('DeviceOrientationEvent' in window) {
            if (game) game.motionAvailable = true;
            alert(t('sensorGranted'));
        } else {
            alert(t('sensorNotSupported'));
        }
        updateSensorIndicator();
    } catch (e) {
        alert(t('sensorDenied'));
    }
}

function updateSensorIndicator() {
    const el = document.getElementById('sensorIndicator');
    if (!el) return;
    el.textContent = CONFIG.settings.motionControl ? t('motionOn') : t('motionOff');
}

function updateSettings() {
    const masterVolEl = document.getElementById('masterVolume');
    const musicVolEl = document.getElementById('musicVolume');
    const sfxVolEl = document.getElementById('sfxVolume');
    
    if (!masterVolEl) return;

    const masterVol = masterVolEl.value;
    const musicVol = musicVolEl.value;
    const sfxVol = sfxVolEl.value;
    
    document.getElementById('masterVolumeValue').textContent = masterVol + '%';
    document.getElementById('musicVolumeValue').textContent = musicVol + '%';
    document.getElementById('sfxVolumeValue').textContent = sfxVol + '%';
    
    CONFIG.settings.masterVolume = Number(masterVol);
    CONFIG.settings.musicVolume = Number(musicVol);
    CONFIG.settings.sfxVolume = Number(sfxVol);
    
    CONFIG.settings.touchControls = document.getElementById('touchToggle').classList.contains('active');
    CONFIG.settings.vibration = document.getElementById('vibrationToggle').classList.contains('active');
    CONFIG.settings.particles = document.getElementById('particlesToggle').classList.contains('active');
    CONFIG.settings.shadows = document.getElementById('shadowsToggle').classList.contains('active');
    CONFIG.settings.motionControl = document.getElementById('motionToggle').classList.contains('active');

    if (game) {
        game.setMotionControl(CONFIG.settings.motionControl);
    }
    updateSensorIndicator();
    
    // Update audio volumes if SoundManager exists
    if (window.soundManager) {
        window.soundManager.updateVolumes();
    }
}

function applyTranslations() {
    document.documentElement.lang = CONFIG.settings.language;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        el.textContent = t(key);
    });

    const roomInput = document.getElementById('roomInput');
    if (roomInput) roomInput.placeholder = t('roomPlaceholder');

    document.getElementById('labelHeight').textContent = t('height');
    document.getElementById('labelCoins').textContent = t('coins');
    document.getElementById('labelBest').textContent = t('best');
    document.getElementById('newRecordText').textContent = t('newRecord');
    document.getElementById('motionBtn').textContent = t('activate');
    document.title = CONFIG.settings.language === 'es'
        ? 'The Ghost Jump - El Fantasma Saltador'
        : 'The Ghost Jump - The Jumping Ghost';

    const langSelect = document.getElementById('languageSelect');
    if (langSelect) langSelect.value = CONFIG.settings.language;

    updateSensorIndicator();
}

function setLanguage(lang) {
    CONFIG.settings.language = lang;
    localStorage.setItem('ghostJumpLanguage', lang);
    applyTranslations();
}