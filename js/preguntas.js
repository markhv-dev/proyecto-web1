// Variables globales
let preguntas = [];
let indicePreguntaActual = 0;
let categoriaActual = localStorage.getItem('categoria') || 'AI';

// Cargar preguntas desde JSON según categoría
async function cargarPreguntasDeCategoria(categoria) {
    try {
        const response = await fetch(`../PREGUNTAS_mtc/json/${categoria}.json`);
        if (!response.ok) {
            throw new Error('No se pudo cargar el archivo de preguntas');
        }
        const data = await response.json();

        // Convertir formato de preguntas
        preguntas = data.map(pregunta => ({
            pregunta: pregunta.descripcion,
            opciones: [
                `a) ${pregunta.alternativas.a}`,
                `b) ${pregunta.alternativas.b}`,
                `c) ${pregunta.alternativas.c}`,
                `d) ${pregunta.alternativas.d}`
            ]
        }));

        indicePreguntaActual = 0;
        cargarPregunta();
        actualizarIndicadorCategoria();
    } catch (error) {
        console.error('Error al cargar preguntas:', error);
        // Fallback a preguntas predeterminadas
        preguntas = [
            {
                pregunta: "¿Qué debe hacer si un semáforo está en amarillo intermitente?",
                opciones: [
                    "a) Detenerse completamente.",
                    "b) Avanzar con precaución.",
                    "c) Ignorar la señal.",
                    "d) Acelerar para pasar."
                ]
            }
        ];
        cargarPregunta();
    }
}

// Cargar pregunta en la página
function cargarPregunta() {
    const pregunta = preguntas[indicePreguntaActual];
    
    // Cambiar el texto de la pregunta
    document.getElementById('texto-pregunta').textContent = pregunta.pregunta;
    
    // Cambiar las opciones
    const labels = document.querySelectorAll('.opciones label');
    labels.forEach((label, index) => {
        label.textContent = pregunta.opciones[index];
    });
    
    // Limpiar selección
    document.querySelectorAll('input[name="respuesta"]').forEach(input => {
        input.checked = false;
    });
}

// Evento al hacer clic en "Siguiente pregunta"
document.getElementById('btn-siguiente').addEventListener('click', function() {
    // Pasar a la siguiente pregunta
    indicePreguntaActual++;
    
    // Si llega al final, volver a la primera
    if (indicePreguntaActual >= preguntas.length) {
        indicePreguntaActual = 0;
    }
    
    cargarPregunta();
});

// Función para actualizar el indicador de categoría
function actualizarIndicadorCategoria() {
    const indicador = document.getElementById('indicador-categoria');
    if (indicador) {
        indicador.textContent = `Categoría: ${categoriaActual}`;
    }
}

// Detectar cambios en localStorage para actualizar categoría
window.addEventListener('storage', function(e) {
    if (e.key === 'categoria') {
        categoriaActual = e.newValue || 'AI';
        cargarPreguntasDeCategoria(categoriaActual);
    }
});

// También detectar cambios dentro de la misma pestaña
let intervalCheck = setInterval(() => {
    const nuevaCategoria = localStorage.getItem('categoria') || 'AI';
    if (nuevaCategoria !== categoriaActual) {
        categoriaActual = nuevaCategoria;
        cargarPreguntasDeCategoria(categoriaActual);
    }
}, 1000);

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    categoriaActual = localStorage.getItem('categoria') || 'AI';
    cargarPreguntasDeCategoria(categoriaActual);
});
