@extends('layouts.app')

@section('content')
@include('layouts.content-navigation')

<div id="content">

<div class="container py-4">

   <div class="container py-4">

    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold">Permission Management</h2>

        <button class="btn btn-success" id="openCreatePermissionModal">
            <i class="fas fa-key"></i> Create Permission
        </button>
    </div>

    <div class="card shadow-sm">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-dark">
                    <tr>
                        <th width="8%">#</th>
                        <th>Permission Name</th>
                        <th width="20%" class="text-center">Actions</th>
                    </tr>
                </thead>

                <tbody>
                @forelse($permissions as $index => $permission)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td class="fw-semibold">{{ $permission->name }}</td>

                        <td class="text-center">
                            <form class="d-inline" action="{{ route('permissions.delete', $permission->id) }}" method="POST">
                                @csrf @method('DELETE')

                                <button type="button"
                                        class="btn btn-sm btn-danger btn-delete-permission">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="3" class="text-center text-muted">No permissions found</td>
                    </tr>
                @endforelse
                </tbody>

            </table>
        </div>
    </div>

</div>

</div>
</div>

@include('admin.permissions.partials.create-modal')

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script>
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

// SweetAlert Delete Confirm
$(document).on("click", ".btn-delete-permission", function () {
    let form = $(this).closest("form");

    Swal.fire({
        title: "Delete Permission?",
        text: "This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, delete"
    }).then((result) => {
        if (result.isConfirmed) { form.submit(); }
    });
});
</script>
@endsection