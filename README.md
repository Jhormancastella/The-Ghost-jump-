# 👻 The Ghost Jump - El Fantasma Saltador

![The Ghost Jump](https://res.cloudinary.com/dipv76dpn/image/upload/v1774615693/gemini-3.1-flash-image-preview_nano-banana-2__a_Quiero_crear_una_ver_pk0whl.png)

Un adictivo juego de plataformas estilo "infinite jumper" donde controlas a un fantasma que debe subir lo más alto posible, esquivando enemigos y recolectando monedas.

## 🚀 Características
- **Múltiples Biomas**: Noche, Hielo, Lava y Cielo.
- **Sistema de Dificultad**: Fácil (Clásico), Medio y Difícil.
- **Power-ups**: Botas de supersalto y armadura de protección.
- **Personalización**: Skins dinámicas que cambian según tu puntuación.
- **Multi-plataforma**: Versiones para Web, Windows (.exe) y Android (.apk).
- **Multilingüe**: Soporte para Español e Inglés.
- **Controles Flexibles**: Teclado, controles táctiles y sensor de movimiento (Tilt).

## 📂 Estructura del Proyecto (Modularizado)
```text
/
├── index.html          # Punto de entrada principal
├── css/
│   └── styles.css      # Estilos visuales
├── js/
│   ├── config.js       # Configuraciones del juego y constantes
│   ├── i18n.js         # Traducciones y localización
│   ├── sound.js        # Sistema de audio (SoundManager)
│   ├── ui.js           # Gestión de menús e interfaz
│   └── game.js         # Lógica principal del juego
├── assets/
│   ├── images/         # Recursos gráficos
│   └── sounds/         # Efectos de sonido y música
├── electron/           # Archivos para la versión de escritorio (.exe)
└── dist/               # Builds finales (generado)
```

## 🛠️ Instalación y Desarrollo

### Requisitos
- [Node.js](https://nodejs.org/) (opcional, para compilación de EXE/APK)

### Ejecución Local
Simplemente abre `index.html` en tu navegador o usa un servidor local:
```bash
npx serve .
```

### Generar Versión Windows (.exe)
1. Entra en la carpeta `electron/`.
2. Ejecuta `npm install`.
3. Ejecuta `npm run build`.

### Generar Versión Android (.apk)
Este proyecto está preparado para usar **Capacitor**:
1. Ejecuta `npm install`.
2. Agrega la plataforma Android: `npx cap add android`.
3. Sincroniza y abre en Android Studio: `npx cap open android`.

## 🔊 Sistema de Audio
El juego incluye un `SoundManager` que gestiona:
- Música de fondo (loop).
- Sonidos de salto.
- Recolección de monedas y power-ups.
- Impactos y Game Over.

*Nota: Asegúrate de colocar tus archivos .mp3 en `assets/sounds/` siguiendo los nombres definidos en `js/sound.js`.*

## 🔒 Seguridad y SEO
- Se ha incluido un archivo `.gitignore` para proteger el repositorio de archivos innecesarios y sensibles.
- Configuración de `sitemap.xml` y `robots.txt` para mejorar el posicionamiento en buscadores (Google Search).
- Metadatos optimizados en el `index.html`.

## 📄 Licencia
Este proyecto es de código abierto. ¡Siéntete libre de mejorarlo!

---
Desarrollado con ❤️ por Trae Code Assistant.