// Configuración para Protobject
// Este archivo debe estar en la misma carpeta que tu HTML

// ID único para tu proyecto - cámbialo por uno único
const PROJECT_ID = "conflictos-belicos-" + Math.random().toString(36).substr(2, 9);

// Configuración del Arduino
Protobject.config = {
  projectId: PROJECT_ID,
  
  // Configuración del Arduino Leonardo
  arduino: {
    board: "leonardo",
    baudRate: 9600,
    autoConnect: false // Permitir conexión manual
  },
  
  // Habilitar logs para debug
  debug: true
};