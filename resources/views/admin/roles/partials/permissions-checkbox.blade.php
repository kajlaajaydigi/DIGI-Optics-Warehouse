@foreach($permissions as $permission)
    <div class="col-md-3 mb-3">
        <div class="form-check">
            <input type="checkbox"
                   name="permissions[]"
                   value="{{ $permission->id }}"
                   id="permission_{{ $permission->id }}"
                   class="form-check-input"
                   {{ in_array($permission->id, $rolePermissions) ? 'checked' : '' }}>

            <label class="form-check-label text-nowrap fw-semibold"
                   for="permission_{{ $permission->id }}">
                {{ ucfirst($permission->name) }}
            </label>
        </div>
    </div>
@endforeach