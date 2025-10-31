<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
    <title> | Digi Optics</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0-alpha3/css/bootstrap.min.css"
        rel="stylesheet">
    <link rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i&amp;display=swap">
    {{-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-sweetalert/1.0.1/sweetalert.css"> --}}
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <!-- Datatable CSS -->
    <link href="https://cdn.datatables.net/2.2.2/css/dataTables.dataTables.css" rel="stylesheet" type="text/css" />

    <!-- Icons CSS -->
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.12.0/css/all.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css"
        integrity="sha512-MV7K8+y+gLIBoVD59lQIYicR65iaqukzvf/nwasF0nqhPay5w/9lJmVM2hMDcnK1OnMGCdVK+iQrJ7lzPJQd1w=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />

    <!-- Toastr CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css">

    <!-- Custom CSS -->
    <link rel="stylesheet" href="{{ asset('assets/css/main.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/custom.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/frosted-sidebar.css') }}">
    <!-- Styles -->
    

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">


    <style>
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999;
    transition: opacity 0.3s ease, visibility 0.3s;
}
.overlay.hidden {
    opacity: 0;
    visibility: hidden;
}
.loading-text { font-size: 1.05rem; margin-top: .5rem; color:#333; }
.spinner-color { color: #007bff; }
</style>

</head>

<body id="page-top" onload="">
    <!-- File Loading Animation Start -->
    <div class="overlay hidden">
    <div style="text-align:center">
        <div class="spinner-border spinner-color" role="status" style="width:3rem;height:3rem">
            <span class="visually-hidden">Loading...</span>
        </div>
        <div class="loading-text">Please wait...</div>
    </div>
</div>

    <div id="wrapper" class="container-fluid" style="padding-left: 0.75rem; padding-right: 0.75rem;">
        <div class="row">
            @include('layouts.navigation')


            <!--  Begin Footer  -->
            <div id="contentColumn" class="col-md-10 col-sm-12 p-0">
                <div class="d-flex flex-column" id="content-wrapper">

                    <!--  BEGIN CONTENT PART  -->
                    @yield('content')
                    <!--  END CONTENT PART  -->

                    <footer class="sticky-footer"
                        style="padding: 12px 0px;background: #F2F5FA;margin: 0.5rem 0px 0rem 0px !important;">
                        <div class="container " style="background: rgba(255,255,255,0);max-width: 100%;">
                            <div class="text-center d-flex justify-content-xl-end justify-content-center copyright"
                                style="background: rgb(255,255,255,0);text-align: right;">
                                <a href="http://digibysr.com/" target="_blank">
                                    <img class="d-flex justify-content-end "
                                        src="https://digibysr.com/wp-content/uploads/2025/01/DigiOptics.png"
                                        height="40px" alt="DIGIBYSR" style="text-align: right;">
                                </a>
                            </div>
                            <div class="text-center d-flex justify-content-xl-end justify-content-center copyright"><span
                                    class="d-inline-block float-end d-xl-flex justify-content-xl-end align-items-xl-end"
                                    style="font-size: 14px;padding-top: 6px;text-align: right;">Designed & Developed by
                                    <a href="https://digibysr.com/" target="_blank"
                                        style="text-decoration:none; margin-left:5px;color:#FF6300;"><strong>DigiBySR</strong></a>
                                </span>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
            <!--  End Footer  -->
        </div>
    </div>
    {{-- Begin All Scripts --}}
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"
        integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
    <!-- jQuery.print.js (CDN version) -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jQuery.print/1.6.2/jQuery.print.min.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/sweetalert/2.1.2/sweetalert.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>
    <script type="text/javascript" src="https://cdn.datatables.net/2.1.4/js/dataTables.min.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js">
    </script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/JsBarcode.all.min.js"></script>
    <script src="{{ asset('assets/js/common.js') }}"></script>


    {{-- @vite('resources/js/common.js') --}}


    <!-- End All Scripts -->

    <!-- Begin Custom Scripts -->
    
    <!-- End Custom Scripts -->

    <script>
        function print(divId) {
            $("#" + divId).print({
                globalStyles: true, // Use all page CSS
                mediaPrint: false, // Ignore @media print rules
                stylesheet: null, // Can be used to load custom CSS
                noPrintSelector: ".no-print", // Exclude elements with this class
                iframe: true, // Print via hidden iframe
                deferred: $.Deferred().done(function() {
                    console.log('🖨️ Printing completed');
                })
            });
        }
    </script>

@if (session('success'))
    <script>
        toastr.success("{{ session('success') }}");
    </script>
@endif

@if (session('error'))
    <script>
        toastr.error("{{ session('error') }}");
    </script>
@endif

@if (session('warning'))
    <script>
        toastr.warning("{{ session('warning') }}");
    </script>
@endif

@if (session('info'))
    <script>
        toastr.info("{{ session('info') }}");
    </script>
@endif


<script>
document.addEventListener("DOMContentLoaded", function() {
    // overlay element (must exist in markup)
    const overlay = document.querySelector('.overlay');

    // helper functions
    function showLoader() {
        if (!overlay) return;
        overlay.classList.remove('hidden');
    }
    function hideLoader() {
        if (!overlay) return;
        overlay.classList.add('hidden');
    }

    // --- keep your existing page-load hide behaviour (you already had this) ---
    window.addEventListener('load', function() {
        // small delay so hide feels smooth
        setTimeout(() => hideLoader(), 300);
    });

    // --- show loader whenever any target form is submitted ---
    // Add 'show-loader-on-submit' to forms which should display loader on submit (task create, comment forms, etc.)
    document.querySelectorAll('form.show-loader-on-submit').forEach(form => {
        form.addEventListener('submit', function (ev) {
            // IMPORTANT: For traditional form submissions that lead to a new page,
            // we need to prevent default, show the loader, and then re-submit with a small delay.
            // This ensures the loader has time to render before the browser starts unloading.

            // Prevent the default form submission immediately
            ev.preventDefault();

            // Show loader
            showLoader();

            // Set the custom loading message from data-loading-text
            const msg = form.dataset.loadingText;
            if (msg) {
                const msgEl = overlay?.querySelector('.loading-text');
                if (msgEl) msgEl.textContent = msg;
            }

            // Introduce a small delay to allow the loader to render
            // before manually submitting the form.
            // This is crucial for traditional (non-AJAX) form submissions.
            setTimeout(() => {
                form.submit(); // Manually submit the form to proceed with page navigation
            }, 100); // 100ms delay should be sufficient for rendering
        });
    });

    // --- handle AJAX global events (jQuery) ---
    // This shows loader for any jQuery AJAX requests — remove/comment this block if you don't want that.
    if (window.jQuery) {
        $(document).ajaxStart(function() {
            showLoader();
        });
        $(document).ajaxStop(function() {
            hideLoader();
        });
    }

    // --- allow AJAX code to hide loader by dispatching custom event ---
    document.addEventListener('hideGlobalLoader', () => {
        hideLoader();
    });

    // --- The separate setLoaderMessageFromForm and its listener for submit is no longer needed here,
    // as it's integrated directly into the main form submit listener above.
    // If you had other uses for it (e.g., changing text on click without submitting), keep it.
    // For just showing on submit, the above consolidated approach is cleaner.
});
</script>
<!-- @livewireStyles
@livewireScripts -->

</body>

</html>
