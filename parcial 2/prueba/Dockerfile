# Usar una imagen base oficial de Python 3.8 slim
FROM python:3.8-slim

# Actualizar los paquetes del sistema y instalar dependencias necesarias
RUN apt-get update && \
    apt-get install -y \
    ansible iputils-ping \
    && rm -rf /var/lib/apt/lists/*

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar el archivo de requerimientos al directorio de trabajo
COPY requirements.txt ./

# Instalar las dependencias de Python especificadas en requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto de los archivos de la aplicación al contenedor
COPY . .

# Exponer el puerto 5000 para acceder a la aplicación Flask
EXPOSE 5000

# Comando para ejecutar la aplicación Flask
CMD ["python", "app.py"]

