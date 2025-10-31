<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Exceptions\PermissionDoesNotExist;

class CheckDynamicPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        $routeName = Route::currentRouteName();

        // If user is not logged in — deny access
        if (!$user) {
            activity()
                ->useLog('Authorization')
                ->withProperties([
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'route' => $routeName,
                ])
                ->event('unauthenticated_access')
                ->log('Unauthenticated access attempt detected.');

            abort(403, 'Unauthorized action.');
        }

        /**
         * Allow full access if:
         * - The user has "All Access" permission, OR
         * - The user's role name is "Super Admin"
         */
        if ($user->hasPermissionTo('All Access') || $user->hasRole('Super Admin')) {
            return $next($request);
        }

       // Try to check route-based permission safely
        try {
            if ($user->hasPermissionTo($routeName)) {
                return $next($request);
            }
        } catch (PermissionDoesNotExist $e) {

            // Log when a route does not have a defined permission
            activity()
                ->useLog('Authorization')
                ->causedBy($user)
                ->withProperties([
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'route' => $routeName,
                ])
                ->event('undefined_permission')
                ->log("Permission not defined in DB for route: {$routeName}");
                
            // Permission not defined in DB — treat as forbidden
            abort(403, 'Permission not defined for this route.');
        }

        // Log unauthorized action (permission exists but user lacks it)
        activity()
            ->useLog('Authorization')
            ->causedBy($user)
            ->withProperties([
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'route' => $routeName,
            ])
            ->event('unauthorized_access')
            ->log("Unauthorized action by user '{$user->name}' on route: {$routeName}");

        abort(403, 'Unauthorized action.');
    }
   
}
