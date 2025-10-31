@extends('layouts.app')

@section('content')
@include('layouts.content-navigation')

<div id="content">
<div class="container py-4">

    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold">User Management</h2>

            <div class="d-flex gap-2">
                <button type="button" class="btn btn-primary" id="openCreateUserModal">
                    + Create User
                </button>

                <button type="button" class="btn btn-success" id="openCreateRoleModal">
                    + Create Custom Role
                </button>
            </div>
        </div>

    <!-- User Table -->
    <div class="card shadow-sm">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-dark">
                    <tr>
                        <th>Name</th>
                        <th>Mobile</th>
                        <th>Email</th>
                        <th>Roles</th>
                        <th class="text-center">Status</th>
                        <th class="text-center">OTP</th>
                        <th>Assigned Locations</th>
                        <th>Last Login</th>
                        <th class="text-center">Actions</th>
                    </tr>
                </thead>

                <tbody>
                @foreach($users as $user)
                    <tr>
                        <td>
                            <a href="#" class="text-primary fw-semibold text-decoration-none">
                                {{ $user->name }}
                            </a>
                        </td>

                        <td>{{ $user->mobile }}</td>
                        <td>{{ $user->email ?? '—' }}</td>

                        <td>
                            @forelse($user->roles as $role)
                                <span class="badge bg-primary me-1">{{ $role->name }}</span>
                            @empty
                                <span class="text-muted small">No Roles</span>
                            @endforelse
                        </td>

                        <td class="text-center">
                            <span class="badge toggle-status cursor-pointer {{ $user->status ? 'bg-success' : 'bg-danger' }}"
                                data-id="{{ $user->id }}">
                                {{ $user->status ? 'Active' : 'Disabled' }}
                            </span>
                        </td>

                        <td class="text-center">
                            <span class="badge toggle-otp cursor-pointer {{ $user->otp_required ? 'bg-success' : 'bg-secondary' }}"
                                data-id="{{ $user->id }}">
                                {{ $user->otp_required ? 'Yes' : 'No' }}
                            </span>
                        </td>

                        <td><span class="text-muted small">TBD</span></td>

                        <td class="text-muted small">
                            {{ $user->last_login_at ? \Carbon\Carbon::parse($user->last_login_at)->diffForHumans() : 'Never' }}
                        </td>

                        <td class="text-center">
                            <div class="btn-group" role="group">

                                <!-- Edit -->
                                <a href="{{ route('users.edit', $user->id) }}"
                                class="btn btn-sm" title="Edit User">
                                    <i class="fas fa-edit"></i>
                                </a>

                                <!-- Reset Password -->
                                <a href="javascript:void(0)"
                                    class="btn btn-sm btn-reset-password 
                                            {{ $user->force_password_reset ? 'btn-danger' : 'btn-success' }}"
                                    data-id="{{ $user->id }}"
                                    title="{{ $user->force_password_reset ? 'Reset Already Applied' : 'Reset Password' }}">
                                        <i class="fas fa-unlock-alt"></i>
                                </a>


                                <!-- Assign Roles -->
                                <a href="javascript:void(0)"
                                    class="btn btn-sm btn-info btn-assign-roles"
                                    data-id="{{ $user->id }}"
                                    title="Assign Roles">
                                        <i class="fas fa-user-shield"></i>
                                </a>
                                <!-- Assign Locations -->
                                <a href="#"
                                class="btn btn-sm" title="Assign Locations">
                                    <i class="fas fa-map-marker-alt"></i>
                                </a>

                                <!-- View Activity Logs -->
                                <a href="#"
                                class="btn btn-sm" title="View Logs">
                                    <i class="fas fa-history"></i>
                                </a>

                            </div>
                        </td>
                    </tr>
                @endforeach
                </tbody>

            </table>

            <!-- 🔐 Reset Password Modal -->
            <div class="modal fade" id="resetPasswordModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">

                        <div class="modal-header bg-warning">
                            <h5 class="modal-title"><i class="fas fa-unlock-alt me-2"></i>Reset Password</h5>
                            <button class="btn-close" data-bs-dismiss="modal"></button>
                        </div>

                        <div class="modal-body">
                            <p class="mb-0">Are you sure you want to force password reset for this user?</p>
                        </div>

                        <div class="modal-footer">
                            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button class="btn btn-warning" id="confirmResetPassword">Reset</button>
                        </div>

                    </div>
                </div>
            </div>

            <!-- Assign Roles Modal -->
            <div class="modal fade" id="assignRolesModal" tabindex="-1">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content">
                        
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title"><i class="fas fa-user-shield me-2"></i>Assign Roles</h5>
                            <button class="btn-close" data-bs-dismiss="modal"></button>
                        </div>

                        <div class="modal-body">

                            <div id="rolesList">
                                <p class="text-center text-muted">Loading roles...</p>
                            </div>

                        </div>

                        <div class="modal-footer">
                            <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button class="btn btn-primary" id="saveRolesBtn">Save Changes</button>
                        </div>

                    </div>
                </div>
            </div>


            <!-- Create Role Modal -->
            <div class="modal fade" id="createRoleModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">

                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-plus-circle me-2"></i>Create Custom Role
                            </h5>
                            <button class="btn-close" data-bs-dismiss="modal"></button>
                        </div>

                        <div class="modal-body">
                            <label class="form-label">Role Name</label>
                            <input type="text" id="roleName" class="form-control" placeholder="Enter new role name">
                            <small id="roleError" class="text-danger d-none"></small>
                        </div>

                        <div class="modal-footer">
                            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button class="btn btn-success" id="saveRoleBtn">Save</button>
                        </div>

                    </div>
                </div>
            </div>


            <!-- Create User Modal -->
            <div class="modal fade" id="createUserModal" tabindex="-1">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content">

                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title"><i class="fas fa-user-plus me-2"></i>Create User</h5>
                            <button class="btn-close" data-bs-dismiss="modal"></button>
                        </div>

                        <div class="modal-body">

                            <form id="createUserForm">

                                @csrf

                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label fw-semibold">Full Name</label>
                                        <input type="text" name="name" class="form-control"
                                            placeholder="Enter name">
                                        <span class="text-danger small error-text name_error"></span>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <label class="form-label fw-semibold">Mobile</label>
                                        <input type="text" name="mobile" class="form-control"
                                            placeholder="Enter mobile number">
                                        <span class="text-danger small error-text mobile_error"></span>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <label class="form-label fw-semibold">Email</label>
                                        <input type="email" name="email" class="form-control"
                                            placeholder="Enter email">
                                        <span class="text-danger small error-text email_error"></span>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <label class="form-label fw-semibold">Password</label>
                                        <input type="password" name="password" class="form-control"
                                            placeholder="Enter password">
                                        <span class="text-danger small error-text password_error"></span>
                                    </div>

                                    <div class="col-md-12 mb-3">
                                        <label class="form-label fw-semibold">Assign Roles</label>
                                        <div class="row">
                                            @foreach($roles as $role)
                                                <div class="col-md-3 mb-2">
                                                    <div class="form-check">
                                                        <input class="form-check-input"
                                                            type="checkbox"
                                                            name="roles[]"
                                                            value="{{ $role->name }}">
                                                        <label class="form-check-label text-dark">
                                                            {{ ucfirst($role->name) }}
                                                        </label>
                                                    </div>
                                                </div>
                                            @endforeach
                                        </div>
                                        <span class="text-danger small error-text roles_error"></span>
                                    </div>

                                </div>

                            </form>

                        </div>

                        <div class="modal-footer">
                            <button class="btn btn-secondary" data-bs-dismiss="modal">
                                Cancel
                            </button>
                            <button class="btn btn-primary" id="saveUserBtn">
                                Save User
                            </button>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    </div>

    <!-- Pagination -->
    <div class="mt-3">
        {{ $users->links() }}
    </div>

