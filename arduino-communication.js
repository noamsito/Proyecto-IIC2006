// arduino-communication.js
// Módulo para comunicación con Arduino desde la página web

class ArduinoController {
  constructor() {
    this.port = null;
    this.writer = null;
    this.reader = null;
    this.isConnected = false;
    this.lastConflictLevel = -1;
  }

  // Conectar al Arduino
  async connect() {
    try {
      // Solicitar puerto serial
      this.port = await navigator.serial.requestPort();
      
      // Abrir conexión
      await this.port.open({ baudRate: 9600 });
      
      // Configurar escritor y lector
      this.writer = this.port.writable.getWriter();
      this.reader = this.port.readable.getReader();
      
      this.isConnected = true;
      console.log('Arduino conectado exitosamente');
      
      // Iniciar lectura de respuestas del Arduino
      this.startReading();
      
      // Enviar comando de status inicial
      await this.sendCommand('STATUS');
      
      return true;
    } catch (error) {
      console.error('Error conectando al Arduino:', error);
      this.showConnectionError(error.message);
      return false;
    }
  }

  // Desconectar del Arduino
  async disconnect() {
    try {
      if (this.reader) {
        await this.reader.cancel();
        await this.reader.releaseLock();
      }
      
      if (this.writer) {
        await this.writer.releaseLock();
      }
      
      if (this.port) {
        await this.port.close();
      }
      
      this.isConnected = false;
      console.log('Arduino desconectado');
    } catch (error) {
      console.error('Error desconectando:', error);
    }
  }

  // Enviar comando al Arduino
  async sendCommand(command) {
    if (!this.isConnected || !this.writer) {
      console.warn('Arduino no conectado');
      return false;
    }

    try {
      const data = new TextEncoder().encode(command + '\n');
      await this.writer.write(data);
      console.log(`Comando enviado: ${command}`);
      return true;
    } catch (error) {
      console.error('Error enviando comando:', error);
      return false;
    }
  }

  // Leer respuestas del Arduino
  async startReading() {
    try {
      while (this.isConnected) {
        const { value, done } = await this.reader.read();
        
        if (done) break;
        
        const text = new TextDecoder().decode(value);
        this.handleArduinoResponse(text);
      }
    } catch (error) {
      if (this.isConnected) {
        console.error('Error leyendo del Arduino:', error);
      }
    }
  }

  // Manejar respuestas del Arduino
  handleArduinoResponse(response) {
    const lines = response.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      console.log('Arduino:', line);
      
      if (line.startsWith('MOVING_TO:')) {
        this.updateServoStatus('moving', line);
      } else if (line.startsWith('POSITION_REACHED:')) {
        this.updateServoStatus('reached', line);
      } else if (line.startsWith('STATUS:')) {
        this.updateServoStatus('status', line);
      }
    });
  }

  // Actualizar estado del servo en la interfaz
  updateServoStatus(type, message) {
    const statusElement = document.getElementById('arduinoStatus');
    if (statusElement) {
      const timestamp = new Date().toLocaleTimeString();
      statusElement.innerHTML += `<div class="status-line">[${timestamp}] ${message}</div>`;
      statusElement.scrollTop = statusElement.scrollHeight;
    }
  }

  // Enviar nivel de conflictos al Arduino
  async setConflictLevel(conflicts) {
    const level = this.mapConflictsToLevel(conflicts);
    
    // Solo enviar si cambió el nivel
    if (level !== this.lastConflictLevel) {
      const success = await this.sendCommand(`LEVEL:${level}`);
      if (success) {
        this.lastConflictLevel = level;
      }
      return success;
    }
    return true;
  }

  // Resetear servo a posición inicial
  async resetServo() {
    return await this.sendCommand('RESET');
  }

  // Solicitar status del Arduino
  async requestStatus() {
    return await this.sendCommand('STATUS');
  }

  // Mapear número de conflictos a nivel (0-5)
  mapConflictsToLevel(conflicts) {
    if (conflicts === 0) return 0;
    if (conflicts >= 1 && conflicts < 5) return 1;
    if (conflicts >= 5 && conflicts < 10) return 2;
    if (conflicts >= 10 && conflicts < 15) return 3;
    if (conflicts >= 15 && conflicts < 20) return 4;
    return 5; // 20+ conflictos
  }

  // Mostrar error de conexión
  showConnectionError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'connection-error';
    errorDiv.innerHTML = `
      <strong>Error de conexión con Arduino:</strong><br>
      ${message}<br>
      <small>Asegúrate de que el Arduino esté conectado y tu navegador soporte Web Serial API</small>
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }
}

// Instancia global del controlador Arduino
const arduinoController = new ArduinoController();

// Verificar soporte para Web Serial API
function checkWebSerialSupport() {
  if (!('serial' in navigator)) {
    console.warn('Web Serial API no soportada en este navegador');
    return false;
  }
  return true;
}

// Inicializar cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
  if (checkWebSerialSupport()) {
    console.log('Web Serial API disponible');
  } else {
    console.warn('Web Serial API no disponible - funcionalidad de Arduino deshabilitada');
  }
});

// Exportar para uso global
window.arduinoController = arduinoController;