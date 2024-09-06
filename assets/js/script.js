// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: Create a function to generate a unique task id
function generateTaskId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);  
}

// Todo: Create a function to create a task card
function createTaskCard(task) {
    let taskCard = `
        <div class="task-card card mb-3 draggable" id="${task.id}">
            <div class="card-title strong mt-2">
                <h4><strong>${task.taskTitle}</strong></h4>
            </div>
            <div class="form-control hasDatePicker bg-transparent">
                <p>Date: ${task.taskDate}</p>
            </div>
            <div class="card-body">
                <p>${task.taskDescription}</p>
            </div>
            <div class="align-items-center mb-3">
                <button class="btn col-4 .m-3 btn-danger delete-btn border-light">Delete</button>
            </div>
        </div>
    `;

    const dueDate = new Date(task.taskDate);
    const currentDate = new Date();
    const timeDiff = dueDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const dueDateField = $(taskCard).find('.form-control.hasDatePicker');
    dueDateField.addClass("text-white");

     switch (true) {
        case (task.status === "done"):
            console.log("case: task.status === 'done'");
            taskCard = $(taskCard).addClass("bg-success text-white");
            break;

        case (daysDiff < 0):
            console.log("case: daysDiff < 0, daysDiff: ", daysDiff);
            taskCard = $(taskCard).addClass("bg-danger text-white");
            break;

        case (daysDiff < 2):
            console.log("case: daysDiff < 2>, daysDiff: ", daysDiff);
            taskCard = $(taskCard).addClass("bg-warning text-white");
            break;
    
        default:
            console.log("default: daysDiff: ", daysDiff);
            taskCard = $(taskCard).addClass("bg-info text-dark");
            break;
    }

    return taskCard;
}

// Todo: Create a function to render the task list and make cards draggable
function renderTaskList() {
    $("#todo-cards").empty();
    $("#in-progress-cards").empty();
    $("#done-cards").empty();

    taskList.forEach(task => {
        const taskCard = createTaskCard(task);
        $(`#${task.status}-cards`).append(taskCard);
    });

    $(".delete-btn").click(function () {
        const cardId = $(this).closest(".task-card").attr("id");
        taskList = taskList.filter(task => task.id !== cardId);
        localStorage.setItem("tasks", JSON.stringify(taskList));
        $(this).closest(".task-card").remove();
    });

    $(".draggable").draggable({
        snap: true,
        snapMode: "inner",
        snapTolerance: 20,
        zIndex: 1000
    });
}

// Todo: Create a function to handle adding a new task
function handleAddTask(event){
    event.preventDefault();
    let taskTitle = $("#taskTitleInput").val().trim();
    let taskDate = $("#taskDateInput").val().trim();
    let taskDescription = $("#taskDescriptionInput").val().trim();

    if(taskTitle && taskDate && taskDescription) {

        let taskData = {
            id: generateTaskId(),
            taskTitle: taskTitle,
            taskDate: taskDate,
            taskDescription: taskDescription,
            status: "todo"
        };

        taskList.push(taskData);
        localStorage.setItem("tasks", JSON.stringify(taskList));
        renderTaskList();
        $("#formModal").modal("hide");
    }    
}

// Todo: Create a function to handle deleting a task
function handleDeleteTask(){
    $(".delete-btn").click(function () {
        const cardId = $(this).closest(".task-card").attr("id");
        taskList = taskList.filter(task => task.id !== cardId);
        localStorage.setItem("tasks", JSON.stringify(taskList));
        $(this).closest(".task-card").remove();
    });
}

// Todo: Create a function to handle dragging and dropping a task into a new status lane
function handleDrop(event, ui) {
    const draggedCard = ui.draggable;
    const changedLaneId = $(this).attr("id");
    const taskId = draggedCard.attr("id");
    const taskIndex = taskList.findIndex(task => task.id === taskId);
    const newStatus = event.target.id;

    console.log("new Status", newStatus);

    if (taskIndex !== -1) {
        const currentStatus = taskList[taskIndex].status;
        taskList[taskIndex].status = changedLaneId.replace("-cards", "");

        localStorage.setItem("tasks", JSON.stringify(taskList));

        console.log("Current Status:", currentStatus);
        console.log("New Status:", taskList[taskIndex].status);

        renderTaskList();
    }
}

// Todo: When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();
    $("#addTaskButton").click(handleAddTask);
    handleDeleteTask();

    $(".lane").droppable({
        accept: ".draggable",
        drop: handleDrop
    });
});