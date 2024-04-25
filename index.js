// Import helper functions and initial data
import { getTasks, createNewTask, patchTask, deleteTask } from './taskFunctions.js';
import { initialData } from './initialData.js';

// Function to initialize data and setup event listeners
function initializeData() {
    // Check if tasks exist in local storage, if not, load initial data
    if (!localStorage.getItem('tasks')) {
        localStorage.setItem('tasks', JSON.stringify(initialData));
        localStorage.setItem('showSideBar', 'true');
    } else {
        console.log('Data already exists in localStorage');
    }
}

// Get DOM elements
const elements = {
    headerBoardName: document.getElementById('header-board-name'),
    columnDivs: document.querySelectorAll('.column-div'),
    modalWindow: document.getElementById('new-task-modal-window'),
    filterDiv: document.getElementById('filterDiv'),
    editTaskModal: document.querySelector('.edit-task-modal-window'),
    themeSwitch: document.getElementById('switch'),
    createNewTaskBtn: document.getElementById('add-new-task-btn'),
    hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
    showSideBarBtn: document.getElementById('show-side-bar-btn'),
    sideBarDiv: document.getElementById('side-bar-div')
};

let activeBoard = ""; // Variable to store the active board name

// Function to fetch and display boards and tasks
function fetchAndDisplayBoardsAndTasks() {
    const tasks = getTasks(); // Get tasks from local storage
    const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))]; // Extract unique board names
    displayBoards(boards); // Display boards in the sidebar

    // Set active board to the first board or the one stored in localStorage
    if (boards.length > 0) {
        const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
        activeBoard = localStorageBoard || boards[0];
        elements.headerBoardName.textContent = activeBoard; // Display active board name
        styleActiveBoard(activeBoard); // Highlight active board in the sidebar
        refreshTasksUI(); // Refresh tasks UI for the active board
    }
}

// Function to filter and display tasks by board
function filterAndDisplayTasksByBoard(boardName) {
    const tasks = getTasks(); // Get tasks from local storage
    const filteredTasks = tasks.filter(task => task.board === boardName); // Filter tasks by board name

    elements.columnDivs.forEach(column => {
        const status = column.getAttribute("data-status");
        // Reset column content while preserving the column title
        column.innerHTML = `<div class="column-head-div">
                                <span class="dot" id="${status}-dot"></span>
                                <h4 class="columnHeader">${status.toUpperCase()}</h4>
                            </div>`;

        const tasksContainer = document.createElement("div");
        tasksContainer.classList.add("tasks-container");
        column.appendChild(tasksContainer);

        // Display tasks in the corresponding column
        filteredTasks.filter(task => task.status === status).forEach(task => {
            const taskElement = document.createElement("div");
            taskElement.classList.add("task-div");
            taskElement.textContent = task.title; // Display task title
            taskElement.setAttribute('data-task-id', task.id);

            // Listen for click event on task to open edit modal
            taskElement.addEventListener('click', () => {
                openEditTaskModal(task);
            });

            tasksContainer.appendChild(taskElement);
        });
    });
}

// Function to display boards in the sidebar
function displayBoards(boards) {
    const boardsContainer = document.getElementById("boards-nav-links-div");
    boardsContainer.innerHTML = ''; // Clear the container

    // Create and display buttons for each board
    boards.forEach(board => {
        const boardElement = document.createElement("button");
        boardElement.textContent = board;
        boardElement.classList.add("board-btn");
        boardElement.addEventListener('click', () => {
            elements.headerBoardName.textContent = board; // Set active board name
            filterAndDisplayTasksByBoard(board); // Filter and display tasks for the selected board
            activeBoard = board; // Set active board
            localStorage.setItem("activeBoard", JSON.stringify(activeBoard)); // Store active board in local storage
            styleActiveBoard(activeBoard); // Highlight active board in the sidebar
        });
        boardsContainer.appendChild(boardElement);
    });
}

// Function to refresh tasks UI for the active board
function refreshTasksUI() {
    filterAndDisplayTasksByBoard(activeBoard);
}

