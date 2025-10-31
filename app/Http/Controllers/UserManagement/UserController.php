<?php

namespace App\Http\Controllers\UserManagement;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    // ✅ List all users
    public function index()
    {
        $users = User::with('roles')->orderBy('id', 'DESC')->paginate(10);
        $roles = Role::all();
        return view('admin.users.index', compact('users', 'roles'));
    }

    // ✅ Create Form
    public function create()
    {
        return redirect()->route('users.index');
    }

    // ✅ Save new user
    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'mobile'   => 'required|string|unique:users,mobile',
            'email'    => 'nullable|email|unique:users,email',
            'password' => 'required|min:6',
            'roles'    => 'required|array',
        ]);

        $user = User::create([
            'name'        => $request->name,
            'mobile'      => $request->mobile,
            'email'       => $request->email,
            'password'    => Hash::make($request->password),
            'status'      => 1,
            'otp_required'=> 0,
            'force_password_update' => 0,
        ]);

        activity('User Management')
            ->causedBy(Auth::user())
            ->performedOn($user)
            ->event('created')
            ->withProperties([
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'user_name' => $user->name,
            ])
            ->log("Created new user: {$user->name}");

        $user->assignRole($request->roles);

        if ($request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'User created successfully!',
            ]);
        }

        return redirect()
            ->route('users.index')
            ->with('success', 'User created successfully!');
    }

    // ✅ Edit form
    public function edit($id)
    {
        $user  = User::findOrFail($id);
        $roles = Role::all();
        return view('admin.users.edit', compact('user', 'roles'));
    }

    // ✅ Update user
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name'   => 'required|string',
            'mobile' => 'required|string|unique:users,mobile,' . $id,
            'email'  => 'nullable|email|unique:users,email,' . $id,
        ]);

        $user->update([
            'name'   => $request->name,
            'mobile' => $request->mobile,
            'email'  => $request->email,
        ]);

        activity('User Management')
            ->causedBy(Auth::user())
            ->performedOn($user)
            ->event('updated')
            ->withProperties([
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'updated_fields' => $request->only(['name', 'email', 'mobile']),
            ])
            ->log("Updated user: {$user->name}");

        $user->syncRoles($request->roles);

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    // ✅ Status Toggle (Enable/Disable)
    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);
        $user->status = !$user->status;
        $user->save();

         // 🧾 Log activity
        activity()
            ->causedBy(Auth::user())
            ->performedOn($user)
            ->event('status_toggled')
            ->withProperties(['status' => $user->status ? 'Active' : 'Inactive'])
            ->log('Status toggled for admin: ' . $user->name . ' (Now ' . ($user->status ? 'Active' : 'Inactive') . ')');

        return redirect()->back()->with('success', 'User status updated.');
    }

    // ✅ OTP requirement toggle
    public function toggleOtp($id)
    {
        $user = User::findOrFail($id);
        $user->otp_required = !$user->otp_required;
        $user->save();

         activity()
            ->causedBy(Auth::user())
            ->performedOn($user)
            ->event('otp_toggled')
            ->withProperties(['otp_enabled' => $user->otp_enabled])
            ->log('OTP ' . ($user->otp_enabled ? 'enabled' : 'disabled') . ' for admin: ' . $user->name);

        return redirect()->back()->with('success', 'OTP setting updated.');
    }

    // ✅ Force Password Reset
    public function resetPassword($id)
    {
        $user = User::findOrFail($id);
        $user->force_password_reset = 1;
        $user->save();

        // 🧾 Log activity
        activity()
            ->causedBy(Auth::user())
            ->performedOn($user)
            ->event('password_reset')
            ->withProperties(['reset_by' => Auth::user()->name])
            ->log('Forced Password reset for : ' . $user->name);

        return redirect()->back()->with('success', 'Password reset flag applied.');
    }

    // ✅ User Activity Logs (placeholder)
    public function activityLog($id)
    {
        return "Activity Log TBD";
    }
}
