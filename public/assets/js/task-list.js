$(document).ready(function () {
    $('#allTasksTable').DataTable({
        data: taskData,
        columns: [
            {
                data: 'created_at', title: 'Date',
                render: function (data) {
                    const d = new Date(data);
                    return d.toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                    });
                }
            },
            {
                data: 'task_id',
                title: 'Task ID',
                render: function (data, type, row) {
                    return data ? data.toString().toUpperCase() : '';
                }
            },
            {
                data: 'task_type', title: 'Task Tpe'
            },
            {
                data: 'task_start_date', title: 'Sart Date',
                render: function (data) {
                    const d = new Date(data);
                    return d.toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                    });
                }
            },
            { data: 'assigned_to', title: 'Assigned To' },
            { data: 'task', title: 'Task' },
            { data: 'task_weekday', title: 'Task Week Day' },
            { data: 'task_date', title: 'Task Date' },
            {
                title: 'Action',
                render: function (data, type, row) {
                    return `
                    <center>
                        <span class='material-icons text-primary cursor-pointer ms-2' id='editMasterTasks' title='Edit Task' data-bs-toggle='modal' data-bs-target='#editMasterTask'>edit</span>
                        <span class='material-icons text-danger cursor-pointer ms-2' id='deleteMasterTask' title='Delete Task' data-bs-toggle='modal'>delete</span>
                    </center>
                `;
                }
            },


        ],
        scrollX: true, // for horizontal scroll
        order: [[0, 'desc']]
    });



    // Attach event listener to table rows
    $('#allTasksTable tbody').on('click', 'span', function () {
        const table = $('#allTasksTable').DataTable();
        const data = table.row($(this).parents('tr')).data();
        const spanId = $(this).attr('id');

        let mtId = data['task_id'];
        // let Taskname = data[3];
        // let Taskmobile = data[5];

        // $('#invoicejobcardno').val(jcId);
        // $('#invoicecname').val(Taskname);
        // $('#invoicecmobile').val(Taskmobile);
        selectedTask = data;

        if (spanId === "editMasterTasks") {
            editMasterTaskDetail(data, mtId);
        } else if (spanId === "deleteMasterTask") {
            deleteMasterTaskDetails(mtId);
        }
    });

    //-----------------------------User Task table--------------------------

    $('#userTasksTable').DataTable({
        data: taskUserData,
        columns: [
            {
                data: 'created_at', title: 'Date',
                render: function (data) {
                    const d = new Date(data);
                    return d.toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric' 
                    });
                }
            },
            {
                data: 'task_id',
                title: 'Task ID',
                render: function (data, type, row) {
                    return data ? data.toString().toUpperCase() : '';
                }
            },
            {
                data: 'type', title: 'Task Tpe'
            },
            { data: 'assigned_to', title: 'Assigned To' },
            { data: 'task', title: 'Task' },
            { data: 'status', title: 'Status' },
            {
                title: 'Action',
                render: function (data, type, row) {
                    return `
                    <center>
                        <span class='material-icons text-primary cursor-pointer ms-2' id='editUserTasks' title='Edit Task' data-bs-toggle='modal' data-bs-target='#editUserTask'>edit</span>
                    </center>
                `;
                }
            },


        ],
        scrollX: true, // for horizontal scroll
        order: [[0, 'desc']]
    });



    // Attach event listener to table rows
    $('#userTasksTable tbody').on('click', 'span', function () {
        const table = $('#userTasksTable').DataTable();
        const data = table.row($(this).parents('tr')).data();
        const spanId = $(this).attr('id');

        let cId = data['task_id'];
        // let Taskname = data[3];
        // let Taskmobile = data[5];

        // $('#invoicejobcardno').val(jcId);
        // $('#invoicecname').val(Taskname);
        // $('#invoicecmobile').val(Taskmobile);
        selectedTask = data;

        if (spanId === "editUserTasks") {
            editTaskDetail(data, cId);
        } else if (spanId === "deleteTask") {
            // deleteTaskDetails(cId);
        }
    });
});

