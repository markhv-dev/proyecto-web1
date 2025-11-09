# Sistema de Simulacro MTC

Un sistema web para practicar y simular exámenes del Ministerio de Transportes y Comunicaciones (MTC) del Perú.

## Arquitectura del Proyecto

```
proyecto-web1/
├── public/                         # Archivos públicos accesibles
│   └── index.html                  # Página principal de entrada
│
├── src/                            # Código fuente del proyecto
│   ├── views/                      # Páginas HTML de la aplicación
│   │   ├── perfil.html            # Gestión de perfil de usuario
│   │   ├── preguntas.html         # Modo preguntas rápidas
│   │   ├── simulacro.html         # Simulacro completo de examen
│   │   └── resultados.html        # Visualización de resultados
│   │
│   ├── assets/                     # Recursos estáticos
│   │   ├── css/                   # Hojas de estilo
│   │   │   └── styles.css         # Estilos principales del sistema
│   │   └── js/                    # Scripts de JavaScript
│   │       ├── preguntas.js       # Lógica de preguntas rápidas
│   │       └── simulacro.js       # Lógica del simulacro
│   │
│   ├── data/                       # Datos del sistema
│   │   └── PREGUNTAS_mtc/         # Base de datos de preguntas
│   │       ├── json/              # Preguntas por categoría (JSON)
│   │       │   ├── AI.json        # Categoría A-I
│   │       │   ├── AII-A.json     # Categoría A-II-A
│   │       │   ├── AII-B.json     # Categoría A-II-B
│   │       │   ├── AIII-A.json    # Categoría A-III-A
│   │       │   ├── AIII-B.json    # Categoría A-III-B
│   │       │   ├── AIII-C.json    # Categoría A-III-C
│   │       │   ├── BII-A.json     # Categoría B-II-A
│   │       │   ├── BII-B.json     # Categoría B-II-B
│   │       │   └── BII-C.json     # Categoría B-II-C
│   │       └── imagenes/          # Imágenes de preguntas
│   │
│   └── components/                 # Componentes reutilizables (futuro)
│
├── docs/                           # Documentación del proyecto
├── .vscode/                        # Configuración de VS Code
├── .git/                           # Control de versiones Git
└── README.md                       # Este archivo
```

## Funcionalidades

### Página Principal (`public/index.html`)
- Punto de entrada al sistema
- Navegación a todas las secciones
- Diseño responsivo y accesible

### Gestión de Perfil (`src/views/perfil.html`)
- Visualización de datos del usuario
- Edición de nombre y correo electrónico
- Selección de categoría de licencia
- Historial de simulacros realizados
- Persistencia local con localStorage

### Preguntas Rápidas (`src/views/preguntas.html`)
- Práctica sin límite de tiempo
- Preguntas filtradas por categoría seleccionada
- Carga dinámica desde archivos JSON
- Indicador visual de categoría activa

### Simulacro Completo (`src/views/simulacro.html`)
- Examen cronometrado
- Preguntas aleatorias según categoría
- Evaluación automática
- Guardado de resultados

### Resultados (`src/views/resultados.html`)
- Visualización de puntajes obtenidos
- Estadísticas de rendimiento
- Historial de intentos

## Sistema de Diseño

### Colores Principales
- **Fondo**: `#eaf7f4` (Verde agua claro)
- **Header**: `#cdb4db` (Lila suave)
- **Botones**: `#a2e2e2` (Verde agua)
- **Texto principal**: `#3a1c4a` (Morado oscuro)
- **Texto secundario**: `#2f2f2f` (Gris oscuro)

### Componentes UI
- **Botones**: Esquinas redondeadas, bordes definidos, efectos hover
- **Paneles**: Expansibles/colapsables con animaciones suaves
- **Formularios**: Inputs consistentes con validación
- **Navegación**: Barra horizontal responsive

## Gestión de Datos

### Almacenamiento Local (localStorage)
```javascript
// Datos del usuario
localStorage.setItem('nombreUsuario', 'Nombre');
localStorage.setItem('correoUsuario', 'email@ejemplo.com');
localStorage.setItem('categoria', 'AI');
localStorage.setItem('puntaje', '18');
```

### Estructura de Preguntas (JSON)
```json
{
  "numero": 1,
  "tipo": "Materias generales",
  "categoria": "AI",
  "tema": "Reglamento de Tránsito",
  "descripcion": "¿Cuál es la velocidad máxima en zona urbana?",
  "alternativas": {
    "a": "40 km/h",
    "b": "50 km/h",
    "c": "60 km/h",
    "d": "80 km/h"
  },
  "respuesta_correcta": "b"
}
```

## Instalación y Uso

### Requisitos
- Navegador web moderno 
- Servidor web local 

### Ejecución
1. **Desarrollo local**: Abrir `public/index.html` en el navegador
2. **Servidor local**:
   ```bash
   # Con Python
   python -m http.server 8000

   # Con Node.js
   npx serve .

   # Con PHP
   php -S localhost:8000
   ```

### Navegación del Sistema
1. **Inicio**: `public/index.html` → Página principal
2. **Configurar perfil**: Seleccionar categoría de licencia
3. **Practicar**: Usar "Preguntas rápidas" para estudio
4. **Evaluar**: Realizar "Simulacro" completo
5. **Revisar**: Ver "Resultados" y progreso

## Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Almacenamiento**: localStorage (navegador)
- **Datos**: JSON estático
- **Estilo**: CSS personalizado con sistema de diseño propio
- **Control de versiones**: Git

## Características Responsive

- Diseño adaptable a móviles, tablets y desktop
- Navegación optimizada para touch
- Tipografía escalable
- Componentes flexibles

## Flujo de Usuario

1. **Entrada** → Página principal
2. **Configuración** → Seleccionar categoría en perfil
3. **Práctica** → Preguntas rápidas por categoría
4. **Evaluación** → Simulacro cronometrado
5. **Revisión** → Resultados y estadísticas

## Notas de Desarrollo

### Patrones Implementados
- **Separación de responsabilidades**: HTML (estructura), CSS (presentación), JS (comportamiento)
- **Modularidad**: Archivos organizados por tipo y función
- **Reutilización**: Estilos y componentes consistentes
- **Persistencia**: Estado del usuario mantenido entre sesiones

### Próximas Mejoras
- [ ] Sistema de autenticación
- [ ] Base de datos externa
- [ ] API REST para preguntas
- [ ] Modo offline
- [ ] Estadísticas avanzadas
- [ ] Exportación de resultados

---

## Información del Proyecto

**Tipo**: Proyecto académico - Desarrollo Web I
**Objetivo**: Sistema de simulacro para exámenes MTC
**Estado**: Funcional y desplegable
**Licencia**: Proyecto educativo

---

Última actualización: Noviembre 2025
