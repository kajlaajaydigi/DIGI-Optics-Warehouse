<!-- Create Permission Modal -->
<div class="modal fade" id="createPermissionModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">

            <div class="modal-header bg-success text-white">
                <h5 class="modal-title">
                    <i class="fas fa-key me-2"></i>Create Permission
                </h5>
                <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
                <label class="form-label">Permission Name</label>
                <input type="text" id="permissionName" class="form-control" placeholder="Enter permission">
                <small id="permissionError" class="text-danger d-none"></small>
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button class="btn btn-success" id="savePermissionBtn">Save</button>
            </div>

        </div>
    </div>
</div>
