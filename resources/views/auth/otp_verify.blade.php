<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify OTP - DigiOptics</title>

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

        .otp-container {
            background: #fff;
            border-radius: 10px;
            padding: 2rem 1rem;
            box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.05);
            max-width: 1000px;
            width: 100%;
            border: 1px solid #eee;
        }

        .otp-right h4 {
            font-weight: 500;
        }

        .form-control {
            border-radius: 20px;
            text-align: center;
            font-size: 1.2rem;
            letter-spacing: 5px;
        }

        .btn-verify {
            width: 100%;
            border-radius: 20px;
            background-color: #1d4ed8;
            color: #fff;
            font-weight: 500;
        }

        .btn-verify:hover {
            background-color: #153eaa;
            color: #fff;
        }

        .btn-resend {
            color: #1d4ed8;
            font-size: 0.9rem;
        }
    </style>
</head>

<body style="background: url({{ asset('assets/media/logo/bg-login.jpg')}}); object-fit: cover; background-size: cover; background-position: bottom; background-repeat: repeat-x; background-size: 1000px;">
    <div class="container d-flex justify-content-center align-items-center min-vh-100">

        <div class="row otp-container align-items-center">

            <!-- Left: Image -->
            <div class="col-md-6 text-center">
                <img src="{{ asset('assets/media/logo/DigiOptics.png') }}" alt="DigiOptics" style="max-width: 250px;">
            </div>

            <!-- Right: OTP Form -->
            <div class="col-md-6 otp-right">

                <div class="text-center mb-4">
                    <span style="color: gray; font-size: 0.8rem;">Secure Verification</span>
                    <h4>Enter OTP</h4>
                </div>

                @if ($errors->any())
                    <div class="alert alert-danger p-2 text-center">{{ $errors->first() }}</div>
                @endif

                @if (session('success'))
                    <div class="alert alert-success p-2 text-center">{{ session('success') }}</div>
                @endif

                <form action="{{ route('otp.verify') }}" method="POST">
                    @csrf
                    <div class="mb-3">
                        <input type="text" maxlength="6" name="otp"
                            class="form-control text-center" placeholder="______" required>
                    </div>

                    <button type="submit" class="btn btn-verify mb-2">Verify OTP</button>
                </form>

                <form id="resendForm" action="{{ route('otp.resend') }}" method="POST" class="text-center">
                    @csrf
                    <button id="resendBtn" class="btn btn-link btn-resend" type="submit">
                        <span id="resendText">Resend OTP</span>
                        <span id="resendSpinner" class="spinner-border spinner-border-sm ms-2 d-none"></span>
                    </button>
                </form>

            </div>

        </div>
    </div>

    <script>
        document.getElementById('resendForm').addEventListener('submit', function() {
            const btn = document.getElementById('resendBtn');
            const text = document.getElementById('resendText');
            const spinner = document.getElementById('resendSpinner');

            btn.disabled = true;
            text.textContent = "Sending...";
            spinner.classList.remove('d-none');
        });
    </script>

</body>

</html>
