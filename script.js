const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const clearBtn = document.getElementById('clearBtn');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const progressBar = document.getElementById('progressBar');
const prioritySelect = document.getElementById('prioritySelect');
const toggleTheme = document.getElementById('toggleTheme');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
tasks.forEach(taskObj => addTaskToDOM(taskObj));
updateProgress();

// Add task
addBtn.addEventListener('click', () => {
    const taskText = taskInput.value.trim();
    const priority = prioritySelect.value;
    if (taskText) {
        const taskObj = { text: taskText, completed: false, priority: priority };
        tasks.push(taskObj);
        addTaskToDOM(taskObj);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        taskInput.value = '';
    } else {
        alert('Task cannot be empty!');
    }
});

// Clear all tasks
clearBtn.addEventListener('click', () => {
    if (confirm("Delete all tasks?")) {
        tasks = [];
        taskList.innerHTML = '';
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateProgress();
    }
});

// Search tasks
searchInput.addEventListener('input', () => {
    const filter = searchInput.value.toLowerCase();
    Array.from(taskList.children).forEach(li => {
        const text = li.firstChild.textContent.toLowerCase();
        li.style.display = text.includes(filter) ? 'flex' : 'none';
    });
});

// Toggle dark/light mode
toggleTheme.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    toggleTheme.textContent = document.body.classList.contains('dark') ? '☀ Light Mode' : '🌙 Dark Mode';
});

// Drag & Drop sorting
let draggedItem = null;
taskList.addEventListener('dragstart', (e) => {
    draggedItem = e.target;
});
taskList.addEventListener('dragover', (e) => e.preventDefault());
taskList.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.target.tagName === 'LI' && draggedItem) {
        const rect = e.target.getBoundingClientRect();
        const offset = e.clientY - rect.top;
        if (offset > rect.height / 2) {
            e.target.after(draggedItem);
        } else {
            e.target.before(draggedItem);
        }
        draggedItem = null;
        saveOrder();
    }
});

// Add task to DOM
function addTaskToDOM(taskObj) {
    const li = document.createElement('li');
    li.textContent = taskObj.text;
    li.classList.add(taskObj.priority.toLowerCase());
    li.setAttribute('draggable', true);
    if (taskObj.completed) li.classList.add('completed');

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('task-buttons');

    const completeBtn = document.createElement('button');
    completeBtn.textContent = '✓';
    completeBtn.classList.add('complete-btn');
    completeBtn.addEventListener('click', () => {
        li.classList.toggle('completed');
        taskObj.completed = !taskObj.completed;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateProgress();
    });

    const editBtn = document.createElement('button');
    editBtn.textContent = '✎';
    editBtn.classList.add('edit-btn');
    editBtn.addEventListener('click', () => {
        const newText = prompt("Edit task:", taskObj.text);
        if (newText && newText.trim() !== "") {
            taskObj.text = newText.trim();
            li.firstChild.textContent = taskObj.text;
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', () => {
        li.remove();
        tasks = tasks.filter(t => t !== taskObj);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateProgress();
    });

    buttonContainer.appendChild(completeBtn);
    buttonContainer.appendChild(editBtn);
    buttonContainer.appendChild(deleteBtn);

    li.appendChild(buttonContainer);
    taskList.appendChild(li);
    updateProgress();
}

// Save current order after drag
function saveOrder() {
    const newTasks = [];
    Array.from(taskList.children).forEach(li => {
        const text = li.firstChild.textContent;
        const taskObj = tasks.find(t => t.text === text);
        if (taskObj) newTasks.push(taskObj);
    });
    tasks = newTasks;
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Update progress bar
function updateProgress() {
    if (tasks.length === 0) {
        progressBar.style.width = '0%';
        return;
    }
    const completed = tasks.filter(t => t.completed).length;
    const percent = (completed / tasks.length) * 100;
    progressBar.style.width = percent + '%';
}
