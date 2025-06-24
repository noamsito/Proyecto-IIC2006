const soundSystem = {
  currentAudio: null,
  enabled: true,
  
  sounds: {
    0: "https://cdn.glitch.global/c8ec0c77-8af5-467d-b1e2-6040fc81c290/the-lamp-is-low.mp3?v=1748314964180",
    1: "https://cdn.glitch.global/c8ec0c77-8af5-467d-b1e2-6040fc81c290/pistol-shot.mp3?v=1748214690158",
    5: "https://cdn.glitch.global/c8ec0c77-8af5-467d-b1e2-6040fc81c290/gun-fight.mp3?v=1748215513933",
    10: "https://cdn.glitch.global/c8ec0c77-8af5-467d-b1e2-6040fc81c290/Warthog.mp3?v=1748216373888",
    15: "https://cdn.glitch.global/c8ec0c77-8af5-467d-b1e2-6040fc81c290/minigun.mp3?v=1748217889340",
    20: "https://cdn.glitch.global/c8ec0c77-8af5-467d-b1e2-6040fc81c290/air-raid-siren.mp3?v=1748218138474"
  },
  
  getSound(level) {
    if (level === 0) return this.sounds[0];
    if (level >= 1 && level < 5) return this.sounds[1];
    if (level >= 5 && level < 10) return this.sounds[5];
    if (level >= 10 && level < 15) return this.sounds[10];
    if (level >= 15 && level < 20) return this.sounds[15];
    return this.sounds[20];
  },
  
  play(level) {
    if (!this.enabled) return;

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }
    
    const soundUrl = this.getSound(level);
    this.currentAudio = new Audio(soundUrl);
    this.currentAudio.volume = 0.3; // Volumen reducido
    
    this.currentAudio.addEventListener('loadedmetadata', () => {
      const maxDuration = 4;
      if (this.currentAudio.duration > maxDuration) {
        setTimeout(() => {
          if (this.currentAudio) {
            this.currentAudio.restart();
          }
        }, maxDuration * 1000);
      }
    });
    
    this.currentAudio.play().catch(e => {
      console.warn('Error al reproducir audio:', e);
    });
  },
  
  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }
};