</div>
</div>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script>
    $(document).on('click', '.toggle-status', function () {
    const userId = $(this).data('id');
    $.ajax({
        url: `/admin/users/${userId}/toggle-status`,
        method: 'GET',
        success: function (res) {
            toastr.success("User status updated");
            location.reload();
        },
        error: function () {
            toastr.error("Failed to update status");
        }
    });
});

// Toggle OTP
$(document).on('click', '.toggle-otp', function () {
    const userId = $(this).data('id');
    $.ajax({
        url: `/admin/users/${userId}/toggle-otp`,
        method: 'GET',
        success: function () {
            toastr.success("OTP setting updated");
            location.reload();
        },
        error: function () {
            toastr.error("Failed to update OTP setting");
        }
    });
});

// Reset Forced Password field

let selectedUserId = null;

$(document).on('click', '.btn-reset-password', function () {
    selectedUserId = $(this).data('id');
    $('#resetPasswordModal').modal('show');
});

$('#confirmResetPassword').on('click', function () {
    $.ajax({
        url: `/admin/users/${selectedUserId}/reset-password`,
        method: 'POST',
        data: {
            _token: "{{ csrf_token() }}"
        },
        success: function () {
            toastr.success("Password reset flag applied");
            $('#resetPasswordModal').modal('hide');
            setTimeout(() => location.reload(), 700);
        },
        error: function () {
            toastr.error("Failed to reset password");
        }
    });
});

