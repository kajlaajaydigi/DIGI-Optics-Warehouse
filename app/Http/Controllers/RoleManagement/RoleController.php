<?php

namespace App\Http\Controllers\RoleManagement;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Activitylog\Facades\Activity;

class RoleController extends Controller
{
    // Fetch all roles + assigned roles for a user
    public function getUserRoles($id)
    {
        $user = User::findOrFail($id);

        return response()->json([
            'roles' => Role::select('id', 'name')->get(),
            'assignedRoles' => $user->roles->pluck('name')->toArray(),
        ]);
    }

    // Update Role Assignment
    public function updateUserRoles(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $newRoles = $request->roles ?? [];

        $user->syncRoles($request->roles ?? []);

        // 🧾 Log the role assignment/update
        activity('Role Assignment')
            ->causedBy(auth()->user())
            ->performedOn($user)
            ->event('Role updated')
            ->withProperties([
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'assigned_roles' => $newRoles,
            ])
            ->log("Updated roles for user '{$user->name}'.");

        return response()->json(['success' => true]);
    }

    // Create Custom Role
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name',
        ]);

         $role = Role::create(['name' => $request->name]);
        
          // 🧾 Log role creation
        activity('Role Management')
            ->causedBy(auth()->user())
            ->performedOn($role)
            ->event('Role created')
            ->withProperties([
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'role_name' => $role->name,
            ])
            ->log("Role '{$role->name}' created.");

        return response()->json([
            'success' => true,
            'message' => 'Role created successfully!'
        ]);
    }


    // Shows the table list of all roles
    public function index()
    {
        $roles = Role::with('permissions')->orderBy('id', 'ASC')->get();
        return view('admin.roles.index', compact('roles'));
    }


    public function showPermissions(Role $role)
    {
        $permissions = Permission::all();
        $rolePermissions = $role->permissions->pluck('id')->toArray();

        $html = view('admin.roles.partials.permissions-checkbox', compact(
            'permissions', 'rolePermissions'
        ))->render();

        return response()->json(['html' => $html]);
    }

    public function updatePermissions(Request $request, Role $role)
    {
         $permissionIds = $request->permissions ?? [];

        // Convert IDs → Permission Models
        $permissions = Permission::whereIn('id', $permissionIds)->get();

        $role->syncPermissions($permissions);

        // 🧾 Log permission updates
        activity('Role Permission Update')
            ->causedBy(auth()->user())
            ->performedOn($role)
            ->event('Permission updated')
            ->withProperties([
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'updated_permissions' => $permissions->pluck('name'),
            ])
            ->log("Updated permissions for role '{$role->name}'.");

        return response()->json(['success' => true]);
    }

    public function destroy(Role $role)
    {
        // Prevent deleting default system roles if needed
        if (in_array($role->name, ['Super Admin'])) {
            return back()->with('error', 'This role cannot be deleted.');
        }

        $roleName = $role->name;

        // Log before deletion
        activity('Role Management')
            ->causedBy(auth()->user())
            ->performedOn($role)
            ->event('Role deleted')
            ->withProperties([
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'role_name' => $roleName,
            ])
            ->log("Role '{$roleName}' deleted.");

        $role->delete();

        return redirect()->route('roles.index')
            ->with('success', 'Role deleted successfully.');
    }

}
