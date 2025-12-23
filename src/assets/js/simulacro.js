// Variables globales
let categoriaSeleccionada = '';
let preguntasDelExamen = [];
let preguntaActual = 0;
let respuestasUsuario = [];
let tiempoRestante = 40 * 60; // 40 minutos en segundos

// Cuando se hace clic en un botón de categoría
document.querySelectorAll('.btn-categoria').forEach(boton => {
    boton.addEventListener('click', function() {
        categoriaSeleccionada = this.getAttribute('data-categoria');
        localStorage.setItem('categoria', categoriaSeleccionada); // Guardar en localStorage
        cargarPreguntas();
    });
});
function cargarPreguntas() {
    document.getElementById('seleccion-categoria').innerHTML = '<h2>Cargando preguntas...</h2>';

    // (Sin mezclar AI con BII a menos que tú lo quieras)
    fetch(`../data/PREGUNTAS_mtc/json/${categoriaSeleccionada}.json`)
        .then(response => {
            if (!response.ok) throw new Error('No se encontró el archivo JSON');
            return response.json();
        })
        .then(data => {
            // SEPARAR POR TIPO (Generales vs Específicas)
            let generales = data.filter(p => p.tipo === 'Materias generales');
            let especificas = data.filter(p => p.tipo !== 'Materias generales');

            console.log(`Cargadas: ${generales.length} generales y ${especificas.length} específicas`);

            // LOGICA DE SELECCIÓN SEGURA
            if (generales.length >= 20 && especificas.length >= 20) {
                // Si hay suficientes de ambos tipos, sacamos 20 y 20
                preguntasDelExamen = [
                    ...seleccionarAleatorias(generales, 20),
                    ...seleccionarAleatorias(especificas, 20)
                ];
            } else {
                // Si el JSON es pequeño o no tiene tipos, sacamos 40 de lo que haya
                console.warn("No hay suficientes preguntas por tipo, cargando aleatorias generales.");
                preguntasDelExamen = seleccionarAleatorias(data, 40);
            }

            // Mezclar el orden final para que no salgan todas las generales juntas
            mezclarArray(preguntasDelExamen);
            iniciarExamen();
        })
        .catch(error => {
            console.error(error);
            alert("Error al cargar las preguntas de " + categoriaSeleccionada);
        });
}

function mostrarPregunta() {
    let pregunta = preguntasDelExamen[preguntaActual];
    
    // VALIDACIÓN: Si por algún motivo la pregunta no existe, detenerse
    if (!pregunta) {
        console.error("Pregunta no encontrada en el índice: " + preguntaActual);
        return;
    }

    // 1. Actualizar número de pregunta y descripción
    document.getElementById('numero-actual').textContent = preguntaActual + 1;
    document.getElementById('texto-pregunta').textContent = pregunta.descripcion || "Pregunta sin descripción";

    // 2. Manejo de la Imagen Principal de la pregunta
    const contenedorImagen = document.getElementById('imagen-pregunta');
    const imgElemento = document.getElementById('img-pregunta');
    let carpeta = pregunta.carpetaImagenes || categoriaSeleccionada;

    if (pregunta.hasImage && pregunta.imageFile) {
        contenedorImagen.classList.remove('oculto');
        imgElemento.src = `../data/PREGUNTAS_mtc/imagenes/${carpeta}/${pregunta.imageFile}`;
    } else {
        contenedorImagen.classList.add('oculto');
        imgElemento.src = "";
    }

    // 3. Manejo de Opciones (Texto o Imagen)
    const opciones = ['a', 'b', 'c', 'd'];

    opciones.forEach(letra => {
        const contenido = pregunta.alternativas[letra];
        const labelObj = document.getElementById(`label-${letra}`);
        const imgObj = document.getElementById(`img-${letra}`);

        // Verificamos si el contenido de la opción es una ruta de imagen
        const esImagen = contenido && (
            contenido.toLowerCase().endsWith('.png') || 
            contenido.toLowerCase().endsWith('.jpg') || 
            contenido.toLowerCase().endsWith('.jpeg')
        );

        if (esImagen) {
            // SI ES IMAGEN: Mostramos la letra en el label y cargamos la imagen en el <img>
            labelObj.textContent = letra + ") "; 
            imgObj.src = `../data/PREGUNTAS_mtc/imagenes/${carpeta}/${contenido}`;
            imgObj.classList.remove('oculto');
        } else {
            // SI ES TEXTO: Mostramos el texto normal y ocultamos el <img> de la opción
            labelObj.textContent = letra + ") " + (contenido || "---");
            imgObj.classList.add('oculto');
            imgObj.src = "";
        }
    });

    // 4. Limpiar selección de radio buttons
    document.querySelectorAll('input[name="respuesta"]').forEach(input => input.checked = false);

    // 5. Botones de navegación (Siguiente vs Finalizar)
    if (preguntaActual === preguntasDelExamen.length - 1) {
        document.getElementById('btn-siguiente').style.display = 'none';
        document.getElementById('btn-finalizar').style.display = 'inline-block';
    } else {
        document.getElementById('btn-siguiente').style.display = 'inline-block';
        document.getElementById('btn-finalizar').style.display = 'none';
    }
}

