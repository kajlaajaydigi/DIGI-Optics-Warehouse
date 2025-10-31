<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\OtpController;
use App\Http\Controllers\UserManagement\UserController;
use App\Http\Controllers\RoleManagement\RoleController;
use App\Http\Controllers\PermissionManagement\PermissionController;
use App\Http\Controllers\ActivityController\ActivityController;

// Route::get('/', function () {
//     return view('welcome');
// });

Route::post('/login', [LoginController::class, 'login'])->name('login');

// OTP Routes
Route::get('/otp-verify', [OtpController::class, 'showVerifyForm'])
    ->name('otp.verify.form');

Route::post('/otp-verify', [OtpController::class, 'verifyOtp'])
    ->name('otp.verify');

Route::post('/resend-otp', [OtpController::class, 'sendOtp'])
    ->name('otp.resend');

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

//User Management Routes:

Route::middleware(['auth', 'check.permission'])->prefix('admin')->group(function () {
    Route::resource('users', UserController::class)->except(['show', 'destroy']);
    Route::get('users/{id}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggleStatus');
    Route::get('users/{id}/toggle-otp', [UserController::class, 'toggleOtp'])->name('users.toggleOtp');
    Route::post('users/{id}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
});



Route::middleware(['auth', 'check.permission'])->prefix('admin')->group(function () {

    // User Role Management
    Route::get('roles/{user}/assign', [RoleController::class, 'getUserRoles'])
        ->name('roles.assign');

    Route::post('roles/{user}/assign', [RoleController::class, 'updateUserRoles'])
        ->name('roles.update');

    // Route::post('roles/create', [RoleController::class, 'store'])
    // ->name('roles.create');

     /**
     * ROLE MANAGEMENT
     */
    Route::prefix('roles')->name('roles.')->group(function () {

        // Show all roles
        Route::get('/', [RoleController::class, 'index'])->name('index');

        // Create role page & store
        Route::get('/create', [RoleController::class, 'create'])->name('create');
        Route::post('/store', [RoleController::class, 'store'])->name('store');

        // Assign permissions to role
        Route::get('/{role}/permissions', [RoleController::class, 'showPermissions'])->name('permissions');
        Route::post('/{role}/permissions/update', [RoleController::class, 'updatePermissions'])->name('permissions.update');

        // Delete role
        Route::delete('/{role}/delete', [RoleController::class, 'destroy'])->name('delete');
    });


    /**
     * PERMISSION MANAGEMENT
     */
    Route::prefix('permissions')->name('permissions.')->group(function () {

        Route::get('/', [PermissionController::class, 'index'])->name('index');
        
        Route::post('/store', [PermissionController::class, 'store'])->name('store');
        Route::delete('/{permission}/delete', [PermissionController::class, 'destroy'])->name('delete');
    });


     Route::prefix('activity-logs')->name('activity.logs.')->group(function () {

        Route::get('/', [ActivityController::class, 'index'])
            ->name('index');

        Route::get('/export', [ActivityController::class, 'exportCsv'])
            ->name('export');

        Route::get('/{id}', [ActivityController::class, 'show'])
            ->name('show');
    });
});


require __DIR__.'/auth.php';
