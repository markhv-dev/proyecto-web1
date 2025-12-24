"""
Sistema de Simulacro MTC - Backend Flask
Aplicación web para practicar exámenes de licencias de conducir
"""

from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import mysql.connector
from datetime import datetime
import os
import json

app = Flask(__name__)
app.secret_key = 'tu-clave-secreta-super-segura-cambiala-en-produccion'  # CAMBIAR en producción


# ============================================
# CONFIGURACIÓN DE BASE DE DATOS
# ============================================
# CONFIGURACIÓN DE BASE DE DATOS (GRUPAL)
# ============================================
# CONFIGURACIÓN DE BASE DE DATOS (AIVEN)
# ============================================
DB_CONFIG = {
    'host': os.getenv('MYSQL_HOST'),
    'user': os.getenv('MYSQL_USER'),
    'password': os.getenv('MYSQL_PASSWORD'),
    'database': os.getenv('MYSQL_DB'),
    'port': int(os.getenv('MYSQL_PORT', 27925)), # Puerto de Aiven
    'ssl_ca': 'ca.pem',              # Nombre del archivo del certificado
    'ssl_verify_cert': True          # Para asegurar conexión cifrada
}

def get_db_connection():
    """Crea y retorna una conexión a la base de datos MySQL con SSL"""
    try:
        # Aiven requiere SSL, pasamos los argumentos de DB_CONFIG
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as err:
        print(f"Error de conexión a BD: {err}")
        return None


# ============================================
# DECORADORES DE AUTENTICACIÓN
# ============================================
def login_required(f):
    """Decorador para rutas que requieren autenticación"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Debes iniciar sesión para acceder a esta página.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """Decorador para rutas que requieren rol de administrador"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Debes iniciar sesión.', 'warning')
            return redirect(url_for('login'))
        if session.get('rol') != 'admin':
            flash('No tienes permisos de administrador.', 'danger')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

# ============================================
# RUTAS PRINCIPALES
# ============================================

@app.route('/')
def index():
    """Página principal de bienvenida"""
    return render_template('index.html')

# ============================================
# AUTENTICACIÓN: REGISTRO Y LOGIN
# ============================================

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Registro de nuevos usuarios"""
    if request.method == 'POST':
        nombre = request.form.get('nombre', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        password_confirm = request.form.get('password_confirm', '')

        # Validaciones
        if not nombre or not email or not password:
            flash('Todos los campos son obligatorios.', 'danger')
            return render_template('register.html')

        if len(password) < 6:
            flash('La contraseña debe tener al menos 6 caracteres.', 'danger')
            return render_template('register.html')

        if password != password_confirm:
            flash('Las contraseñas no coinciden.', 'danger')
            return render_template('register.html')

        # Verificar si el email ya existe
        conn = get_db_connection()
        if not conn:
            flash('Error de conexión a la base de datos.', 'danger')
            return render_template('register.html')

        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT id FROM usuarios WHERE email = %s', (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            flash('El email ya está registrado. Intenta con otro.', 'warning')
            cursor.close()
            conn.close()
            return render_template('register.html')

        # Hash de la contraseña
        password_hash = generate_password_hash(password)

        # Insertar nuevo usuario
        try:
            cursor.execute(
                'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (%s, %s, %s, %s)',
                (nombre, email, password_hash, 'user')
            )
            conn.commit()
            flash('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success')
            cursor.close()
            conn.close()
            return redirect(url_for('login'))
        except mysql.connector.Error as err:
            flash(f'Error al registrar: {err}', 'danger')
            cursor.close()
            conn.close()
            return render_template('register.html')

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Inicio de sesión de usuarios"""
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')

        if not email or not password:
            flash('Email y contraseña son obligatorios.', 'danger')
            return render_template('login.html')

        # Buscar usuario en la base de datos
        conn = get_db_connection()
        if not conn:
            flash('Error de conexión a la base de datos.', 'danger')
            return render_template('login.html')

        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM usuarios WHERE email = %s', (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        # Verificar credenciales
        if user and check_password_hash(user['password_hash'], password):
            # Crear sesión
            session['user_id'] = user['id']
            session['nombre'] = user['nombre']
            session['email'] = user['email']
            session['rol'] = user['rol']
            flash(f'¡Bienvenido/a {user["nombre"]}!', 'success')

            # Redirigir según rol
            if user['rol'] == 'admin':
                return redirect(url_for('admin_dashboard'))
            else:
                return redirect(url_for('simulacro'))
        else:
            flash('Email o contraseña incorrectos.', 'danger')
            return render_template('login.html')

    return render_template('login.html')