// Función para seleccionar preguntas aleatorias
function seleccionarAleatorias(array, cantidad) {
    let copia = [...array];
    mezclarArray(copia);
    return copia.slice(0, cantidad);
}

// Función para mezclar un array
function mezclarArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Función para iniciar el examen
function iniciarExamen() {
    // Ocultar selección de categoría y mostrar preguntas
    document.getElementById('seleccion-categoria').classList.add('oculto');
    document.getElementById('contenedor-pregunta').classList.remove('oculto');

    // Iniciar temporizador
    iniciarTemporizador();

    // Mostrar primera pregunta
    mostrarPregunta();
}

// Botón siguiente
document.getElementById('btn-siguiente').addEventListener('click', function(e) {
    e.preventDefault();

    // Verificar que haya seleccionado una respuesta
    let respuestaSeleccionada = document.querySelector('input[name="respuesta"]:checked');
    if (!respuestaSeleccionada) {
        alert('Por favor, selecciona una respuesta antes de continuar.');
        return;
    }

    // Guardar respuesta del usuario
    respuestasUsuario[preguntaActual] = respuestaSeleccionada.value;

    // Pasar a la siguiente pregunta
    preguntaActual++;
    mostrarPregunta();
});

// Botón finalizar
document.getElementById('btn-finalizar').addEventListener('click', function(e) {
    e.preventDefault();

    // Verificar que haya seleccionado una respuesta en la última pregunta
    let respuestaSeleccionada = document.querySelector('input[name="respuesta"]:checked');
    if (!respuestaSeleccionada) {
        alert('Por favor, selecciona una respuesta antes de finalizar.');
        return;
    }

    // Guardar última respuesta
    respuestasUsuario[preguntaActual] = respuestaSeleccionada.value;

    // Calcular resultados
    calcularResultados();
});

// Función para iniciar el temporizador
function iniciarTemporizador() {
    let intervalo = setInterval(function() {
        tiempoRestante--;

        let minutos = Math.floor(tiempoRestante / 60);
        let segundos = tiempoRestante % 60;

        document.getElementById('tiempo').textContent =
            minutos.toString().padStart(2, '0') + ':' + segundos.toString().padStart(2, '0');

        // Si se acaba el tiempo
        if (tiempoRestante <= 0) {
            clearInterval(intervalo);
            alert('¡Tiempo terminado!');
            calcularResultados();
        }
    }, 1000);
}

// Función para calcular resultados
function calcularResultados() {
    let correctas = 0;
    let detalleResultados = [];

    for (let i = 0; i < preguntasDelExamen.length; i++) {
        let esCorrecta = respuestasUsuario[i] === preguntasDelExamen[i].respuesta;
        if (esCorrecta) {
            correctas++;
        }

        // Guardar detalle de cada pregunta
        detalleResultados.push({
            numero: i + 1,
            pregunta: preguntasDelExamen[i].descripcion,
            opciones: preguntasDelExamen[i].alternativas,
            respuestaCorrecta: preguntasDelExamen[i].respuesta,
            respuestaUsuario: respuestasUsuario[i],
            esCorrecta: esCorrecta,
            hasImage: preguntasDelExamen[i].hasImage || false,
            carpetaImagenes: preguntasDelExamen[i].carpetaImagenes || '',
            imageFile: preguntasDelExamen[i].imageFile || ''
        });
    }

    let incorrectas = 40 - correctas;
    let aprobado = correctas >= 35;

    // Guardar resultados en localStorage
    localStorage.setItem('puntaje', correctas);
    localStorage.setItem('correctas', correctas);
    localStorage.setItem('incorrectas', incorrectas);
    localStorage.setItem('aprobado', aprobado);
    localStorage.setItem('detalleResultados', JSON.stringify(detalleResultados));

    // Redirigir a resultados
    window.location.href = 'resultados.html';
}
