{{--<x-guest-layout>
    <!-- Session Status -->
    <x-auth-session-status class="mb-4" :status="session('status')" />

    <form method="POST" action="{{ route('login') }}">
        @csrf

        <!-- Email Address -->
        <div>
            <x-input-label for="email" :value="__('Email')" />
            <x-text-input id="email" class="block mt-1 w-full" type="email" name="email" :value="old('email')" required autofocus autocomplete="username" />
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>

        <!-- Password -->
        <div class="mt-4">
            <x-input-label for="password" :value="__('Password')" />

            <x-text-input id="password" class="block mt-1 w-full"
                            type="password"
                            name="password"
                            required autocomplete="current-password" />

            <x-input-error :messages="$errors->get('password')" class="mt-2" />
        </div>

        <!-- Remember Me -->
        <div class="block mt-4">
            <label for="remember_me" class="inline-flex items-center">
                <input id="remember_me" type="checkbox" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500" name="remember">
                <span class="ms-2 text-sm text-gray-600">{{ __('Remember me') }}</span>
            </label>
        </div>

        <div class="flex items-center justify-end mt-4">
            @if (Route::has('password.request'))
                <a class="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" href="{{ route('password.request') }}">
                    {{ __('Forgot your password?') }}
                </a>
            @endif

            <x-primary-button class="ms-3">
                {{ __('Log in') }}
            </x-primary-button>
        </div>
    </form>
</x-guest-layout>--}}

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - DigiOptics</title>

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

    <style>
        body {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(to bottom, #3b82f6, #2563eb);
            margin: 0;
        }

        .login-container {
            background: #fff;
            border-radius: 10px;
            padding: 2rem 1rem;
            box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.05);
            max-width: 1000px;
            width: 100%;
            border: 1px solid #eee;
        }

        .login-left img {
            max-width: 250px;
            width: 100%;
            height: auto;
        }

        .login-right h4 {
            margin-bottom: 1.5rem;
            font-weight: 500;
        }

        .form-control {
            border-radius: 20px;
        }

        .btn-login {
            width: 100%;
            border-radius: 20px;
            background-color: #1d4ed8;
            color: #fff;
            font-weight: 500;
        }

        .btn-login:hover {
            background-color: #153eaa;
            color: #fff;
        }

        /* Responsive: stack columns on small devices */
        @media (max-width: 768px) {
            .login-left {
                text-align: center;
                margin-bottom: 1rem;
            }
        }
    </style>
</head>

<body style="background: url({{ asset('assets/media/logo/bg-login.jpg')}}); object-fit: cover; background-size: cover; background-position: bottom; background-repeat: repeat-x; background-size: 1000px;">
    <div class="container d-flex justify-content-center align-items-center min-vh-100">
        <div class="row login-container align-items-center ">
            <!-- Left Side: Logo -->
            <div class="col-md-6 login-left text-center">
                <img src="{{ asset('assets/media/logo/DigiOptics.png') }}" alt="DigiOptics">
            </div>

            <!-- Right Side: Form -->
            <div class="col-md-6 login-right">
                <div class="text-center">
                    <span style="color: gray; font-size: 0.8rem;">Welcome to </span>
                    <h4 class="text-center">DIGIBYSR!</h4>
                </div>
                <form method="POST" action="{{ route('login') }}">
                    @csrf

                    <!-- Email / Mobile -->
                    <div class="mb-3">
                        <input id="login_id" type="text" name="login_id" value="{{ old('login_id') }}"
                            class="form-control @error('login_id') is-invalid @enderror"
                            placeholder="Email or Mobile Number" required autofocus>
                        @error('login_id')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- Password -->
                    <div class="mb-3">
                        <input id="password" type="password" name="password"
                            class="form-control @error('password') is-invalid @enderror" placeholder="Password"
                            required>
                        @error('password')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- Remember Me -->
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" name="remember" id="remember_me">
                        <label class="form-check-label " for="remember_me" style="color: gray;">
                            Remember Me
                        </label>
                    </div>

                    <!-- Login Button -->
                    <button type="submit" class="btn btn-login d-flex justify-content-center align-items-center gap-2" id="loginBtn">
                        <span id="loginText">Login</span>
                        <span id="loginSpinner" class="spinner-border spinner-border-sm d-none"></span>
                    </button>

                    <!-- Forgot Password -->
                    <div class="mt-3 text-center">
                        @if (Route::has('password.request'))
                            <a class="text-decoration-none " href="{{ route('password.request') }}" style="color: gray;">
                                Forgot your password?
                            </a>
                        @endif
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

    <script>
    document.querySelector('form').addEventListener('submit', function () {
        const btn = document.getElementById('loginBtn');
        const text = document.getElementById('loginText');
        const spinner = document.getElementById('loginSpinner');

        btn.disabled = true; // Prevent multiple clicks
        text.textContent = "Processing...";
        spinner.classList.remove('d-none');
    });
</script>
</body>

</html>