@app.route('/logout')
def logout():
    """Cerrar sesión"""
    session.clear()
    flash('Sesión cerrada correctamente.', 'info')
    return redirect(url_for('index'))

# ============================================
# SIMULACRO - Páginas principales
# ============================================

@app.route('/simulacro')
@login_required
def simulacro():
    """Página de simulacro de examen"""
    return render_template('simulacro.html')

@app.route('/preguntas')
@login_required
def preguntas():
    """Página de preguntas rápidas"""
    return render_template('preguntas.html')

@app.route('/resultados')
@login_required
def resultados():
    """Página de resultados del usuario"""
    user_id = session.get('user_id')

    # Obtener historial de simulacros del usuario
    conn = get_db_connection()
    if not conn:
        return render_template('resultados.html', simulacros=[])

    cursor = conn.cursor(dictionary=True)
    cursor.execute('''
        SELECT id, categoria, puntaje, correctas, incorrectas, aprobado, fecha
        FROM simulacros
        WHERE usuario_id = %s
        ORDER BY fecha DESC
        LIMIT 10
    ''', (user_id,))
    simulacros = cursor.fetchall()
    cursor.close()
    conn.close()

    return render_template('resultados.html', simulacros=simulacros)

@app.route('/perfil')
@login_required
def perfil():
    """Página de perfil del usuario"""
    user_id = session.get('user_id')

    # Obtener historial de simulacros del usuario
    conn = get_db_connection()
    simulacros = []
    ultimo_puntaje = None

    if conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT id, categoria, puntaje, correctas, incorrectas, aprobado,
                   DATE_FORMAT(fecha, '%d/%m/%Y') as fecha_formateada
            FROM simulacros
            WHERE usuario_id = %s
            ORDER BY fecha DESC
            LIMIT 10
        ''', (user_id,))
        simulacros = cursor.fetchall()

        # Obtener último puntaje
        if simulacros:
            ultimo_puntaje = simulacros[0]['correctas']

        cursor.close()
        conn.close()

    return render_template('perfil.html',
                         simulacros=simulacros,
                         ultimo_puntaje=ultimo_puntaje)

# ============================================
# API - Endpoints para JavaScript
# ============================================

@app.route('/api/guardar-resultado', methods=['POST'])
@login_required
def guardar_resultado():
    """Guarda el resultado de un simulacro en la base de datos"""
    try:
        data = request.get_json()
        user_id = session.get('user_id')
        categoria = data.get('categoria')
        puntaje = data.get('puntaje')
        correctas = data.get('correctas')
        incorrectas = data.get('incorrectas')
        aprobado = correctas >= 35  # MTC requiere 35/40 correctas

        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'error': 'Error de conexión a BD'}), 500

        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO simulacros (usuario_id, categoria, puntaje, correctas, incorrectas, aprobado)
            VALUES (%s, %s, %s, %s, %s, %s)
        ''', (user_id, categoria, puntaje, correctas, incorrectas, aprobado))
        conn.commit()
        simulacro_id = cursor.lastrowid
        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'simulacro_id': simulacro_id,
            'aprobado': aprobado
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/mis-resultados')
@login_required
def mis_resultados():
    """Retorna el historial de simulacros del usuario en formato JSON"""
    user_id = session.get('user_id')

    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Error de BD'}), 500

    cursor = conn.cursor(dictionary=True)
    cursor.execute('''
        SELECT id, categoria, puntaje, correctas, incorrectas, aprobado,
               DATE_FORMAT(fecha, '%d/%m/%Y %H:%i') as fecha_formateada
        FROM simulacros
        WHERE usuario_id = %s
        ORDER BY fecha DESC
    ''', (user_id,))
    simulacros = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify({'success': True, 'simulacros': simulacros})

