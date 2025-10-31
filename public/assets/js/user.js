$(document).ready(function () {

    //--------------------------- New user create-----------------------
    $('#add_user_form').on('submit', function (e) {
        e.preventDefault();
        toggleOverlay(true);

        $.ajax({
            url: '/user/store',
            type: 'POST',
            data: $(this).serialize(),
            dataType: 'json',
            success: function (response) {
                toggleOverlay(false);
                if (response.success) {
                    toastr.success(response.message || 'User created.');
                    $('#add_user_form')[0].reset();
                    setTimeout(function () {
                        window.location.href = '/user/User';
                    }, 4000);
                } else if (response && response.errors) {
                    Object.keys(response.errors).forEach(function (key) {
                        toastr.error(response.errors[key][0]);
                    });
                } else {
                    toastr.error(response.message || 'Unexpected response.');
                }
            },
            error: function (xhr) {
                toggleOverlay(false);

                if (xhr.status === 422 && xhr.responseJSON && xhr.responseJSON.errors) {
                    const errors = xhr.responseJSON.errors;
                    Object.keys(errors).forEach(function (key) {
                        toastr.error(errors[key][0]);
                    });
                    return;
                } else {
                    const msg =
                        (xhr.responseJSON && (xhr.responseJSON.message || xhr.responseJSON.error)) ||
                        xhr.statusText || 'Something went wrong.';
                    toastr.error(msg);
                }
            }
        });
    });


    // -------------------update user -----------------
    $('#update_user_form').on('submit', function (e) {
        e.preventDefault();
        toggleOverlay(true);

        const id = $('#update_id').val();

        $.ajax({
            url: `/user/update/${id}`,
            type: 'POST',
            data: $(this).serialize(),
            success: function (response) {
                toggleOverlay(false);
                if (response.success) {
                    toastr.success(response.message);
                    $('#update_user_form')[0].reset();
                    setTimeout(function () {
                        window.location.href = `/user/User`;
                    }, 4000);
                } else {
                    toastr.error('Unexpected response.');
                }
            },
            error: function (xhr) {
                toggleOverlay(false);
                if (xhr.status === 422) {
                    const errors = xhr.responseJSON.errors;
                    for (let field in errors) {
                        toastr.error(errors[field][0]);
                        break; // Show only first error
                    }
                } else {
                    toastr.error('Something went wrong.');
                }
            }
        });
    });

    // =============================== User datatable ================================
    $('#allUsersTable').DataTable({
        data: UserData,
        columns: [
            {
                data: 'id',
                title: 'User ID'
            },
            {
                data: 'created_at', title: 'Date'
            },
            { data: 'name', title: 'Name' },
            { data: 'phone', title: 'Mobile' },
            { data: 'email', title: 'Email' },
            { data: 'designation', title: 'Designation' },
            { data: 'department', title: 'Department' },
            { data: 'username', title: 'Username' },
            {
                data: 'send_password', title: 'Password',
                render: function (data, type, row, meta) {
                    return '********'; // Or str_repeat equivalent in JS
                }
            },
            {
                data: 'expiry', title: 'Expiry',
                render: function (data) {
                    const d = new Date(data);
                    return d.toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', hour12: true
                    });
                }
            },
            { data: 'commission', title: 'Commission' },
            {
                data: 'otp_login',
                title: 'OTP',
                render: function (data) {
                    return data == 1 ? 'Enable' : 'Disable';
                }
            },
            {
                title: 'Actions',
                render: function (data, type, row) {
                    let buttons = `
                        <center>
                                <span class='material-icons text-black cursor-pointer ms-2'
                                    id='editUsers'
                                    title='Edit User'
                                    data-bs-toggle='modal'>
                                    speaker_notes
                                </span>`;

                    if (DeleteUser) {
                        buttons += `
                                <span class='material-icons text-danger cursor-pointer ms-2'
                                    id='deleteUser'
                                    title='Delete User'
                                    data-bs-toggle='modal'>
                                    delete
                                </span>`;
                    }

                    // 🔑 Add Toggle OTP button
                    let otpClass = row.otp_login ? "text-danger" : "text-success";
                    let otpText = row.otp_login ? "lock_open" : "key";

                    buttons += `
                                <span class="material-icons cursor-pointer ms-2 ${otpClass}"
                                        id="toggleOtpBtn"
                                        title="Toggle 2FA">
                                    ${otpText}
                                </span>
                        </center>`;
                    return buttons;
                }
            }

        ],
        scrollX: true // for horizontal scroll
    });



    // Attach event listener to table rows
    $('#allUsersTable tbody').on('click', 'span', function () {
        const table = $('#allUsersTable').DataTable();
        const data = table.row($(this).parents('tr')).data();
        const spanId = $(this).attr('id');

        let cId = data['id'];
        let Username = data[3];
        let Usermobile = data[4];

        // $('#invoicejobcardno').val(jcId);
        // $('#invoicecname').val(Username);
        // $('#invoicecmobile').val(Usermobile);
        selectedUser = data;


        // Select Action ka current value check karo
        const currentTask = $('#taskType').val();

        // Agar Update Employee mode pe ho to hi form ka kaam kare
        if (currentTask === 'update' && data) {
            $('#update_user_select').val(data.id).trigger('change');
        }


        if (spanId === "editUsers") {
            editUserDetail(cId);
        } else if (spanId === "deleteUser") {
            deleteUserDetails(cId);
        } else if (spanId === "toggleOtpBtn") {
            toggleUserOpt(cId);
        }
    });




    //------------------------------------------------------------------------------
    $('#taskType').on('change', function () {
        const selected = $(this).val();

        if (selected === 'new') {
            $('#add_user').show();
            $('#update_user_list').hide();
            $('#update_user').hide();
        } else if (selected === 'update') {
            $('#add_user').hide();
            $('#update_user_list').show();
            $('#update_user').hide();
            populateUserList(UserData); // 👈 populate dropdown
        }
    });

    function populateUserList(users) {
        const $dropdown = $('#update_user_select');
        $dropdown.empty().append('<option selected disabled>Select User</option>');
        users.forEach(user => {
            $dropdown.append(`<option value="${user.id}">${user.name}</option>`);
        });
    }


    // When a user is selected in update dropdown
    $('#update_user_select').on('change', function () {
        const userId = $(this).val();
        const user = UserData.find(u => u.id == userId);
        if (user) {
            fillUpdateUserForm(user);
            $('#update_user').show();
        }
    });

    function fillUpdateUserForm(user) {

        $('#update_id').val(user.id);
        $('#update_name').val(user.name);
        $('#update_mobile').val(user.phone);
        $('#update_email').val(user.email);
        $('#update_password').val(user.send_password);
        $('#update_designation').val(user.designation);
        $('#update_department').val(user.department);
        $('#update_username').val(user.username);
        $('#update_expiry').val(formatDateTime(user.expiry));
        $('#update_commission').val(user.commission);
    }

    function formatDateTime(dateString) {
        // Convert to YYYY-MM-DDTHH:mm for datetime-local input
        const d = new Date(dateString);
        const pad = n => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }


});


