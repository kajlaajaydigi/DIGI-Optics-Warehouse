<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use Spatie\Activitylog\Facades\Activity;


class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): View
    {
        return view('auth.login');
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $user = Auth::user();

        // 🚫 Blocked user check
        if ($user->status == 0) {
            // Log the blocked attempt
            activity()
                ->useLog('User Login')
                ->causedBy($user)
                ->performedOn($user)
                ->withProperties([
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ])
                ->event('blocked')
                ->log('Blocked user attempted to login');

            Auth::logout();
            return back()->withErrors([
                'login_id' => 'Your account has been blocked by the administrator.',
            ]);
        }

        // 🔒 Force password reset check
        if ($user->force_password_reset) {
            activity()
                ->useLog('User Login')
                ->causedBy($user)
                ->performedOn($user)
                ->withProperties([
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ])
                ->event('password_reset_required')
                ->log('User login prevented: force password reset required');

            Auth::logout();
            session(['force_reset_user_id' => $user->id]);

            return redirect()->route('password.request')
                ->with('warning', 'You must reset your password before continuing.');
        }

        // 🧩 OTP required check
        if ($user->otp_required) {
            activity()
                ->useLog('User Login')
                ->causedBy($user)
                ->performedOn($user)
                ->withProperties([
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ])
                ->event('otp_required')
                ->log("OTP verification initiated for '{$user->name}'");

            Auth::logout();
            session(['otp_user_id' => $user->id]);
            app(\App\Http\Controllers\Auth\OtpController::class)->sendOtp();

            return redirect()->route('otp.verify.form')
                ->with('success', 'OTP has been sent to your email.');
        }

        // ✅ Successful login (no OTP)
        $user->last_login_at = now();
        $user->save();

        activity()
            ->useLog('User Login')
            ->causedBy($user)
            ->performedOn($user)
            ->withProperties([
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ])
            ->event('login')
            ->log("User '{$user->name}' logged in successfully");

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }
    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();
        
        if ($user) {
            activity()
                 ->useLog('User Logout')
                ->causedBy($user)
                ->performedOn($user)
                ->withProperties([
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ])
                ->event('logout')
                ->log("User '{$user->name}' logged out");
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
