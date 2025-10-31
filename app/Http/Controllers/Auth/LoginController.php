<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use App\Models\Otp;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;


class LoginController extends Controller
{
    public function login(Request $request)
{
    $credentials = $request->only('email', 'password');
        $user = User::where('email', $request->email)
                    ->orWhere('mobile', $request->email)
                    ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return back()->withErrors(['email' => 'Invalid login credentials']);
        }

        if (!$user->status) {
            return back()->withErrors(['email' => 'Your account is blocked']);
        }

        // ✅ If OTP not required → normal login
        if (!$user->otp_required) {
            Auth::login($user);
            $user->update(['last_login_at' => now()]);
            return redirect()->route('dashboard');
        }

        // ✅ If OTP is required → redirect to OTP verification page
        session(['otp_user_id' => $user->id]);
        return redirect()->route('otp.verify.form');
    }
}