function editUserDetail(cId) {
    toggleOverlay(true); // Agar loading dikhani ho

    $.ajax({
        url: `/user/send-password-mail/${cId}`, // ID URL me bhej rahe hain
        type: 'POST',
        data: {
            _token: $('meta[name="csrf-token"]').attr('content') // CSRF token
        },
        success: function (response) {
            toggleOverlay(false);
            if (response.status === 'success') {
                toastr.success(response.message);
            } else {
                toastr.error(response.message || 'Unexpected response.');
            }
        },
        error: function (xhr) {
            toggleOverlay(false);
            if (xhr.status === 422) {
                const errors = xhr.responseJSON.errors;
                for (let field in errors) {
                    toastr.error(errors[field][0]);
                    break;
                }
            } else {
                toastr.error(xhr.responseJSON?.message || 'Something went wrong.');
            }
        }
    });
}


function deleteUserDetails(id) {
    Swal.fire({
        title: "Are you sure?",
        text: `You are about to delete User data: ${id}`,
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
                url: `/user/delete/${id}`,  // Route to your Laravel controller
                type: 'DELETE',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')  // CSRF token for security
                },
                success: function (response) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Deleted!",
                        text: `User ID ${id} has been deleted.`,
                        icon: "success"
                    }).then(() => {
                        urldeliver(`?v=userlist`);  // User redirect or refresh function
                    });
                },
                error: function (xhr) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to delete User. Please try again.",
                        icon: "error"
                    });
                }
            });
        }
    });
}


function toggleUserOpt(id) {
    Swal.fire({
        title: "Are you sure?",
        text: `You are about to toggle OTP for User ID: ${id}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, change it!",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33"
    }).then((result) => {
        if (result.isConfirmed) {
            $("div.overlay").addClass("show");

            $.ajax({
                url: `/users/${id}/toggle-otp`,  // 👈 OTP toggle route
                type: 'patch',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')
                },
                success: function (response) {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Updated!",
                        text: `OTP status for User ID ${id} has been updated.`,
                        icon: "success"
                    }).then(() => {
                        urldeliver(`?v=userlist`);  // Refresh user list
                    });
                },
                error: function () {
                    $("div.overlay").removeClass("show");
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to update OTP status. Please try again.",
                        icon: "error"
                    });
                }
            });
        }
    });
}
