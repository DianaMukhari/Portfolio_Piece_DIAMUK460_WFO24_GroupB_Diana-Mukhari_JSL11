// TASK: import helper functions from utils
import { getTasks, createNewTask, patchTask, deleteTask } from './taskFunctions.js';
// TASK: import initialData
import { initialData } from './initialData.js';

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData));
    localStorage.setItem('showSideBar', 'true');
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
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


let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(board => board))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard || boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    filterAndDisplayTasksByBoard(activeBoard); // Fixing to display tasks for the active board
  }
  function filterAndDisplayTasksByBoard(boardName) {
    const tasks = getTasks();
  
    elements.columnDivs.forEach(column => {
      const status = column.getAttribute("data-status");
      const tasksContainer = column.querySelector('.tasks-container');
      
      // Clear existing tasks
      tasksContainer.innerHTML = '';
  
      tasks
        .filter(task => task.board === boardName && task.status === status)
        .forEach(task => {
          const taskElement = document.createElement("div");
          taskElement.classList.add("task-div");
          taskElement.textContent = task.title;
          taskElement.setAttribute('data-task-id', task.id);
          taskElement.addEventListener('click', () => {
            openEditTaskModal(task);
          });
          tasksContainer.appendChild(taskElement);
        });
    });
  }
}
  // TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clear the container before adding boards
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board;
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}
      // Toggles tasks modal
// Task: Fix bugs
// Refresh the UI when a task is clicked
function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs

function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === boardName);
  });
}

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



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none';
    refreshTasksUI; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });
//display task info in the modal when task is clicked
  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit', (event) => {
    addTask(event);
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none';
}


/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();

  //Assign user input to the task object
  const task = {
    title: event.target.elements['title-input'].value,
    description: event.target.elements['desc-input'].value,
    status: event.target.elements['select-status'].value,
    board: activeBoard
  };

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
}

function toggleSidebar(show) {
  if (show) {
    elements.sideBarDiv.classList.add('show-sidebar');
    elements.showSideBarBtn.style.display = 'none';
  } else {
    elements.sideBarDiv.classList.remove('show-sidebar');
    elements.showSideBarBtn.style.display = 'block';
  }
  localStorage.setItem('showSideBar', show);
}

function toggleTheme() {
  const isLightTheme = elements.themeSwitch.checked;
  document.body.classList.toggle('light-theme', isLightTheme);
  localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled');
}

   
function openEditTaskModal(task) {
  // Get input elements from the task modal
  const editTaskTitleInput = document.getElementById('edit-task-title-input');
  const editTaskDescInput = document.getElementById('edit-task-desc-input');
  const editSelectStatusTask = document.getElementById('edit-select-status');

  // Get button elements from the task modal
  const saveTaskChangesBtn = document.getElementById('save-task-changes-btn');
  const deleteTaskBtn = document.getElementById('delete-task-btn');

  // Set task details in modal inputs
  editTaskTitleInput.value = task.title;
  editTaskDescInput.value = task.description;
  editSelectStatusTask.value = task.status;

  // Call saveTaskChanges upon click of Save Changes button
  saveTaskChangesBtn.addEventListener('click', () => {
    saveTaskChanges(task.id);
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI(); // Refresh the UI after saving changes
  });

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.addEventListener('click', () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI(); // Refresh the UI after deleting the task
  });

  // Show the edit task modal
  toggleModal(true, elements.editTaskModal);
}

 

  

function saveTaskChanges(taskId) {
  // Get new user inputs
  const editTaskTitleInput = document.getElementById('edit-task-title-input').value;
  const editTaskDescInput = document.getElementById('edit-task-desc-input').value;
  const editSelectStatusTask = document.getElementById('edit-select-status').value;

  // Create an object with the updated task details
  const updatedTask = {
    title: editTaskTitleInput,
    description: editTaskDescInput,
    status: editSelectStatusTask
  };

  // Update task using a helper function
  patchTask(taskId, updatedTask);

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}
/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData(); // Initialize data in localStorage
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}