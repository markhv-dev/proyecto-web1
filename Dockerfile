# Imagen base oficial de Python 3.12 (requerimiento del proyecto)
FROM python:3.12-slim

# Información del mantenedor
LABEL maintainer="Equipo Desarrollo MTC Simulacro"
LABEL description="Sistema de Simulacro MTC - Aplicación Web Full Stack"

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar primero solo requirements.txt para aprovechar el cache de Docker
COPY requirements.txt .

# Instalar las dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el código de la aplicación al contenedor
COPY . .

# Exponer el puerto 5000 (puerto donde corre Flask)
EXPOSE 5000

# Variables de entorno para la base de datos
# (se sobrescriben en docker-compose.yml)
ENV MYSQL_HOST=db
ENV MYSQL_USER=simulacro
ENV MYSQL_PASSWORD=password
ENV MYSQL_DB=simulacro_mtc

# Comando para ejecutar la aplicación
CMD ["python", "app.py"]