// Assign Roles Model

// Open the Assign Role modal
let selectedUser = null;

$(document).on('click', '.btn-assign-roles', function () {
    selectedUser = $(this).data('id');

    $("#rolesList").html('<p class="text-center text-muted">Loading roles...</p>');
    $("#assignRolesModal").modal('show');

    // Fetch Roles From the roles table
    $.get(`/admin/roles/${selectedUser}/assign`, function (res) {
        let rolesHtml = '';
        res.roles.forEach(role => {
            const assigned = res.assignedRoles.includes(role.name) ? 'checked' : '';
            rolesHtml += `
                <div class="form-check">
                    <input class="form-check-input role-checkbox" type="checkbox" value="${role.name}" ${assigned}>
                    <label class="form-check-label">${role.name}</label>
                </div>`;
        });
        $("#rolesList").html(rolesHtml);
    });
});

// Save the updated role
$("#saveRolesBtn").on('click', function () {
    const roles = [];
    $(".role-checkbox:checked").each(function () {
        roles.push($(this).val());
    });

    $.ajax({
        url: `/admin/roles/${selectedUser}/assign`,
        method: "POST",
        data: {
            roles: roles,
            _token: "{{ csrf_token() }}"
        },
        success: function () {
            toastr.success("Roles updated successfully");
            $("#assignRolesModal").modal('hide');
            setTimeout(() => location.reload(), 700);
        },
        error: function () {
            toastr.error("Failed to update roles");
        }
    });
});

// Show the create custom role modal
$(document).on('click', '#openCreateRoleModal', function () {
    $("#roleName").val('');
    $("#roleError").addClass('d-none');
    $("#createRoleModal").modal('show');
});

// Create a new role
$("#saveRoleBtn").on('click', function () {
    const roleName = $("#roleName").val().trim();

    if (!roleName) {
        $("#roleError").text("Role name is required").removeClass("d-none");
        return;
    }

    $.ajax({
        url: "{{ route('roles.store') }}",
        type: "POST",
        data: {
            name: roleName,
            _token: "{{ csrf_token() }}"
        },
        success: function (res) {
            toastr.success(res.message);
            $("#createRoleModal").modal('hide');
            setTimeout(() => location.reload(), 800);
        },
        error: function (xhr) {
            const error = xhr.responseJSON.errors?.name?.[0] || "Failed to create role";
            $("#roleError").text(error).removeClass("d-none");
            toastr.error(error);
        }
    });
});

// ✅ Open Create User Modal
$(document).on('click', '#openCreateUserModal', function () {
    $("#createUserForm")[0].reset();
    $(".error-text").text('');
    $("#createUserModal").modal('show');
});

// ✅ Create User Submit
$("#saveUserBtn").click(function () {

    let formData = $("#createUserForm").serialize();

    $.ajax({
        url: "{{ route('users.store') }}",
        method: "POST",
        data: formData,
        success: function (res) {
            toastr.success("User Created Successfully!");
            $("#createUserModal").modal('hide');

            setTimeout(() => location.reload(), 700);
        },
        error: function (xhr) {
            $(".error-text").text('');
            
            if (xhr.status === 422) {
                $.each(xhr.responseJSON.errors, function (key, value) {
                    $("." + key + "_error").text(value[0]);
                });
            } else {
                toastr.error("Error creating user");
            }
        }
    });
});
</script>
@endsection