# ============================================
# PANEL DE ADMINISTRADOR
# ============================================

@app.route('/admin')
@admin_required
def admin_dashboard():
    """Panel de administración"""
    conn = get_db_connection()
    if not conn:
        return render_template('admin_dashboard.html', stats={})

    cursor = conn.cursor(dictionary=True)

    # Estadísticas generales
    cursor.execute('SELECT COUNT(*) as total FROM usuarios')
    total_usuarios = cursor.fetchone()['total']

    cursor.execute('SELECT COUNT(*) as total FROM simulacros')
    total_simulacros = cursor.fetchone()['total']

    cursor.execute('SELECT COUNT(*) as total FROM simulacros WHERE aprobado = 1')
    total_aprobados = cursor.fetchone()['total']

    # Usuarios recientes
    cursor.execute('''
        SELECT id, nombre, email, rol,
               DATE_FORMAT(fecha_registro, '%d/%m/%Y') as fecha
        FROM usuarios
        ORDER BY fecha_registro DESC
        LIMIT 10
    ''')
    usuarios_recientes = cursor.fetchall()

    # Simulacros recientes
    cursor.execute('''
        SELECT s.id, u.nombre, s.categoria, s.puntaje, s.aprobado,
               DATE_FORMAT(s.fecha, '%d/%m/%Y %H:%i') as fecha
        FROM simulacros s
        JOIN usuarios u ON s.usuario_id = u.id
        ORDER BY s.fecha DESC
        LIMIT 10
    ''')
    simulacros_recientes = cursor.fetchall()

    cursor.close()
    conn.close()

    stats = {
        'total_usuarios': total_usuarios,
        'total_simulacros': total_simulacros,
        'total_aprobados': total_aprobados,
        'usuarios_recientes': usuarios_recientes,
        'simulacros_recientes': simulacros_recientes
    }

    return render_template('admin_dashboard.html', stats=stats)

@app.route('/admin/usuarios')
@admin_required
def admin_usuarios():
    """Lista de todos los usuarios (solo admin)"""
    conn = get_db_connection()
    if not conn:
        return render_template('admin_usuarios.html', usuarios=[])

    cursor = conn.cursor(dictionary=True)
    cursor.execute('''
        SELECT id, nombre, email, rol,
               DATE_FORMAT(fecha_registro, '%d/%m/%Y %H:%i') as fecha_registro
        FROM usuarios
        ORDER BY fecha_registro DESC
    ''')
    usuarios = cursor.fetchall()
    cursor.close()
    conn.close()

    return render_template('admin_usuarios.html', usuarios=usuarios)

# ============================================
# MANEJADORES DE ERRORES
# ============================================

@app.errorhandler(404)
def page_not_found(e):
    """Maneja errores 404 - Página no encontrada"""
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    """Maneja errores 500 - Error interno del servidor"""
    return render_template('500.html'), 500

# ============================================
# INICIALIZACIÓN DE BASE DE DATOS
# ============================================

def init_db():
    """Crea las tablas necesarias si no existen"""
    conn = get_db_connection()
    if not conn:
        print("❌ No se pudo conectar a la base de datos")
        return

    cursor = conn.cursor()

    # Tabla usuarios
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            rol ENUM('user', 'admin') DEFAULT 'user',
            fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Tabla simulacros
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS simulacros (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            categoria VARCHAR(20) NOT NULL,
            puntaje INT NOT NULL,
            correctas INT NOT NULL,
            incorrectas INT NOT NULL,
            aprobado BOOLEAN NOT NULL,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
    ''')

    conn.commit()
    cursor.close()
    conn.close()
    print("✅ Tablas creadas/verificadas correctamente")

# ============================================
# PUNTO DE ENTRADA
# ============================================

if __name__ == '__main__':
    print("🚀 Iniciando Sistema de Simulacro MTC...")
    print("📊 Inicializando base de datos...")
    init_db()
    print("✅ Sistema listo")
    print("🌐 Accede a: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
