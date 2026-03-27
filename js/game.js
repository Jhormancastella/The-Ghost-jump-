class GhostJumpGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.ghostNormalImg = new Image();
        this.ghostNormalImg.crossOrigin = "anonymous";
        this.ghostNormalImg.src = GHOST_NORMAL_SRC;

        this.ghostExplodedImg = new Image();
        this.ghostExplodedImg.crossOrigin = "anonymous";
        this.ghostExplodedImg.src = GHOST_EXPLODED_SRC;
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.state = 'menu';
        this.difficulty = 'easy';
        this.diffConfig = CONFIG.DIFFICULTIES.easy;
        this.lastDeathByVoid = false;
        this.tiltX = 0;
        this.motionAvailable = false;
        
        this.reset();
        this.setupControls();
        this.loadBestScore();
        this.loadLanguage();
        
        this.gameLoop();
    }
    
    resizeCanvas() {
        if (typeof updateConfigDimensions === 'function') {
            updateConfigDimensions();
        }
        this.canvas.width = CONFIG.WIDTH;
        this.canvas.height = CONFIG.HEIGHT;
    }

    loadLanguage() {
        const savedLang = localStorage.getItem('ghostJumpLanguage');
        if (savedLang && I18N[savedLang]) {
            CONFIG.settings.language = savedLang;
        }
        applyTranslations();
    }
    
    reset() {
        this.player = {
            x: CONFIG.WIDTH / 2 - 23,
            y: CONFIG.HEIGHT / 2,
            width: 46,
            height: 46,
            vx: 0,
            vy: 0,
            facingRight: true,
            hp: 2,
            invulnerableTimer: 0,
            exploded: false,
            explosionTimer: 0,
            skin: 'normal'
        };
        
        this.platforms = [];
        this.coins = [];
        this.particles = [];
        this.cameraY = 0;
        this.score = 0;
        this.coinsCollected = 0;
        this.maxHeight = CONFIG.HEIGHT;
        this.lastDeathByVoid = false;
        
        this.armor = 0;
        this.jumpBoostActive = false;
        this.boostTimer = 0;
        
        this.keys = { left: false, right: false };
        
        this.generateInitialPlatforms();
    }

    getCurrentBiome() {
        if (this.score < 150) {
            return {
                name: CONFIG.settings.language === 'es' ? 'Noche' : 'Night',
                icon: '🌌',
                bgTop: '#1a1a3e',
                bgMid: '#2d1b4e',
                bgBottom: '#1a1a2e',
                platformNormalTop: '#10B981',
                platformNormalBottom: '#059669',
                platformBreakTop: '#D97706',
                platformBreakBottom: '#B45309',
                starColor: 'rgba(255,255,255,0.5)',
                enemyBody: '#DC2626',
                enemyGlow: '#FCA5A5'
            };
        } else if (this.score < 350) {
            return {
                name: CONFIG.settings.language === 'es' ? 'Hielo' : 'Ice',
                icon: '❄️',
                bgTop: '#102a43',
                bgMid: '#2c7da0',
                bgBottom: '#61a5c2',
                platformNormalTop: '#60A5FA',
                platformNormalBottom: '#2563EB',
                platformBreakTop: '#93C5FD',
                platformBreakBottom: '#3B82F6',
                starColor: 'rgba(220,240,255,0.65)',
                enemyBody: '#0EA5E9',
                enemyGlow: '#BAE6FD'
            };
        } else if (this.score < 600) {
            return {
                name: CONFIG.settings.language === 'es' ? 'Lava' : 'Lava',
                icon: '🌋',
                bgTop: '#3b0a0a',
                bgMid: '#7f1d1d',
                bgBottom: '#dc2626',
                platformNormalTop: '#F97316',
                platformNormalBottom: '#C2410C',
                platformBreakTop: '#F59E0B',
                platformBreakBottom: '#B45309',
                starColor: 'rgba(255,180,120,0.45)',
                enemyBody: '#7F1D1D',
                enemyGlow: '#FCA5A5'
            };
        } else {
            return {
                name: CONFIG.settings.language === 'es' ? 'Cielo' : 'Sky',
                icon: '☁️',
                bgTop: '#dbeafe',
                bgMid: '#93c5fd',
                bgBottom: '#60a5fa',
                platformNormalTop: '#EDE9FE',
                platformNormalBottom: '#A78BFA',
                platformBreakTop: '#FDE68A',
                platformBreakBottom: '#F59E0B',
                starColor: 'rgba(255,255,255,0.85)',
                enemyBody: '#8B5CF6',
                enemyGlow: '#DDD6FE'
            };
        }
    }

    updatePlayerSkin() {
        if (this.score < 200) {
            this.player.skin = 'normal';
        } else if (this.score < 450) {
            this.player.skin = 'glow';
        } else {
            this.player.skin = 'ultra';
        }
    }
    
    generateInitialPlatforms() {
        this.platforms = [];
        
        this.platforms.push({
            x: CONFIG.WIDTH / 2 - 50,
            y: CONFIG.HEIGHT - 80,
            width: 100,
            height: 16,
            type: 'normal',
            enemy: null,
            powerup: null
        });
        
        for (let i = 1; i < 12; i++) {
            this.generatePlatformAtY(CONFIG.HEIGHT - 80 - i * this.diffConfig.platformGap);
        }
    }
    
    generatePlatformAtY(y) {
        const width = 65 + Math.random() * 50;
        const x = Math.random() * (CONFIG.WIDTH - width);
        const isBreakable = Math.random() < this.diffConfig.breakableProb;
        
        const platform = {
            x, y, width,
            height: 16,
            type: isBreakable ? 'breakable' : 'normal',
            enemy: null,
            powerup: null,
            breaking: false,
            breakTimer: 0
        };
        
        if (Math.random() < this.diffConfig.enemyProb && width > 60) {
            platform.enemy = {
                offsetX: width / 2 - 12,
                direction: Math.random() < 0.5 ? 1 : -1,
                speed: this.diffConfig.enemySpeed + Math.random() * 0.8,
                width: 24,
                height: 24
            };
        }
        
        if (Math.random() < CONFIG.POWERUP_PROB && !platform.enemy) {
            platform.powerup = {
                type: Math.random() < 0.5 ? 'jump' : 'armor',
                offsetX: width / 2 - 10,
                collected: false
            };
        }
        
        if (Math.random() < this.diffConfig.coinProb && !platform.powerup) {
            this.coins.push({
                x: x + width / 2 - 10,
                y: y - 35,
                collected: false,
                animOffset: Math.random() * Math.PI * 2
            });
        }
        
        this.platforms.push(platform);
        return platform;
    }
    
    update() {
        if (this.state !== 'playing') return;

        if (this.player.exploded) {
            this.player.explosionTimer--;
            this.updateParticles();
            this.updateHUD();
            this.updateBiomeUI();

            if (this.player.explosionTimer <= 0) {
                this.gameOver(false);
            }
            return;
        }
        
        const dc = this.diffConfig;

        if (this.player.invulnerableTimer > 0) {
            this.player.invulnerableTimer--;
        }

        this.player.vx = 0;

        if (CONFIG.settings.motionControl && this.motionAvailable) {
            if (this.tiltX < -8) {
                this.player.vx = -CONFIG.PLAYER_SPEED;
                this.player.facingRight = false;
            } else if (this.tiltX > 8) {
                this.player.vx = CONFIG.PLAYER_SPEED;
                this.player.facingRight = true;
            }
        } else {
            if (this.keys.left) {
                this.player.vx = -CONFIG.PLAYER_SPEED;
                this.player.facingRight = false;
            }
            if (this.keys.right) {
                this.player.vx = CONFIG.PLAYER_SPEED;
                this.player.facingRight = true;
            }
        }
        
        this.player.x += this.player.vx;
        
        if (this.player.x < -this.player.width) this.player.x = CONFIG.WIDTH;
        if (this.player.x > CONFIG.WIDTH) this.player.x = -this.player.width;
        
        this.player.vy += dc.gravity;
        this.player.y += this.player.vy;
        
        this.checkPlatformCollision();
        this.checkEnemyCollision();
        this.checkCoinCollection();
        this.checkPowerupCollection();
        this.updateEnemies();
        
        if (this.jumpBoostActive) {
            this.boostTimer--;
            if (this.boostTimer <= 0) {
                this.jumpBoostActive = false;
            }
        }
        
        const targetCam = this.player.y - CONFIG.HEIGHT * 0.4;
        if (targetCam < this.cameraY) {
            this.cameraY = targetCam;
        }
        
        if (this.player.y < this.maxHeight) {
            this.maxHeight = this.player.y;
            this.score = Math.floor((CONFIG.HEIGHT - this.maxHeight) / 10);
        }
        
        this.manageInfinitePlatforms();
        this.updateParticles();
        this.updateBreakingPlatforms();
        this.updatePlayerSkin();

        if (this.player.y - this.cameraY > CONFIG.HEIGHT + 100) {
            this.lastDeathByVoid = true;
            this.gameOver(true);
            return;
        }
        
        this.updateHUD();
        this.updateBiomeUI();
    }
    
    checkPlatformCollision() {
        if (this.player.vy <= 0 || this.player.exploded) return;
        
        const jumpForce = this.jumpBoostActive ? CONFIG.BOOST_JUMP : CONFIG.NORMAL_JUMP;
        
        for (let i = 0; i < this.platforms.length; i++) {
            const p = this.platforms[i];
            if (p.breaking) continue;
            
            const playerBottom = this.player.y + this.player.height;
            const prevBottom = playerBottom - this.player.vy;
            
            if (this.player.x + this.player.width - 5 > p.x && 
                this.player.x + 5 < p.x + p.width &&
                playerBottom >= p.y && prevBottom <= p.y + 8) {
                
                this.player.y = p.y - this.player.height;
                this.player.vy = jumpForce;
                
                // Sound jump
                window.soundManager.play('jump');

                this.createJumpParticles(this.player.x + this.player.width / 2, p.y);
                
                if (p.type === 'breakable') {
                    p.breaking = true;
                    p.breakTimer = 15;
                }
                
                break;
            }
        }
    }
    
    checkEnemyCollision() {
        if (this.player.invulnerableTimer > 0 || this.player.exploded) return;

        for (const p of this.platforms) {
            if (!p.enemy) continue;
            
            const ex = p.x + p.enemy.offsetX;
            const ey = p.y - p.enemy.height;
            
            if (this.player.x + this.player.width > ex &&
                this.player.x < ex + p.enemy.width &&
                this.player.y + this.player.height > ey &&
                this.player.y < ey + p.enemy.height) {
                
                if (this.armor > 0) {
                    this.armor--;
                    p.enemy = null;
                    this.createParticles(ex + 12, ey + 12, '#FFD700', 10);
                    window.soundManager.play('hit');
                    return;
                }

                this.player.hp--;
                this.player.invulnerableTimer = 60;
                this.createParticles(
                    this.player.x + this.player.width / 2,
                    this.player.y + this.player.height / 2,
                    '#ff4d6d',
                    14
                );
                window.soundManager.play('hit');

                p.enemy = null;

                if (this.player.hp <= 0) {
                    this.triggerExplosionAndGameOver();
                }
                return;
            }
        }
    }

    triggerExplosionAndGameOver() {
        if (this.player.exploded) return;

        this.player.exploded = true;
        this.player.explosionTimer = 45;
        this.createParticles(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2,
            '#ffffff',
            24
        );
        this.createParticles(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2,
            '#ff4d6d',
            16
        );
        window.soundManager.play('gameover');
    }
    
    checkCoinCollection() {
        for (const coin of this.coins) {
            if (coin.collected) continue;
            
            const cy = coin.y + Math.sin(Date.now() / 200 + coin.animOffset) * 5;
            
            if (this.player.x + this.player.width > coin.x &&
                this.player.x < coin.x + 20 &&
                this.player.y + this.player.height > cy &&
                this.player.y < cy + 20) {
                
                coin.collected = true;
                this.coinsCollected++;
                this.createParticles(coin.x + 10, cy + 10, '#FFD700', 8);
                window.soundManager.play('coin');
            }
        }
    }
    
    checkPowerupCollection() {
        for (const p of this.platforms) {
            if (!p.powerup || p.powerup.collected) continue;
            
            const px = p.x + p.powerup.offsetX;
            const py = p.y - 25;
            
            if (this.player.x + this.player.width > px &&
                this.player.x < px + 20 &&
                this.player.y + this.player.height > py &&
                this.player.y < py + 20) {
                
                p.powerup.collected = true;
                window.soundManager.play('powerup');
                
                if (p.powerup.type === 'jump') {
                    this.jumpBoostActive = true;
                    this.boostTimer = CONFIG.BOOST_DURATION;
                    this.createParticles(px + 10, py + 10, '#00BFFF', 12);
                } else {
                    this.armor = Math.min(this.armor + 1, 3);
                    this.createParticles(px + 10, py + 10, '#FFD700', 12);
                }
            }
        }
    }
    
    updateEnemies() {
        for (const p of this.platforms) {
            if (!p.enemy) continue;
            
            p.enemy.offsetX += p.enemy.direction * p.enemy.speed;
            
            if (p.enemy.offsetX < 5) {
                p.enemy.offsetX = 5;
                p.enemy.direction = 1;
            } else if (p.enemy.offsetX > p.width - p.enemy.width - 5) {
                p.enemy.offsetX = p.width - p.enemy.width - 5;
                p.enemy.direction = -1;
            }
        }
    }
    
    updateBreakingPlatforms() {
        for (let i = this.platforms.length - 1; i >= 0; i--) {
            const p = this.platforms[i];
            if (p.breaking) {
                p.breakTimer--;
                if (p.breakTimer <= 0) {
                    this.createParticles(p.x + p.width / 2, p.y, '#D2691E', 15);
                    this.platforms.splice(i, 1);
                }
            }
        }
    }
    
    manageInfinitePlatforms() {
        if (!this.platforms.length) return;

        let topPlatform = this.platforms[0];
        for (const p of this.platforms) {
            if (p.y < topPlatform.y) topPlatform = p;
        }
        
        while (topPlatform.y > this.cameraY - 150) {
            const newY = topPlatform.y - this.diffConfig.platformGap - Math.random() * 30;
            topPlatform = this.generatePlatformAtY(newY);
        }
        
        this.platforms = this.platforms.filter(p => p.y - this.cameraY < CONFIG.HEIGHT + 100);
        this.coins = this.coins.filter(c => c.y - this.cameraY < CONFIG.HEIGHT + 100);
    }
    
    createParticles(x, y, color, count) {
        if (!CONFIG.settings.particles) return;
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 2,
                life: 30 + Math.random() * 20,
                color,
                size: 3 + Math.random() * 4
            });
        }
    }
    
    createJumpParticles(x, y) {
        if (!CONFIG.settings.particles) return;
        
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 30,
                y,
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * 2 + 1,
                life: 20,
                color: '#FFFFFF',
                size: 2 + Math.random() * 3
            });
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.life--;
            p.size *= 0.95;
            
            if (p.life <= 0 || p.size < 0.5) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
        
        const biome = this.getCurrentBiome();
        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.HEIGHT);
        gradient.addColorStop(0, biome.bgTop);
        gradient.addColorStop(0.5, biome.bgMid);
        gradient.addColorStop(1, biome.bgBottom);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
        
        this.drawStars();
        this.drawCoins();
        this.drawPlatforms();
        this.drawParticles();
        this.drawPlayer();
    }
    
    drawStars() {
        const ctx = this.ctx;
        const biome = this.getCurrentBiome();
        ctx.fillStyle = biome.starColor;
        
        for (let i = 0; i < 50; i++) {
            const x = (i * 73) % CONFIG.WIDTH;
            const y = ((i * 137 + this.cameraY * 0.1) % CONFIG.HEIGHT);
            const size = (i % 3) + 1;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawPlatforms() {
        const ctx = this.ctx;
        const biome = this.getCurrentBiome();
        
        for (const p of this.platforms) {
            const screenY = p.y - this.cameraY;
            if (screenY < -50 || screenY > CONFIG.HEIGHT + 50) continue;
            
            let shakeX = 0;
            if (p.breaking) {
                shakeX = (Math.random() - 0.5) * 6;
            }
            
            if (CONFIG.settings.shadows) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(p.x + 4 + shakeX, screenY + 4, p.width, p.height);
            }
            
            if (p.type === 'breakable') {
                const grad = ctx.createLinearGradient(p.x, screenY, p.x, screenY + p.height);
                grad.addColorStop(0, biome.platformBreakTop);
                grad.addColorStop(1, biome.platformBreakBottom);
                ctx.fillStyle = grad;
            } else {
                const grad = ctx.createLinearGradient(p.x, screenY, p.x, screenY + p.height);
                grad.addColorStop(0, biome.platformNormalTop);
                grad.addColorStop(1, biome.platformNormalBottom);
                ctx.fillStyle = grad;
            }
            
            ctx.beginPath();
            ctx.roundRect(p.x + shakeX, screenY, p.width, p.height, 5);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(p.x + 5 + shakeX, screenY + 2, p.width - 10, 4);
            
            if (p.type === 'breakable') {
                ctx.strokeStyle = '#7C2D12';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(p.x + 15 + shakeX, screenY + p.height);
                ctx.lineTo(p.x + 25 + shakeX, screenY + 5);
                ctx.moveTo(p.x + p.width - 15 + shakeX, screenY + p.height);
                ctx.lineTo(p.x + p.width - 25 + shakeX, screenY + 5);
                ctx.stroke();
            }
            
            if (p.enemy) {
                this.drawEnemy(p.x + p.enemy.offsetX, screenY - p.enemy.height + 2, p.enemy);
            }
            
            if (p.powerup && !p.powerup.collected) {
                this.drawPowerup(p.x + p.powerup.offsetX, screenY - 28, p.powerup.type);
            }
        }
    }
    
    drawEnemy(x, y, enemy) {
        const ctx = this.ctx;
        const biome = this.getCurrentBiome();
        
        ctx.fillStyle = biome.enemyBody;
        ctx.beginPath();
        ctx.ellipse(x + enemy.width / 2, y + enemy.height - 8, enemy.width / 2, enemy.height / 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = biome.enemyGlow;
        ctx.beginPath();
        ctx.ellipse(x + enemy.width / 2 - 4, y + enemy.height - 14, 4, 3, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + 8, y + enemy.height - 10, 3, 0, Math.PI * 2);
        ctx.arc(x + 16, y + enemy.height - 10, 3, 0, Math.PI * 2);
        ctx.fill();
        
        const dx = this.player.x - x;
        const offsetX = Math.sign(dx) * 1;
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(x + 8 + offsetX, y + enemy.height - 10, 1.5, 0, Math.PI * 2);
        ctx.arc(x + 16 + offsetX, y + enemy.height - 10, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawPowerup(x, y, type) {
        const ctx = this.ctx;
        const bounce = Math.sin(Date.now() / 200) * 3;
        
        if (type === 'jump') {
            ctx.fillStyle = '#3B82F6';
            ctx.shadowColor = '#60A5FA';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(x + 10, y + bounce);
            ctx.lineTo(x + 18, y + 10 + bounce);
            ctx.lineTo(x + 12, y + 10 + bounce);
            ctx.lineTo(x + 14, y + 20 + bounce);
            ctx.lineTo(x + 6, y + 8 + bounce);
            ctx.lineTo(x + 10, y + 8 + bounce);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillStyle = '#FBBF24';
            ctx.shadowColor = '#F59E0B';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(x + 10, y + bounce);
            ctx.lineTo(x + 20, y + 5 + bounce);
            ctx.lineTo(x + 20, y + 14 + bounce);
            ctx.lineTo(x + 10, y + 22 + bounce);
            ctx.lineTo(x, y + 14 + bounce);
            ctx.lineTo(x, y + 5 + bounce);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.shadowBlur = 0;
    }
    
    drawCoins() {
        const ctx = this.ctx;
        
        for (const coin of this.coins) {
            if (coin.collected) continue;
            
            const screenY = coin.y - this.cameraY;
            if (screenY < -30 || screenY > CONFIG.HEIGHT + 30) continue;
            
            const bounce = Math.sin(Date.now() / 200 + coin.animOffset) * 5;
            const rotation = Date.now() / 500;
            const scaleX = Math.cos(rotation) * 0.5 + 0.5;
            
            ctx.fillStyle = '#FBBF24';
            ctx.shadowColor = '#F59E0B';
            ctx.shadowBlur = 8;
            
            ctx.beginPath();
            ctx.ellipse(coin.x + 10, screenY + bounce + 10, 10 * (0.3 + scaleX * 0.7), 10, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#FEF3C7';
            ctx.beginPath();
            ctx.ellipse(coin.x + 7, screenY + bounce + 7, 3, 2, -0.5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
        }
    }
    
    drawPlayer() {
        const ctx = this.ctx;
        const screenY = this.player.y - this.cameraY;
        const x = this.player.x;
        const y = screenY + Math.sin(Date.now() / 300) * 2;
        const w = this.player.width;
        const h = this.player.height;

        if (this.player.invulnerableTimer > 0 && !this.player.exploded) {
            if (Math.floor(this.player.invulnerableTimer / 5) % 2 === 0) {
                return;
            }
        }

        if (CONFIG.settings.shadows && !this.player.exploded) {
            ctx.fillStyle = 'rgba(0,0,0,0.22)';
            ctx.beginPath();
            ctx.ellipse(x + w / 2, y + h + 8, w / 3, 8, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.player.skin === 'glow') {
            ctx.shadowColor = '#60A5FA';
            ctx.shadowBlur = 18;
        } else if (this.player.skin === 'ultra') {
            ctx.shadowColor = '#F472B6';
            ctx.shadowBlur = 24;
        } else {
            ctx.shadowColor = '#A78BFA';
            ctx.shadowBlur = 10;
        }

        const img = this.player.exploded ? this.ghostExplodedImg : this.ghostNormalImg;

        if (img.complete && img.naturalWidth > 0) {
            ctx.save();

            if (!this.player.facingRight) {
                ctx.translate(x + w / 2, y + h / 2);
                ctx.scale(-1, 1);
                ctx.drawImage(img, -w / 2, -h / 2, w, h);
            } else {
                ctx.drawImage(img, x, y, w, h);
            }

            ctx.restore();
        } else {
            ctx.fillStyle = this.player.exploded ? '#ff4d6d' : '#ffffff';
            ctx.beginPath();
            ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.shadowBlur = 0;

        if (this.armor > 0 && !this.player.exploded) {
            ctx.strokeStyle = '#FBBF24';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#F59E0B';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(x + w / 2, y + h / 2, w / 2 + 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;

            if (this.armor > 1) {
                ctx.fillStyle = '#FBBF24';
                ctx.font = 'bold 12px Arial';
                ctx.fillText('x' + this.armor, x + w - 4, y - 4);
            }
        }

        if (this.jumpBoostActive && !this.player.exploded) {
            ctx.fillStyle = 'rgba(59,130,246,0.5)';
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.arc(
                    x + w / 2 + Math.sin(Date.now() / 120 + i) * 10,
                    y + h + 8 + i * 6,
                    4 - i * 0.6,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
    }
    
    drawParticles() {
        const ctx = this.ctx;
        
        for (const p of this.particles) {
            const alpha = Math.max(0, p.life / 50);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y - this.cameraY, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
    }
    
    updateHUD() {
        document.getElementById('scoreDisplay').textContent = `🏆 ${this.score}`;
        document.getElementById('coinsDisplay').textContent = `🪙 ${this.coinsCollected}`;
        
        let powerupText = `❤️ ${this.player.hp} | 🛡️ ${this.armor}`;
        if (this.jumpBoostActive) {
            const seconds = (this.boostTimer / 60).toFixed(1);
            powerupText += ` | ⚡ ${seconds}s`;
        } else {
            powerupText += ' | ⚡ --';
        }
        document.getElementById('powerupDisplay').textContent = powerupText;
    }

    updateBiomeUI() {
        const biome = this.getCurrentBiome();
        const indicator = document.getElementById('biomeIndicator');
        if (indicator) indicator.textContent = `${biome.icon} ${biome.name}`;
    }
    
    startGame() {
        this.diffConfig = CONFIG.DIFFICULTIES[this.difficulty];
        this.reset();
        this.state = 'playing';
        
        hideAllScreens();
        document.getElementById('gameHud').classList.remove('hidden');
        document.getElementById('pauseBtn').classList.remove('hidden');
        document.getElementById('biomeIndicator').classList.remove('hidden');
        document.getElementById('sensorIndicator').classList.remove('hidden');
        this.updateHUD();
        this.updateBiomeUI();
        updateSensorIndicator();
        
        // Start background music
        window.soundManager.startMusic();
        
        if (CONFIG.settings.touchControls && 'ontouchstart' in window && !CONFIG.settings.motionControl) {
            document.getElementById('touchControls').classList.remove('hidden');
        }
    }
    
    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            document.getElementById('pauseScreen').classList.remove('hidden');
            window.soundManager.stopMusic();
        } else if (this.state === 'paused') {
            this.state = 'playing';
            document.getElementById('pauseScreen').classList.add('hidden');
            window.soundManager.startMusic();
        }
    }
    
    gameOver(fromVoid = false) {
        this.state = 'gameover';
        this.lastDeathByVoid = fromVoid;
        
        const isNewRecord = this.score > this.bestScore;
        if (isNewRecord) {
            this.bestScore = this.score;
            this.saveBestScore();
        }

        document.getElementById('gameoverTitle').textContent = fromVoid ? t('gameOverVoid') : t('gameOverExploded');
        document.getElementById('gameoverGhostImg').src = fromVoid ? GHOST_NORMAL_SRC : GHOST_EXPLODED_SRC;
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalCoins').textContent = this.coinsCollected;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('newRecordText').style.display = isNewRecord ? 'block' : 'none';
        
        document.getElementById('gameHud').classList.add('hidden');
        document.getElementById('pauseBtn').classList.add('hidden');
        document.getElementById('touchControls').classList.add('hidden');
        document.getElementById('biomeIndicator').classList.add('hidden');
        document.getElementById('sensorIndicator').classList.add('hidden');
        document.getElementById('gameoverScreen').classList.remove('hidden');
        
        window.soundManager.stopMusic();
        if (fromVoid) window.soundManager.play('gameover');
    }
    
    restartGame() {
        document.getElementById('gameoverScreen').classList.add('hidden');
        document.getElementById('pauseScreen').classList.add('hidden');
        this.startGame();
    }
    
    goToMenu() {
        this.state = 'menu';
        hideAllScreens();
        document.getElementById('mainMenu').classList.remove('hidden');
        window.soundManager.stopMusic();
    }
    
    loadBestScore() {
        this.bestScore = parseInt(localStorage.getItem('ghostJumpBest') || '0');
    }

    saveBestScore() {
        localStorage.setItem('ghostJumpBest', this.bestScore.toString());
    }

    setMotionControl(enabled) {
        CONFIG.settings.motionControl = enabled;
        updateSensorIndicator();

        if (enabled) {
            document.getElementById('touchControls').classList.add('hidden');
        } else {
            if (this.state === 'playing' && CONFIG.settings.touchControls && 'ontouchstart' in window) {
                document.getElementById('touchControls').classList.remove('hidden');
            }
        }
    }
    
    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keys.left = true;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.keys.right = true;
            }
            if (e.key === 'Escape' && this.state === 'playing') {
                this.togglePause();
            }
            if ((e.key === 'p' || e.key === 'P') && (this.state === 'playing' || this.state === 'paused')) {
                this.togglePause();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keys.left = false;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.keys.right = false;
            }
        });
        
        const btnLeft = document.getElementById('btnLeft');
        const btnRight = document.getElementById('btnRight');
        
        btnLeft.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.left = true;
        });
        btnLeft.addEventListener('touchend', () => this.keys.left = false);
        btnLeft.addEventListener('touchcancel', () => this.keys.left = false);
        
        btnRight.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.right = true;
        });
        btnRight.addEventListener('touchend', () => this.keys.right = false);
        btnRight.addEventListener('touchcancel', () => this.keys.right = false);
        
        btnLeft.addEventListener('mousedown', () => this.keys.left = true);
        btnLeft.addEventListener('mouseup', () => this.keys.left = false);
        btnLeft.addEventListener('mouseleave', () => this.keys.left = false);
        
        btnRight.addEventListener('mousedown', () => this.keys.right = true);
        btnRight.addEventListener('mouseup', () => this.keys.right = false);
        btnRight.addEventListener('mouseleave', () => this.keys.right = false);
        
        this.canvas.addEventListener('touchstart', (e) => {
            if (this.state !== 'playing' || CONFIG.settings.motionControl) return;
            e.preventDefault();
            
            const rect = this.canvas.getBoundingClientRect();
            const touchX = (e.touches[0].clientX - rect.left) * (CONFIG.WIDTH / rect.width);
            
            if (touchX < CONFIG.WIDTH / 2) {
                this.keys.left = true;
            } else {
                this.keys.right = true;
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', () => {
            this.keys.left = false;
            this.keys.right = false;
        });
        
        this.canvas.addEventListener('touchcancel', () => {
            this.keys.left = false;
            this.keys.right = false;
        });

        window.addEventListener('deviceorientation', (event) => {
            if (event.gamma == null) return;
            this.motionAvailable = true;
            this.tiltX = event.gamma;
            updateSensorIndicator();
        });
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

let game;

window.addEventListener('load', () => {
    game = new GhostJumpGame();
    updateSettings();
    applyTranslations();
    const gameoverImg = document.getElementById('gameoverGhostImg');
    if (gameoverImg) gameoverImg.src = GHOST_NORMAL_SRC;
});

document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());