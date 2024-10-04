

let currentDate = new Date();
let events = JSON.parse(localStorage.getItem('events')) || [];
let currentEventId = null;
const categoryColors = {
    work: '#3498db',
    personal: '#2ecc71',
    important: '#e74c3c'
};

document.addEventListener('DOMContentLoaded', function() {
    renderCalendar();
    renderEvents();
    setupDragAndDrop();
});

document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    document.getElementById('currentMonth').textContent = `${monthName} ${year}`;

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
const dayHeader = document.createElement('div');
dayHeader.textContent = day;
dayHeader.className = 'calendar-cell';
dayHeader.style.fontWeight = 'bold';
grid.appendChild(dayHeader);
    });

    for (let i = 0; i < firstDay.getDay(); i++) {
const emptyCell = document.createElement('div');
emptyCell.className = 'calendar-cell';
grid.appendChild(emptyCell);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
const cell = document.createElement('div');
cell.className = 'calendar-cell';
cell.textContent = day;

const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
if (isSameDay(cellDate, new Date())) {
    cell.classList.add('today');
}

const dayEvents = events.filter(event => isSameDay(new Date(event.date), cellDate));
if (dayEvents.length > 0) {
    const eventDot = document.createElement('div');
    eventDot.style.width = '8px';
    eventDot.style.height = '8px';
    eventDot.style.borderRadius = '50%';
    eventDot.style.backgroundColor = categoryColors[dayEvents[0].category];
    eventDot.style.margin = '2px auto';
    cell.appendChild(eventDot);
}

cell.addEventListener('click', () => selectDate(cellDate));
grid.appendChild(cell);
    }
}

function renderEvents() {
    const container = document.getElementById('eventContainer');
    container.innerHTML = '';
    
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    events.forEach((event, index) => {
const eventElement = document.createElement('div');
eventElement.className = 'event-item animate__animated animate__fadeIn';
eventElement.draggable = true;
eventElement.dataset.index = index;

const eventContent = document.createElement('div');
eventContent.className = 'event-content';

const categoryPill = document.createElement('span');
categoryPill.className = 'category-pill';
categoryPill.style.backgroundColor = categoryColors[event.category];
categoryPill.style.color = 'white';
categoryPill.textContent = event.category;

eventContent.appendChild(categoryPill);
eventContent.appendChild(document.createTextNode(` ${event.title}`));

const dateText = document.createElement('div');
dateText.style.fontSize = '0.8em';
dateText.style.color = '#666';
dateText.textContent = new Date(event.date).toLocaleDateString();
eventContent.appendChild(dateText);

const actionButtons = document.createElement('div');
actionButtons.className = 'event-actions';

const editButton = document.createElement('button');
editButton.className = 'btn btn-small btn-edit';
editButton.textContent = 'Edit';
editButton.onclick = () => editEvent(index);

const deleteButton = document.createElement('button');
deleteButton.className = 'btn btn-small btn-delete';
deleteButton.textContent = 'Delete';
deleteButton.onclick = () => showDeleteConfirmation(index);

actionButtons.appendChild(editButton);
actionButtons.appendChild(deleteButton);

eventElement.appendChild(eventContent);
eventElement.appendChild(actionButtons);

container.appendChild(eventElement);
    });
}

function selectDate(date) {
    document.querySelectorAll('.calendar-cell').forEach(cell => {
cell.classList.remove('selected');
    });
    
    const selectedCell = Array.from(document.querySelectorAll('.calendar-cell')).find(cell => {
return cell.textContent === date.getDate().toString();
    });
    
    if (selectedCell) {
selectedCell.classList.add('selected');
    }
    
    document.getElementById('eventDate').value = date.toISOString().split('T')[0];
    document.getElementById('eventId').value = ''; 
    document.getElementById('modalTitle').textContent = 'Add Event';
    document.getElementById('eventTitle').value = '';
    showAddEventModal();
}

function editEvent(index) {
    const event = events[index];
    document.getElementById('modalTitle').textContent = 'Edit Event';
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventDate').value = event.date.split('T')[0];
    document.getElementById('eventCategory').value = event.category;
    document.getElementById('eventId').value = index;
    showAddEventModal();
}

function showDeleteConfirmation(index) {
    currentEventId = index;
    document.getElementById('deleteConfirmation').style.display = 'block';
}

function closeDeleteConfirmation() {
    document.getElementById('deleteConfirmation').style.display = 'none';
}

function confirmDelete() {
    if (currentEventId !== null) {
events.splice(currentEventId, 1);
saveEvents();
renderCalendar();
renderEvents();
closeDeleteConfirmation();
showToast('Event deleted successfully', 'success');
    }
}

function saveEvent() {
    const title = document.getElementById('eventTitle').value;
    const date = document.getElementById('eventDate').value;
    const category = document.getElementById('eventCategory').value;
    const eventId = document.getElementById('eventId').value;
    
    if (title && date) {
const eventData = { title, date, category };

if (eventId !== '') {
    events[parseInt(eventId)] = eventData;
    showToast('Event updated successfully');
} else {
    events.push(eventData);
    showToast('Event added successfully');
}

saveEvents();
renderCalendar();
renderEvents();
closeModal();
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.opacity = 1;
    
    setTimeout(() => {
toast.style.opacity = 0;
    }, 3000);
}

function saveEvents() {
    localStorage.setItem('events', JSON.stringify(events));
}

function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
   date1.getMonth() === date2.getMonth() &&
   date1.getFullYear() === date2.getFullYear();
}

function setupDragAndDrop() {
    const eventItems = document.querySelectorAll('.event-item');
    const calendarCells = document.querySelectorAll('.calendar-cell');
    
    eventItems.forEach(item => {
item.addEventListener('dragstart', handleDragStart);
    });
    
    calendarCells.forEach(cell => {
cell.addEventListener('dragover', handleDragOver);
cell.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const eventIndex = e.dataTransfer.getData('text/plain');
    const event = events[eventIndex];
    
    const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(e.target.textContent));
    event.date = cellDate.toISOString();
    
    saveEvents();
    renderCalendar();
    renderEvents();
}

function showAddEventModal() {
    document.getElementById('modalTitle').textContent = 'Add Event';
    document.getElementById('eventId').value = '';
    document.getElementById('eventModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('eventModal').style.display = 'none';
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventId').value = '';
}