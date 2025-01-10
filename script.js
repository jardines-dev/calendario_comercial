// Crear un objeto para almacenar los turnos
let turnos = {};

// Obtener el mes y año actual
const today = new Date();
const month = today.getMonth(); // 0 - 11
const year = today.getFullYear();

const grupos = ['DIAMANTE', 'EMPRENDEDORAS', 'FENIX', 'GIRASOLES', 'JARDINERAS', 'NUEVA GENERACION', 'PRIMAVERA', 'SOL BRILLANTE', 'UNIVERSO'];
const equipos = ['San Borja', 'Molina', 'Lurin'];

// Función para generar el calendario
function generateCalendar() {
    const calendarElement = document.getElementById('calendar');
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const totalDays = lastDayOfMonth.getDate();
    const firstDay = firstDayOfMonth.getDay(); // 0 - 6 (domingo - sábado)

    // Limpiar el calendario antes de regenerarlo
    calendarElement.innerHTML = '';

    // Crear celdas vacías antes del primer día del mes
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('empty-cell');
        calendarElement.appendChild(emptyCell);
    }

    // Crear los días del mes
    for (let day = 1; day <= totalDays; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('day');
        dayCell.innerHTML = `<strong>${day}</strong>`;

        // Crear un espacio para los turnos
        const turnosDiv = document.createElement('div');
        turnosDiv.classList.add('turnos');

        // Crear 3 inputs para los turnos
        equipos.forEach((equipo, index) => {
            const grupoLabel = document.createElement('p');
            grupoLabel.classList.add('grupo-label');
            grupoLabel.innerText = equipo;

            const input = document.createElement('input');
            const datalistId = `grupo-list-${day}-${index}`;
            input.setAttribute('list', datalistId);
            input.setAttribute('placeholder', 'Seleccionar grupo');
            input.setAttribute('data-day', day); // Atributo para identificar el día
            input.setAttribute('data-equipo', equipo); // Atributo para identificar el equipo

            const datalist = document.createElement('datalist');
            datalist.id = datalistId;

            grupos.forEach(grupo => {
                const option = document.createElement('option');
                option.value = grupo;
                datalist.appendChild(option);
            });

            turnosDiv.appendChild(grupoLabel);
            turnosDiv.appendChild(input);
            turnosDiv.appendChild(datalist);
        });

        dayCell.appendChild(turnosDiv);
        calendarElement.appendChild(dayCell);
    }
}

// Función para registrar los turnos de todos los días
function registrarTodosLosTurnos() {
    turnos = {}; // Reiniciar los turnos

    const inputs = document.querySelectorAll('#calendar input');
    inputs.forEach(input => {
        const day = input.getAttribute('data-day');
        const equipo = input.getAttribute('data-equipo');
        const value = input.value;

        if (value) {
            if (!turnos[day]) {
                turnos[day] = {};
            }

            turnos[day][equipo] = value;
        }
    });

    if (Object.keys(turnos).length > 0) {
        alert('Turnos registrados correctamente.');
        console.log('Turnos registrados:', turnos);
    } else {
        alert('No hay turnos seleccionados para registrar.');
    }
}

