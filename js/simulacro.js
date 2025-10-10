// Evento al hacer clic en "Iniciar simulacro"
document.getElementById('btn-iniciar').addEventListener('click', function() {
    // Ocultar las instrucciones
    document.querySelector('.instrucciones').style.display = 'none';
    
    // Mostrar las preguntas
    const contenedor = document.getElementById('contenedor-pregunta');
    contenedor.classList.remove('oculto');
    contenedor.style.display = 'block';
});

// Contador de preguntas
let numeroPregunta = 1;

// Evento al hacer clic en "Siguiente"
document.getElementById('btn-siguiente').addEventListener('click', function() {
    // Incrementar el número de pregunta
    numeroPregunta++;
    
    // Actualizar el texto de la pregunta
    const textoPregunta = document.getElementById('texto-pregunta');
    textoPregunta.textContent = `Pregunta ${numeroPregunta}: Esta es una pregunta de ejemplo`;
    
    // Limpiar la selección de respuestas
    document.querySelectorAll('input[name="respuesta"]').forEach(input => {
        input.checked = false;
    });
    
    // Si llega a 5 preguntas, mostrar mensaje final
    if (numeroPregunta > 5) {
        alert('¡Simulacro completado! Has respondido 5 preguntas.');
        // Recargar la página para empezar de nuevo
        location.reload();
    }
});
