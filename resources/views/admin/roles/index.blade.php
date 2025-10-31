@extends('layouts.app')

@section('content')
@include('layouts.content-navigation')

<div id="content">
<div class="container py-4">

    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold">Role Management</h2>

        <div class="d-flex gap-2">
            <button type="button" class="btn btn-success" id="openCreateRoleModal">
                + Create Role
            </button>

            <button class="btn btn-primary" id="openCreatePermissionModal">
            <i class="fas fa-key"></i> Create Permission
        </button>

        </div>

        
    </div>

    <!-- Roles Table -->
    <div class="card shadow-sm">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-dark">
                    <tr>
                        <th width="8%">#</th>
                        <th>Role Name</th>
                        <th>Permissions</th> 
                        <th class="text-center" width="25%">Actions</th>
                    </tr>
                </thead>

                <tbody>
                @forelse($roles as $index => $role)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td class="fw-semibold">{{ $role->name }}</td>

                        <td>
                            @if($role->permissions->count() > 0)
                                @foreach($role->permissions as $perm)
                                    <span style="font-size: 12px;" class="badge bg-info text-dark me-1 mb-1">{{ $perm->name }}</span>
                                @endforeach
                            @else
                                <span class="text-muted">No Permissions Assigned</span>
                            @endif
                        </td>

                        <td class="text-center">
                            <div class="btn-group">

                                <!-- Assign Permissions -->
                                <button type="button"
                                        class="btn btn-sm btn-success btn-assign-permissions"
                                        data-id="{{ $role->id }}"
                                        title="Assign Permissions">
                                    <i class="fas fa-user-lock"></i>
                                </button>

                                <!-- Delete Role -->
                                <form class="delete-role-form" action="{{ route('roles.delete', $role->id) }}" method="POST">
                                    @csrf
                                    @method('DELETE')
                                    <button type="button" class="mx-2 btn btn-sm btn-danger btn-delete-role" title="Delete Role">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </form>

                            </div>
                        </td>
                    </tr>

                @empty
                    <tr>
                        <td colspan="3" class="text-center text-muted">
                            No roles found
                        </td>
                    </tr>
                @endforelse
                </tbody>

            </table>

            <!-- Assign Permissions Modal -->
            <div class="modal fade" id="permissionsModal" tabindex="-1">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content">

                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-key me-2"></i>Assign Permissions
                            </h5>
                            <button class="btn-close" data-bs-dismiss="modal"></button>
                        </div>

                        <form id="permissionsForm">
                            @csrf
                            <div class="modal-body">

                                <input type="hidden" name="role_id" id="role_id">

                                <div id="permissionsList" class="mt-3">
                                    <p class="text-center text-muted">Loading permissions...</p>
                                </div>

                            </div>

                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button  class="btn btn-primary" id="savePermissionsBtn">Save Changes</button>
                            </div>
                        </form>

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

            @include('admin.permissions.partials.create-modal')

        </div>
    </div>

</div>
</div>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script>
    // Load permissions dynamically
    $(document).on('click', '.btn-assign-permissions', function () {
    let roleId = $(this).data('id');
    $("#role_id").val(roleId);

    $.ajax({
        url: `/admin/roles/${roleId}/permissions`,
        type: "GET",
        success: function (response) {
            $("#permissionsList").html(response.html);
            $("#permissionsModal").modal('show');
        }
    });
});

    //Store permission update
    $("#permissionsForm").submit(function (e) {
    e.preventDefault();
    
    let roleId = $("#role_id").val();
    let formData = $(this).serialize();

    $.ajax({
        url: `/admin/roles/${roleId}/permissions/update`,
        type: "POST",
        data: formData,
        success: function () {
            toastr.success("Permissions updated successfully!");
            $("#permissionsModal").modal('hide');
            setTimeout(() => location.reload(), 1000);
        },
        error: function () {
            toastr.error("Error updating permissions!");
        }
    });
});


// SweetAlert Delete Confirmation
$(document).on("click", ".btn-delete-role", function () {
    let form = $(this).closest("form");

    Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            form.submit();
        }
    });
});

// Open Modal
$(document).on('click', '#openCreateRoleModal', function () {
    $("#roleName").val('');
    $("#roleError").addClass('d-none');
    $("#createRoleModal").modal('show');
});

// Save New Role AJAX
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


// Create pemission modal show
$(document).on('click', '#openCreatePermissionModal', function () {
    $("#permissionName").val('');
    $("#permissionError").addClass('d-none');
    $("#createPermissionModal").modal('show');
});

// Save New Permission
$("#savePermissionBtn").on('click', function () {
    const permissionName = $("#permissionName").val().trim();

    if (!permissionName) {
        $("#permissionError").text("Permission name is required").removeClass("d-none");
        return;
    }

    $.ajax({
        url: "{{ route('permissions.store') }}",
        type: "POST",
        data: {
            name: permissionName,
            _token: "{{ csrf_token() }}"
        },
        success: function (res) {
            toastr.success(res.message);
            $("#createPermissionModal").modal('hide');
            setTimeout(() => location.reload(), 800);
        },
        error: function (xhr) {
            const error = xhr.responseJSON.errors?.name?.[0] || "Failed to create permission";
            $("#permissionError").text(error).removeClass("d-none");
            toastr.error(error);
        }
    });
});
</script>

@endsection