// Función para asignar turnos al azar
function asignarTurnosAzar() {
    turnos = {}; // Reiniciar los turnos

    const totalDias = new Date(year, month + 1, 0).getDate();
    let MIN_TURNOS, MAX_TURNOS;

    // Establecer los límites de turnos basados en el total de días del mes
    if (totalDias === 28 || totalDias === 29) {
        MIN_TURNOS = 9;
        MAX_TURNOS = 10;
    } else if (totalDias === 30 || totalDias === 31) {
        MIN_TURNOS = 10;
        MAX_TURNOS = 11;
    }

    const asignaciones = {};
    const contadorSedes = {}; // Contador para limitar asignaciones por sede

    // Inicializar las asignaciones uniformes y el contador de sedes
    grupos.forEach(grupo => {
        asignaciones[grupo] = 0;
        contadorSedes[grupo] = {};
        equipos.forEach(equipo => {
            contadorSedes[grupo][equipo] = 0;
        });
    });

    // Crear los turnos por día
    for (let day = 1; day <= totalDias; day++) {
        turnos[day] = {};
        const gruposDelDia = new Set();

        // Rotar aleatoriamente los equipos para variar el orden
        const equiposDelDia = [...equipos].sort(() => Math.random() - 0.5);

        for (const equipo of equiposDelDia) {
            let grupoAsignado = null;

            // Buscar un grupo disponible
            const gruposDisponibles = grupos.filter(grupo => 
                !gruposDelDia.has(grupo) && 
                contadorSedes[grupo][equipo] < 4 && // No superar 4 asignaciones por sede
                asignaciones[grupo] < MAX_TURNOS // No superar el máximo de turnos por grupo
            );

            if (gruposDisponibles.length > 0) {
                // Elegir un grupo al azar de los disponibles
                const grupoIndex = Math.floor(Math.random() * gruposDisponibles.length);
                grupoAsignado = gruposDisponibles[grupoIndex];

                // Asignar el grupo
                gruposDelDia.add(grupoAsignado);
                turnos[day][equipo] = grupoAsignado;
                contadorSedes[grupoAsignado][equipo]++;
                asignaciones[grupoAsignado]++;
            } else {
                console.warn(`No hay grupos disponibles para el día ${day} y el equipo ${equipo}`);
            }
        }
    }

    // Verificar y ajustar asignaciones para cumplir con el mínimo de turnos
    const gruposMenosAsignados = grupos.filter(grupo => asignaciones[grupo] < MIN_TURNOS);
    for (const grupo of gruposMenosAsignados) {
        while (asignaciones[grupo] < MIN_TURNOS) {
            // Reasignar turnos de otros grupos que tienen más de MIN_TURNOS asignaciones
            for (let day = 1; day <= totalDias; day++) {
                for (const equipo of equipos) {
                    if (turnos[day][equipo] && asignaciones[turnos[day][equipo]] > MIN_TURNOS) {
                        const grupoAnterior = turnos[day][equipo];
                        turnos[day][equipo] = grupo;
                        asignaciones[grupo]++;
                        asignaciones[grupoAnterior]--;
                        if (asignaciones[grupo] >= MIN_TURNOS) break;
                    }
                }
                if (asignaciones[grupo] >= MIN_TURNOS) break;
            }
        }
    }

    // Actualizar el calendario con los turnos asignados
    const inputs = document.querySelectorAll('#calendar input');
    inputs.forEach(input => {
        const day = input.getAttribute('data-day');
        const equipo = input.getAttribute('data-equipo');

        if (turnos[day] && turnos[day][equipo]) {
            input.value = turnos[day][equipo];
        }
    });

    alert('Turnos asignados al azar.');
    console.log('Turnos asignados:', turnos);
}



// Función para imprimir los turnos registrados
function imprimirTurnos() {
    if (Object.keys(turnos).length === 0) {
        alert('No hay turnos registrados para imprimir.');
        return;
    }

    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    // Crear la cabecera del calendario con el nombre del mes y los días de la semana
    let imprimirHTML = `
        <div class="calendar-header">
            <h1>${monthNames[month]} ${year}</h1>
            <table>
                <thead>
                    <tr>${daysOfWeek.map(day => `<th>${day}</th>`).join('')}</tr>
                </thead>
                <tbody>`;
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

    // Crear las celdas vacías antes del primer día del mes
    imprimirHTML += '<tr>';
    for (let i = 0; i < firstDayOfMonth; i++) {
        imprimirHTML += '<td class="empty-cell"></td>';
    }

    // Crear las celdas con los días del mes
    for (let day = 1; day <= lastDayOfMonth; day++) {
        const currentDayOfWeek = new Date(year, month, day).getDay();
        if (currentDayOfWeek === 0 && day !== 1) {
            imprimirHTML += '</tr><tr>';
        }
        
        imprimirHTML += `<td class="dayf">
                            <strong>${day}</strong><br>
                            ${equipos.map(equipo => {
                                const grupo = (turnos[day] && turnos[day][equipo]) ? turnos[day][equipo] : '';
                                return `<div class="contentDay">
                                                <div><span><strong>${equipo}</strong></span></div>
                                                <div><span>:</span></div> 
                                                <div><span>${grupo}</span></div>
                                        </div>`;
                            }).join('')}
                         </td>`;
    }

    // Crear las celdas vacías después del último día del mes
    for (let i = new Date(year, month, lastDayOfMonth).getDay(); i < 6; i++) {
        imprimirHTML += '<td class="empty-cell"></td>';
    }
    imprimirHTML += '</tr></tbody></table></div>';

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>Imprimir Turnos</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                    }
                    .calendar-header {
                        text-align: center;
                        margin: 20px 0;
                    }
                    table {
                        margin: 20px auto;
                        border-collapse: collapse;
                        width: 100%;
                    }
                    table, th, td {
                        border: 1px solid black;
                    }
                    th, td {
                        padding: 10px;
                        
                    }
                    th {
                        background-color: #4CAF50;
                        color: white;
                    }
                    .dayf {
                        background-color: #f9f9f9;
                    }
                    .empty-cell {
                        background-color: #e0e0e0;
                    }
                    .contentDay {
                        display: grid;
                        grid-template-columns: 25% 10% 65%;
                        margin-top: 3px;
                    }

                    span {
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                ${imprimirHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Generar el calendario al cargar la página
generateCalendar();



