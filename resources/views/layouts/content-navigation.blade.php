<nav class="navbar navbar-light navbar-expand bg-white shadow flex-wrap mb-4 topbar"
    style="height: 60px;margin-bottom: 24px;">
    <div class="container-fluid" style="padding: 0 5px;">

       
            <li class="nav-item dropdown no-arrow mx-1 d-flex align-items-center">
                <div class="nav-item dropdown no-arrow d-flex align-items-center">
                    <span id="useraccessname" class="d-none d-lg-inline me-2 x-large text-end"
                        style="margin-bottom: 0px;background: #F2F5FA;padding: 8px 24px;border-radius: 50px;">{{ Auth::user()->name }}
                       
                    <div class="dropdown-menu dropdown-menu-end dropdown-list animated--grow-in"></div>
                </div>
            </li>
        </ul>
        <button class="btn btn-link rounded-circle ms-1 me-2" id="sidebarToggleTop" type="button">
            <i class="fas fa-bars"></i>
        </button>

    </div>
</nav>
