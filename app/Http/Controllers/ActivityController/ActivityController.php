<?php

namespace App\Http\Controllers\ActivityController;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;
use App\Models\User;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ActivityLogsExport;

class ActivityController extends Controller
{
    /**
     * Display all activity logs with filters.
     */
    public function index(Request $request)
    {
        $query = Activity::query()->with('causer');

        // 🔹 Filter: User (ID)
        if ($request->filled('user_id')) {
            $query->where('causer_id', $request->user_id);
        }

        // 🔹 Filter: Module / Log Name
        if ($request->filled('module')) {
            $query->where('log_name', $request->module);
        }

        // 🔹 Filter: Event Type
        if ($request->filled('event')) {
            $query->where('event', $request->event);
        }

        // 🔹 Filter: Keyword
        if ($request->filled('keyword')) {
            $query->where(function ($q) use ($request) {
                $q->where('description', 'like', '%' . $request->keyword . '%')
                ->orWhere('properties', 'like', '%' . $request->keyword . '%');
            });
        }

        // 🔹 Filter: Date Range
        if ($request->filled('date_from') && $request->filled('date_to')) {
            $start = Carbon::parse($request->date_from)->startOfDay();
            $end = Carbon::parse($request->date_to)->endOfDay();
            $query->whereBetween('created_at', [$start, $end]);
        }

        // 🔹 Fetch paginated results
        $activities = $query->latest()->paginate(15);

        // 🔹 Get all users for the filter dropdown
        $users = User::select('id', 'name')->orderBy('name')->get();

        return view('admin.activity_logs.index', compact('activities', 'users'));
    }

    /**
     * Show details of a specific log entry.
     */
    public function show($id)
    {
        $activity = Activity::with('causer')->findOrFail($id);
        return view('admin.activity_logs.show', compact('activity'));
    }

    /**
     * Export filtered logs to CSV.
     */
     public function exportCsv(Request $request)
    {
        return Excel::download(new ActivityLogsExport($request->all()), 'activity_logs.csv');
    }

}
