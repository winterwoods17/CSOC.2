let time = document.getElementById("current-time");
setInterval(() => {
    let d = new Date();
    time.innerHTML = d.toLocaleTimeString();    
}, 1000);

const projectInput = document.getElementById('projectInput');
const projectDateInput = document.getElementById('projectDate');
const addProjectButton = document.getElementById('addProjectButton');
const projectList = document.getElementById('projectList');
let currentProjectId = null;

const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const taskList = document.getElementById('taskList');
let tasks = {}; 

addProjectButton.addEventListener('click', () => {
    addProject();
    updateEfficiencyMetrics();
});

function addProject() {
    const projectText = projectInput.value.trim();
    const projectDate = projectDateInput.value.trim();

    if (projectText !== '') {
        const listItem = document.createElement('li');
        
        const projectSpan = document.createElement('span');
        projectSpan.textContent = projectText + (projectDate ? ` (Due: ${projectDate})` : '');
        listItem.appendChild(projectSpan);
        
        const projectId = Date.now().toString(); 
        tasks[projectId] = { name: projectText, date: projectDate, tasks: [] }; 

        const selectButton = document.createElement('button');
        selectButton.textContent = 'Select';
        selectButton.classList.add('select');
        selectButton.onclick = () => {
            document.querySelectorAll('#projectList li').forEach(item => item.classList.remove('active'));
            listItem.classList.add('active');
            currentProjectId = projectId;
            renderTasks();
        };
        listItem.appendChild(selectButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete');
        deleteButton.onclick = () => {
            const projectTasksCount = tasks[projectId].tasks.length;
            delete tasks[projectId];
            projectList.removeChild(listItem);
            if (currentProjectId === projectId) {
                taskList.innerHTML = '';
                currentProjectId = null;
            }
            projectsInProgress--;
            tasksInProgress -= projectTasksCount;
            updateEfficiencyMetrics();
            renderDeadlines();
        };
        listItem.appendChild(deleteButton);

        const completeButton = document.createElement('button');
        completeButton.textContent = 'Complete';
        completeButton.classList.add('complete');
        completeButton.onclick = () => {
            if (confirm('Are you sure you want to mark this project as completed?')) {
                const projectTasksCount = tasks[projectId].tasks.length;
                projectsInProgress--;
                projectsCompleted++;
                delete tasks[projectId];
                projectList.removeChild(listItem);
                if (currentProjectId === projectId) {
                    taskList.innerHTML = '';
                    currentProjectId = null;
                }
                tasksInProgress -= projectTasksCount;
                updateEfficiencyMetrics();
                renderDeadlines();
            }
        };
        listItem.appendChild(completeButton);

        projectList.appendChild(listItem);

        projectInput.value = '';
        projectDateInput.value = '';
        
        projectsInProgress++;
        updateEfficiencyMetrics();
        renderDeadlines();
    }
}

addTaskButton.addEventListener('click', () => {
    addTask();
    updateEfficiencyMetrics();
});

function addTask() {
    if (!currentProjectId) {
        alert('Please select a project first!');
        return;
    }

    const taskText = taskInput.value.trim();

    if (taskText !== '') {
        tasks[currentProjectId].tasks.push({ text: taskText, completed: false });
        renderTasks();

        taskInput.value = '';
    }
}

function renderTasks() {
    taskList.innerHTML = '';
    if (tasks[currentProjectId]) {
        tasks[currentProjectId].tasks.forEach((task, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = task.text;

            const completeButton = document.createElement('button');
            completeButton.textContent = task.completed ? 'Undo' : 'Complete';
            completeButton.classList.add('complete');
            completeButton.onclick = () => {
                task.completed = !task.completed;
                renderTasks();
                updateEfficiencyMetrics();
            };
            listItem.appendChild(completeButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete');
            deleteButton.onclick = () => {
                tasks[currentProjectId].tasks.splice(index, 1);
                renderTasks();
                updateEfficiencyMetrics();
            };
            listItem.appendChild(deleteButton);

            taskList.appendChild(listItem);
        });
    }
}

let projectsInProgress = 0;
let tasksInProgress = 0;
let projectsCompleted = 0;

function updateEfficiencyMetrics() {
    tasksInProgress = Object.values(tasks).flatMap(project => project.tasks).filter(task => !task.completed).length;

    document.getElementById('projectsInProgress').textContent = `Projects in Progress: ${projectsInProgress}`;
    document.getElementById('tasksInProgress').textContent = `Tasks in Progress: ${tasksInProgress}`;
    document.getElementById('projectsCompleted').textContent = `Projects Completed: ${projectsCompleted}`;
}

function daysUntil(deadlineDate) {
    const today = new Date();
    const deadline = new Date(deadlineDate);
    const timeDiff = deadline - today;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

function renderDeadlines() {
    const deadlineList = document.getElementById('deadlineList');
    deadlineList.innerHTML = '';

    const sortedProjects = Object.entries(tasks).sort((a, b) => {
        const dateA = new Date(a[1].date || '9999-12-31');
        const dateB = new Date(b[1].date || '9999-12-31');
        return dateA - dateB;
    });

    sortedProjects.forEach(([projectId, projectData]) => {
        const listItem = document.createElement('tr');
        const daysLeft = daysUntil(projectData.date);

        listItem.innerHTML = `
            <td>${projectData.name}</td>
            <td>${projectData.date || 'No Deadline'}</td>
            <td>${daysLeft >= 0 ? daysLeft + ' days left' : 'Overdue'}</td>
        `;
        deadlineList.appendChild(listItem);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderDeadlines();
});


