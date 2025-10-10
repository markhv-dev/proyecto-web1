// Banco de preguntas simple
const preguntas = [
    {
        pregunta: "¿Qué debe hacer si un semáforo está en amarillo intermitente?",
        opciones: [
            "a) Detenerse completamente.",
            "b) Avanzar con precaución.",
            "c) Ignorar la señal.",
            "d) Acelerar para pasar."
        ]
    },
    {
        pregunta: "¿Cuál es la velocidad máxima en zona urbana?",
        opciones: [
            "a) 40 km/h",
            "b) 50 km/h",
            "c) 60 km/h",
            "d) 80 km/h"
        ]
    },
    {
        pregunta: "¿Qué significa una línea amarilla continua en la pista?",
        opciones: [
            "a) Puede adelantar",
            "b) No puede adelantar",
            "c) Puede estacionar",
            "d) Zona escolar"
        ]
    }
];

let indicePreguntaActual = 0;

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

// Cargar la primera pregunta al inicio
cargarPregunta();
