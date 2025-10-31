<div id="sidebar-col" class="col-md-2 col-sm-0 p-0 frost-sidebar-col">
    <!-- Orange animated background (behind the frosted nav) -->
    <div class="frosty-anim" aria-hidden="true">
        <span class="b1"></span>
        <span class="b2"></span>
        <span class="b3"></span>
        <span class="b4"></span>
    </div>

    <nav id="sidebarnav"
        class="navbar navbar-dark align-items-start sidebar sidebar-dark accordion bg-gradient-primary p-0 sidebar-frosted"
        style="background: transparent; width: 100%; height: 100vh; overflow-y: auto; position: sticky; top: 0;">

        {{-- Begin Logo --}}
        <div class="container-fluid d-flex flex-column p-0">
            <a class="navbar-brand d-flex justify-content-center align-items-xl-center sidebar-brand m-0" href="#"
                style="padding: 10px 0px; max-height: 80px; max-width: 100%; min-height: 50px; min-width: 100%; align-items: center;">
                <img id="brandlogo" class=" d-lg-inline d-xl-inline d-xxl-inline"
                    style="max-height: 80%;max-width: 60%;"
                    src="{{ asset('assets/media/logo/DigiOptics.png') }}" alt="">
            </a>

            <ul class="navbar-nav text-light" id="accordionSidebar" style="margin-top: 15px;height: 50px;width: 80%;">

               
                    <li class="nav-item d-xl-flex align-items-xl-center" style="margin-bottom: 5px;">
                        <a class="nav-link d-xl-flex align-items-xl-center {{ Route::currentRouteName() == 'dashboard' ? 'active' : '' }}"
                            href="{{Route('dashboard')}}">
                            <i class="fa fa-home"></i><span class="nav-link-text">Dashboard</span></a>
                    </li>

                <li class="nav-item d-xl-flex align-items-xl-center" style="margin-bottom: 5px;">
                    <a class="nav-link d-xl-flex align-items-xl-center 
                        {{ Route::currentRouteName() == 'users.index' ? 'active' : '' }}"
                        href="{{ route('users.index') }}">
                        <i class="fas fa-users-cog"></i>
                        <span class="nav-link-text">User Management</span>
                    </a>
                </li>
                    
                <li class="nav-item d-xl-flex align-items-xl-center" style="margin-bottom: 5px;">
                    <a class="nav-link d-xl-flex align-items-xl-center 
                        {{ Route::currentRouteName() == 'roles.index' ? 'active' : '' }}"
                        href="{{ route('roles.index') }}">
                        <i class="fas fa-users-cog"></i>
                        <span class="nav-link-text">Role Management</span>
                    </a>
                </li>

                <li class="nav-item d-xl-flex align-items-xl-center" style="margin-bottom: 5px;">
                    <a class="nav-link d-xl-flex align-items-xl-center 
                        {{ Route::currentRouteName() == 'permissions.index' ? 'active' : '' }}"
                        href="{{ route('permissions.index') }}">
                        <i class="fas fa-users-cog"></i>
                        <span class="nav-link-text">Permission Management</span>
                    </a>
                </li>

                <li class="nav-item d-xl-flex align-items-xl-center" style="margin-bottom: 5px;">
                    <a class="nav-link d-xl-flex align-items-xl-center 
                        {{ Route::currentRouteName() == 'activity.logs.index' ? 'active' : '' }}"
                        href="{{ route('activity.logs.index') }}">
                        <i class="fas fa-users-cog"></i>
                        <span class="nav-link-text">Activity Log</span>
                    </a>
                </li>

                <li class="nav-item d-xl-flex align-items-xl-center">
                    <form method="POST" action="{{ route('logout') }}" style="width: 100%;">
                        @csrf
                        <button class="nav-link d-flex align-items-xl-center logout">
                            <i class="fas fa-door-open"></i>
                            <span class="nav-link-text">Signout</span>
                        </button>
                    </form>
                </li>
            </ul>
        </div>
    </nav>
</div>
