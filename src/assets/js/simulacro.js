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

// Función para cargar las preguntas según la categoría
function cargarPreguntas() {
    // Mostrar mensaje de carga
    document.getElementById('seleccion-categoria').innerHTML = '<h2>Cargando preguntas...</h2>';

    // Determinar qué archivos JSON cargar según la categoría
    if (categoriaSeleccionada === 'AI') {
        // A-I: 40 preguntas aleatorias de AI.json
        fetch('../data/PREGUNTAS_mtc/json/AI.json')
            .then(response => response.json())
            .then(data => {
                preguntasDelExamen = seleccionarAleatorias(data, 40);
                iniciarExamen();
            });
   // corregir esta seccion que combina 2 categorias - mark
    }
    else if (categoriaSeleccionada === 'BII-A' || categoriaSeleccionada === 'BII-B') {
        // B-II-A y B-II-B: Mezclar todas las preguntas de ambos
        Promise.all([
            fetch('../data/PREGUNTAS_mtc/json/BII-A.json').then(r => r.json()),
            fetch('../data/PREGUNTAS_mtc/json/BII-B.json').then(r => r.json())
        ]).then(([dataA, dataB]) => {
            let todasLasPreguntas = [...dataA, ...dataB];
            preguntasDelExamen = seleccionarAleatorias(todasLasPreguntas, 40);
            iniciarExamen();
        });
    }
    else if (categoriaSeleccionada === 'BII-C') {
        // B-II-C: 20 generales + 20 específicas
        fetch('../data/PREGUNTAS_mtc/json/BII-C.json')
            .then(response => response.json())
            .then(data => {
                let generales = data.filter(p => p.tipo === 'Materias generales');
                let especificas = data.filter(p => p.tipo !== 'Materias generales');
                let generalesSeleccionadas = seleccionarAleatorias(generales, 20);
                let especificasSeleccionadas = seleccionarAleatorias(especificas, 20);
                preguntasDelExamen = [...generalesSeleccionadas, ...especificasSeleccionadas];
                mezclarArray(preguntasDelExamen); // Mezclar el orden
                iniciarExamen();
            });
    }
    else {
        // Resto de categorías: 20 generales + 20 específicas
        fetch(`../data/PREGUNTAS_mtc/json/${categoriaSeleccionada}.json`)
            .then(response => response.json())
            .then(data => {
                let generales = data.filter(p => p.tipo === 'Materias generales');
                let especificas = data.filter(p => p.tipo !== 'Materias generales');
                let generalesSeleccionadas = seleccionarAleatorias(generales, 20);
                let especificasSeleccionadas = seleccionarAleatorias(especificas, 20);
                preguntasDelExamen = [...generalesSeleccionadas, ...especificasSeleccionadas];
                mezclarArray(preguntasDelExamen); // Mezclar el orden
                iniciarExamen();
            });
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

// Función para mostrar una pregunta
function mostrarPregunta() {
    let pregunta = preguntasDelExamen[preguntaActual];

    // Actualizar número de pregunta
    document.getElementById('numero-actual').textContent = preguntaActual + 1;

    // Mostrar texto de la pregunta
    document.getElementById('texto-pregunta').textContent = pregunta.descripcion;

    // Mostrar imagen si tiene
    if (pregunta.hasImage) {
        document.getElementById('imagen-pregunta').classList.remove('oculto');
        let rutaImagen = `../data/PREGUNTAS_mtc/imagenes/${pregunta.carpetaImagenes}/${pregunta.imageFile}`;
        document.getElementById('img-pregunta').src = rutaImagen;
    } else {
        document.getElementById('imagen-pregunta').classList.add('oculto');
    }

    // Mostrar opciones
    document.getElementById('label-a').textContent = 'a) ' + pregunta.alternativas.a;
    document.getElementById('label-b').textContent = 'b) ' + pregunta.alternativas.b;
    document.getElementById('label-c').textContent = 'c) ' + pregunta.alternativas.c;
    document.getElementById('label-d').textContent = 'd) ' + pregunta.alternativas.d;

    // Limpiar selección anterior
    document.querySelectorAll('input[name="respuesta"]').forEach(input => {
        input.checked = false;
    });

    // Mostrar botón finalizar en la última pregunta
    if (preguntaActual === 39) {
        document.getElementById('btn-siguiente').style.display = 'none';
        document.getElementById('btn-finalizar').style.display = 'inline-block';
    }
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
