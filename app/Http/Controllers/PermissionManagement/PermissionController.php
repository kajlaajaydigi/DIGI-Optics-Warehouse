<?php

namespace App\Http\Controllers\PermissionManagement;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Facades\Auth;

class PermissionController extends Controller
{
     public function index()
    {
        $permissions = Permission::all();

        return view('admin.permissions.index', compact('permissions'));
    }

    public function create()
    {
        return view('admin.permissions.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:permissions,name',
        ]);

        $permission = Permission::create([
            'name' => $request->name,
            'guard_name' => 'web',
        ]);

         // 🔹 Log activity
        activity()
            ->causedBy(Auth::user())
            ->performedOn($permission)
            ->event('Permission Creation')
            ->withProperties(['name' => $permission->name])
            ->log('Created a new permission: ' . $permission->name);


        if ($request->ajax()) {
            return response()->json([
                'status' => true,
                'message' => 'Permission created successfully.',
                'data' => $permission
            ]);
        }

        return redirect()
            ->route('permissions.index')
            ->with('success', 'Permission created successfully.');
    }

    public function destroy(Permission $permission)
    {
        $permissionName = $permission->name;

        // Log BEFORE deletion so subject_type/id are captured
        activity('Permission Management')
            ->causedBy(Auth::user())
            ->performedOn($permission)
            ->event('Permission deleted')
            ->withProperties([
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'permission_name' => $permissionName,
            ])
            ->log("Deleted permission: {$permissionName}");

        $permission->delete();

        return redirect()
            ->route('permissions.index')
            ->with('success', 'Permission deleted successfully.');
    }
}