// Function to style the active board in the sidebar
function styleActiveBoard(boardName) {
    document.querySelectorAll('.board-btn').forEach(btn => {
        if (btn.textContent === boardName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Function to add task to UI
function addTaskToUI(task) {
    const column = document.querySelector(`.column-div[data-status="${task.status}"]`);
    if (!column) {
        console.error(`Column not found for status: ${task.status}`);
        return;
    }

    let tasksContainer = column.querySelector('.tasks-container');
    if (!tasksContainer) {
        console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
        tasksContainer = document.createElement('div');
        tasksContainer.className = 'tasks-container';
        column.appendChild(tasksContainer);
    }

    const taskElement = document.createElement('div');
    taskElement.className = 'task-div';
    taskElement.textContent = task.title; // Modify as needed
    taskElement.setAttribute('data-task-id', task.id);

    taskElement.addEventListener('click', () => {
        openEditTaskModal(task);
    });

    tasksContainer.appendChild(taskElement);
}

// Function to setup event listeners
function setupEventListeners() {
    // Event listener for cancel edit button
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));

    // Event listener for cancel add task button
    const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
    cancelAddTaskBtn.addEventListener('click', () => {
        toggleModal(false);
        elements.filterDiv.style.display = 'none';
        refreshTasksUI(); // Refresh tasks UI
    });

    // Event listener for clicking outside modal to close it
    elements.filterDiv.addEventListener('click', () => {
        toggleModal(false);
        elements.filterDiv.style.display = 'none'; // Hide filter overlay
    });

    // Event listener for showing sidebar
    elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
    elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

    // Event listener for theme switch
    elements.themeSwitch.addEventListener('change', toggleTheme);

    // Event listener for showing add new task modal
    elements.createNewTaskBtn.addEventListener('click', () => {
        toggleModal(true);
        elements.filterDiv.style.display = 'block'; // Show filter overlay
    });

    // Event listener for add new task form submission
    elements.modalWindow.addEventListener('submit', (event) => {
        addTask(event);
    });
}

// Function to toggle modal visibility
function toggleModal(show, modal = elements.modalWindow) {
    modal.style.display = show ? 'block' : 'none';
}

// Function to save task changes
function saveTaskChanges(taskId) {
    const editTaskTitleInput = document.getElementById('edit-task-title-input');
    const editTaskDescInput = document.getElementById('edit-task-desc-input');
    const editSelectStatusTask = document.getElementById('edit-select-status');

    const updatedTask = {
        title: editTaskTitleInput.value,
        description: editTaskDescInput.value,
        status: editSelectStatusTask.value
    };

    patchTask(taskId, updatedTask); // Update task
    toggleModal(false, elements.editTaskModal); // Close modal
    refreshTasksUI(); // Refresh tasks UI
}

// Function to toggle sidebar visibility
function toggleSidebar(show) {
    if (show) {
        elements.sideBarDiv.classList.add('show-sidebar');
        elements.showSideBarBtn.style.display = 'none';
    } else {
        elements.sideBarDiv.classList.remove('show-sidebar');
        elements.showSideBarBtn.style.display = 'block';
    }
    localStorage.setItem('showSideBar', show); // Store sidebar visibility in local storage
}

// Function to toggle theme
function toggleTheme() {
    const isLightTheme = elements.themeSwitch.checked;
    document.body.classList.toggle('light-theme', isLightTheme); // Toggle light theme class
    localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled'); // Store theme choice in local storage
}

// Function to open edit task modal
function openEditTaskModal(task) {
    const editTaskTitleInput = document.getElementById('edit-task-title-input');
    const editTaskDescInput = document.getElementById('edit-task-desc-input');
    const editSelectStatusTask = document.getElementById('edit-select-status');

    const saveTaskChangesBtn = document.getElementById('save-task-changes-btn');
    const deleteTaskBtn = document.getElementById('delete-task-btn');

    editTaskTitleInput.value = task.title;
    editTaskDescInput.value = task.description;
    editSelectStatusTask.value = task.status;

    // Event listener for save task changes button
    saveTaskChangesBtn.addEventListener('click', () => {
        saveTaskChanges(task.id);
    });

    // Event listener for delete task button
    deleteTaskBtn.addEventListener('click', () => {
        deleteTask(task.id);
        toggleModal(false, elements.editTaskModal);
        refreshTasksUI(); // Refresh tasks UI
    });

    toggleModal(true, elements.editTaskModal); // Show edit task modal
}

// Function to clear local storage
function clearLocalStorage() {
    localStorage.clear(); // Clear all data from local storage
}

// Event listener for document load
document.addEventListener('DOMContentLoaded', function () {
    initializeData(); // Initialize data and setup event listeners
    setupEventListeners();
    const showSidebar = localStorage.getItem('showSideBar') === 'true';
    toggleSidebar(showSidebar); // Toggle sidebar visibility
    const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
    document.body.classList.toggle('light-theme', isLightTheme); // Apply theme
    fetchAndDisplayBoardsAndTasks(); // Fetch and display boards and tasks
});
