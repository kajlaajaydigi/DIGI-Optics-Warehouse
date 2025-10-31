<?php

namespace App\Exports;

use Spatie\Activitylog\Models\Activity;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Carbon\Carbon;

class ActivityLogsExport implements FromView
{
    protected $filters;

    public function __construct($filters)
    {
        $this->filters = $filters;
    }

    public function view(): View
    {
        $query = Activity::query()->with('causer');

        if (!empty($this->filters['user'])) {
            $query->whereHas('causer', function ($q) {
                $q->where('name', 'like', '%' . $this->filters['user'] . '%');
            });
        }

        if (!empty($this->filters['module'])) {
            $query->where('log_name', $this->filters['module']);
        }

        if (!empty($this->filters['event'])) {
            $query->where('event', $this->filters['event']);
        }

        if (!empty($this->filters['keyword'])) {
            $query->where('description', 'like', '%' . $this->filters['keyword'] . '%');
        }

        if (!empty($this->filters['start_date']) && !empty($this->filters['end_date'])) {
            $start = Carbon::parse($this->filters['start_date'])->startOfDay();
            $end = Carbon::parse($this->filters['end_date'])->endOfDay();
            $query->whereBetween('created_at', [$start, $end]);
        }

        $logs = $query->orderBy('id', 'desc')->get();

        return view('admin.activity_logs.export', compact('logs'));
    }
}
