<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use App\Models\Otp;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class OtpController extends Controller
{
    public function showVerifyForm()
    {
        
        if (!session('otp_user_id')) {
            return redirect()->route('login');
        }

        return view('auth.otp_verify');
    }

    public function sendOtp()
    {
         $user = User::find(session('otp_user_id'));
        if (!$user) {
            return redirect()->route('login');
        }

        $otpData = Otp::firstOrNew(['user_id' => $user->id]);
        
        // Reset send count after 10 minutes
        if ($otpData->last_sent_at && $otpData->last_sent_at->diffInMinutes(now()) >= 10) {
            $otpData->send_count = 0;
        }

        if ($otpData->send_count >= 3) {
            $remaining = ceil(10 - $otpData->last_sent_at->diffInMinutes(now()));
            return back()->withErrors(['otp' => "Too many OTP requests. Try again after {$remaining} minutes."]);
        }

        // ✅ Generate OTP
        $otp = rand(111111, 999999);

        $otpData->otp_hash = Hash::make($otp);
        $otpData->expires_at = now()->addMinutes(5);
        $otpData->last_sent_at = now();
        $otpData->send_count = $otpData->send_count + 1;
        $otpData->attempts = 0;
        $otpData->save();

        // ✅ Send OTP email
        \Mail::raw("Your OTP: $otp", function ($message) use ($user) {
            $message->to($user->email)->subject('Login OTP');
        });

        return back()->with('success', 'OTP has been sent to your email');
    }

     public function verifyOtp(Request $request)
    {
        $request->validate([
            'otp' => 'required|digits:6'
        ]);

        $otpData = Otp::where('user_id', session('otp_user_id'))->first();

        if (!$otpData || $otpData->expires_at < now()) {
            return back()->withErrors(['otp' => 'OTP expired']);
        }

        if ($otpData->attempts >= 3) {
            return back()->withErrors(['otp' => 'Too many failed attempts']);
        }

        if (!Hash::check($request->otp, $otpData->otp_hash)) {
            $otpData->attempts += 1;
            $otpData->save();

            $remaining = 3 - $otpData->attempts;

            if ($remaining <= 0) {
                return back()->withErrors(['otp' => 'Account locked due to too many failed attempts. Request a new OTP.']);
            }

            return back()->withErrors(['otp' => "Invalid OTP. You have {$remaining} attempt(s) left."]);
        }

        $user = User::find(session('otp_user_id'));

        Auth::login($user);

        // Cleanup
        $otpData->delete();
        session()->forget('otp_user_id');

        $user->update(['last_login_at' => now()]);

        return redirect()->route('dashboard');
    }
}