// ---------------------------User task update ------------------------------------
function editTaskDetail(data, cId) {
    $('#user_task_id').val(cId);
}

//--------------------------update User task -----------------------------------
async function saveUserChanges(event) {
    event.preventDefault();
    toggleOverlay(true);

    const form = document.querySelector('#updateUserTask');
    const formData = new FormData(form);

    const token = $('meta[name="csrf-token"]').attr('content');

    try {
        const response = await fetch(`/task/user/update`, {
            method: 'POST', // ✅ Laravel PUT override with _method
            headers: {
                'X-CSRF-TOKEN': token,
            },
            body: formData
        });

        const result = await response.json();

        // 🔹 Validation error handling
        if (response.status === 422 && result.errors) {
            toggleOverlay(false);
            Object.keys(result.errors).forEach(field => {
                result.errors[field].forEach(err => {
                    toastr.error(err);
                });
            });
            return;
        }

        if (result.success) {
            toggleOverlay(false);
            toastr.success(result.message || "User Task updated successfully.");
            $('#editUserTask').modal('hide');
            setTimeout(() => {
                window.location.href = `/task/list`;
            }, 2500);
        } else {
            toggleOverlay(false);
            toastr.error(result.message || "Failed to update User Task.");
        }
    } catch (err) {
        toggleOverlay(false);
        toastr.error("Unexpected error occurred while saving changes.");
    }
}



//-----------------------------------Master Task Delete function--------------------------------------
function deleteMasterTaskDetails(id) {
    Swal.fire({
        title: "Are you sure?",
        text: `Do you want to delete this task?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6"
    }).then((result) => {
        if (result.isConfirmed) {
            $("div.overlay").addClass("show");

            $.ajax({
                url: `/task/${id}`,  // Route to your Laravel controller
                type: 'DELETE',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')  // CSRF token for security
                },
                success: function (response) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Deleted!",
                        text: `Task ID ${id} has been deleted.`,
                        icon: "success"
                    }).then(() => {
                        urldeliver(`?v=tasklist`);  // Custom redirect or refresh function
                    });
                },
                error: function (xhr) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to delete task. Please try again.",
                        icon: "error"
                    });
                }
            });
        }
    });
}


//-----------------------------------Master Task edit function--------------------------------------


function editMasterTaskDetail(data) {
    $('#edit_task_id').val(data.task_id)
    $('#taskType').val(data.task_type).trigger('change')
    $('#scheduleDate').val(data.task_start_date)
    $('#assignedTo').val(data.assigned_to)
    $('#taskDescription').val(data.task)
    $('#week_day').val(data.task_weekday)
    if (data.task_date) {
        const dateObj = new Date(data.task_date);
        const day = dateObj.getDate(); // gets day 1-31
        $('#month_day').val(day);
    }
}


//-----------------------------------Master Task Update function--------------------------------------

async function saveChanges(event) {
    event.preventDefault();
    toggleOverlay(true);

    const id = $('#updateMasterTask input[name="task_id"]').val();
    const form = document.querySelector('#updateMasterTask');
    const formData = new FormData(form);

    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    const token = $('meta[name="csrf-token"]').attr('content');

    try {
        const response = await fetch(`/task/update/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': token
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        // 🔹 Validation error handling
        if (response.status === 422 && result.errors) {
            toggleOverlay(false);
            Object.keys(result.errors).forEach(field => {
                result.errors[field].forEach(err => {
                    toastr.error(err);
                });
            });
            return;
        }

        if (result.success) {
            toggleOverlay(false);
            toastr.success(result.message || "Master Task updated successfully.");
            $('#editMasterTask').modal('hide');
            setTimeout(() => {
                window.location.href = `/task/list`;
            }, 2500);
        } else {
            toggleOverlay(false);
            toastr.error(result.message || "Failed to update Master Task.");
        }
    } catch (err) {
        toggleOverlay(false);
        toastr.error("Unexpected error occurred while saving changes.");
    }
}
