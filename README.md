# Simulacro de Examen MTC

Sistema web para practicar y simular exámenes del Ministerio de Transportes y Comunicaciones (MTC) de Perú, diseñado para ayudar a postulantes a obtener su licencia de conducir.

## Descripción

Aplicación web completa que permite a los usuarios:
- Registrarse y autenticarse en el sistema
- Realizar simulacros cronometrados de 40 preguntas (40 minutos)
- Practicar con preguntas rápidas sin límite de tiempo
- Visualizar resultados detallados con respuestas correctas e incorrectas
- Consultar historial de simulacros realizados en el perfil
- Acceder a más de 1000 preguntas organizadas en 9 categorías oficiales del MTC

## Tecnologías Utilizadas

### Backend
- **Python 3.12+**
- **Flask** - Framework web
- **MySQL 8.0** / **MariaDB** - Base de datos
- **bcrypt** - Hash de contraseñas

### Frontend
- **HTML5** - Estructura
- **CSS3** - Estilos (diseño responsivo con Flexbox/Grid)
- **JavaScript ES6+** - Interactividad (Vanilla JS, sin frameworks)

### DevOps
- **Docker** - Contenerización
- **Docker Compose** - Orquestación de servicios

## Estructura del Proyecto

```
proyecto-web1/
├── app.py                      # Aplicación Flask principal
├── requirements.txt            # Dependencias Python
├── init_db.sql                 # Script de inicialización de BD
├── Dockerfile                  # Imagen Docker de la aplicación
├── docker-compose.yml          # Orquestación de servicios
├── README.md                   # Este archivo
│
├── static/                     # Archivos estáticos
│   ├── assets/
│   │   ├── css/
│   │   │   └── styles.css     # Estilos principales
│   │   ├── js/
│   │   │   ├── simulacro.js   # Lógica del simulacro
│   │   │   └── preguntas.js   # Lógica de preguntas rápidas
│   │   └── images/
│   │       └── conducir1.jpg  # Imagen hero
│   └── data/
│       └── PREGUNTAS_mtc/     # Base de preguntas
│           ├── json/           # Preguntas por categoría (9 archivos JSON)
│           └── imagenes/       # Imágenes de señales de tránsito
│
├── templates/                  # Plantillas HTML (Jinja2)
│   ├── index.html             # Página principal
│   ├── login.html             # Inicio de sesión
│   ├── register.html          # Registro de usuarios
│   ├── simulacro.html         # Simulacro completo
│   ├── preguntas.html         # Preguntas rápidas
│   ├── resultados.html        # Visualización de resultados
│   └── perfil.html            # Perfil y historial
│
└── docs/                       # Documentación
    ├── Documentacion_Simulacro_MTC.docx
    └── requisitos.pdf
```

## Instalación y Ejecución

### Opción 1: Con Docker (Recomendado)

#### Requisitos
- Docker 20.10+
- Docker Compose 2.0+

#### Pasos

1. **Clonar el repositorio**
```bash
git clone <URL_DEL_REPOSITORIO>
cd proyecto-web1
```

2. **Construir y ejecutar los contenedores**
```bash
docker-compose up --build
```

3. **Acceder a la aplicación**
```
Abrir navegador en: http://localhost:5000
```

4. **Detener los contenedores**
```bash
# Presionar Ctrl+C en la terminal
docker-compose down
```

#### Notas sobre Docker
- El servicio `db` (MySQL) se inicializa automáticamente con el esquema definido en `init_db.sql`
- Los datos de la base de datos se persisten en un volumen Docker
- La aplicación Flask espera a que MySQL esté completamente inicializado (healthcheck)
- Puerto 5000: Aplicación web
- Puerto 3306: MySQL (solo para desarrollo)

---

### Opción 2: Sin Docker (Manual)

#### Requisitos
- Python 3.12 o superior
- MySQL 8.0+ o MariaDB 10+
- pip (gestor de paquetes Python)

#### Pasos

1. **Clonar el repositorio**
```bash
git clone <URL_DEL_REPOSITORIO>
cd proyecto-web1
```

2. **Configurar MySQL/MariaDB**
```bash
# Iniciar el servicio
sudo systemctl start mariadb  # o mysql

# Crear la base de datos
sudo mysql < init_db.sql
```

3. **Crear entorno virtual de Python**
```bash
python -m venv venv
source venv/bin/activate  # En Linux/Mac
# venv\Scripts\activate   # En Windows
```

4. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

5. **Configurar variables de entorno (opcional)**
```bash
export MYSQL_HOST=localhost
export MYSQL_USER=simulacro
export MYSQL_PASSWORD=password
export MYSQL_DB=simulacro_mtc
```

6. **Ejecutar la aplicación**
```bash
python app.py
```

7. **Acceder a la aplicación**
```
Abrir navegador en: http://localhost:5000
```

---

## Uso del Sistema

### 1. Registro de Usuario
- Acceder a la página principal
- Clic en "Registrarse"
- Completar formulario (nombre, email, contraseña)
- El sistema redirige automáticamente al login

### 2. Iniciar Sesión
- Ingresar email y contraseña
- La página principal se personaliza con el nombre del usuario

### 3. Realizar un Simulacro
- Menú → "Simulacro"
- Seleccionar categoría de licencia (A-I, A-II-A, B-II-A, etc.)
- Responder 40 preguntas en 40 minutos
- Al finalizar, el sistema calcula automáticamente el puntaje
- **Aprobado**: 35 o más respuestas correctas de 40

### 4. Preguntas Rápidas (Práctica)
- Menú → "Preguntas rápidas"
- Practicar sin límite de tiempo
- Verificar respuestas inmediatamente
- No se guarda registro (modo práctica)

### 5. Ver Perfil e Historial
- Menú → "Perfil"
- Visualizar datos personales
- Consultar último puntaje
- Revisar historial completo de simulacros

---

## Categorías de Licencia Disponibles

| Categoría | Descripción |
|-----------|-------------|
| **A-I** | Motocicletas y similares |
| **A-II-A** | Automóviles y camionetas |
| **A-II-B** | Taxis y remises |
| **A-III-A** | Vehículos de transporte de personal |
| **A-III-B** | Buses y omnibuses |
| **A-III-C** | Vehículos de transporte escolar |
| **B-II-A** | Camiones ligeros |
| **B-II-B** | Camiones pesados |
| **B-II-C** | Tractores y maquinaria |

---

## Características Técnicas

### Backend (Flask)
- **Autenticación**: Sistema de login con sesiones
- **Control de acceso**: Rutas protegidas con decorador `@login_required`
- **Roles**: Usuario normal y administrador
- **Seguridad**: Contraseñas hasheadas con bcrypt
- **API REST**: Endpoint para guardar resultados

### Frontend
- **Diseño responsivo**: Adaptable a móviles, tablets y desktop
- **Validación de formularios**: Cliente y servidor
- **Temporizador**: Cuenta regresiva de 40 minutos en simulacros
- **Carga dinámica**: Fetch API para obtener preguntas desde JSON
- **Persistencia**: localStorage para resultados temporales

### Base de Datos
- **Tablas**:
  - `usuarios`: Información de usuarios registrados
  - `simulacros`: Historial de simulacros realizados
- **Operaciones CRUD**: Crear, leer, actualizar (preparado), eliminar (preparado)
- **Relaciones**: Foreign keys entre usuarios y simulacros

---

## Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `MYSQL_HOST` | Host de MySQL | `localhost` (manual) / `db` (Docker) |
| `MYSQL_USER` | Usuario de BD | `simulacro` |
| `MYSQL_PASSWORD` | Contraseña de BD | `password` |
| `MYSQL_DB` | Nombre de la BD | `simulacro_mtc` |

---

## Solución de Problemas

### Error: "Can't connect to MySQL server"
**Solución**: Asegurarse de que MySQL/MariaDB esté ejecutándose
```bash
sudo systemctl start mariadb
sudo systemctl status mariadb
```

### Error: "ModuleNotFoundError: No module named 'flask'"
**Solución**: Activar el entorno virtual e instalar dependencias
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Docker: "port is already allocated"
**Solución**: Detener el servicio que use el puerto 5000 o 3306
```bash
sudo lsof -ti:5000 | xargs sudo kill -9
sudo systemctl stop mariadb
```

---

## Contribuidores

**Equipo de Desarrollo**
- [Nombres de los integrantes del equipo]

**Proyecto Académico**
- Curso: Desarrollo Web I
- Universidad: [Nombre de la universidad]
- Año: 2025

---

## Licencia

Este proyecto es de carácter académico y educativo.

---

## Contacto y Soporte

Para reportar errores o sugerencias:
- Repositorio: [URL del repositorio GitHub]
- Email: [Email de contacto]

---

**Última actualización**: Diciembre 2025
