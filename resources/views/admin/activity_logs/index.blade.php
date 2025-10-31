@extends('layouts.app')

@section('content')
@include('layouts.content-navigation')

<div id="content">
<div class="container-fluid py-4">

    <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="mb-0">Activity Logs</h4>
        <a href="{{ route('activity.logs.export') }}" class="btn btn-success">
            <i class="bi bi-file-earmark-excel"></i> Export CSV
        </a>
    </div>

    <!-- Filters -->
    <form method="GET" action="{{ route('activity.logs.index') }}" class="card p-3 mb-4 shadow-sm border-0">
        <div class="row g-3 align-items-end">
            <div class="col-md-3">
                <label for="date_from" class="form-label">From Date</label>
                <input type="date" name="date_from" id="date_from" value="{{ request('date_from') }}" class="form-control">
            </div>
            <div class="col-md-3">
                <label for="date_to" class="form-label">To Date</label>
                <input type="date" name="date_to" id="date_to" value="{{ request('date_to') }}" class="form-control">
            </div>
            <div class="col-md-2">
                <label for="user_id" class="form-label">User</label>
                <select name="user_id" id="user_id" class="form-select">
                    <option value="">All Users</option>
                    @foreach($users as $user)
                        <option value="{{ $user->id }}" {{ request('user_id') == $user->id ? 'selected' : '' }}>
                            {{ $user->name }}
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-2">
                <label for="event" class="form-label">Event Type</label>
                <select name="event" id="event" class="form-select">
                    <option value="">All</option>
                    <option value="created" {{ request('event') == 'created' ? 'selected' : '' }}>Created</option>
                    <option value="updated" {{ request('event') == 'updated' ? 'selected' : '' }}>Updated</option>
                    <option value="deleted" {{ request('event') == 'deleted' ? 'selected' : '' }}>Deleted</option>
                    <option value="login" {{ request('event') == 'login' ? 'selected' : '' }}>Login</option>
                    <option value="logout" {{ request('event') == 'logout' ? 'selected' : '' }}>Logout</option>
                    <option value="approval" {{ request('event') == 'approval' ? 'selected' : '' }}>Approval</option>
                </select>
            </div>
            <div class="col-md-2">
                <label for="keyword" class="form-label">Keyword</label>
                <input type="text" name="keyword" id="keyword" value="{{ request('keyword') }}" class="form-control" placeholder="Search...">
            </div>
            <div class="col-md-12 text-end">
                <button type="submit" class="btn btn-primary"><i class="bi bi-search"></i> Filter</button>
                <a href="{{ route('activity.logs.index') }}" class="btn btn-outline-secondary"><i class="bi bi-arrow-repeat"></i> Reset</a>
            </div>
        </div>
    </form>

    <!-- Activity Logs Table -->
    <div class="card shadow-sm border-0">
        <div class="card-body table-responsive">
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>Event</th>
                        <th>Who</th>
                        <th>Module</th>
                        <th>Object Ref</th>
                        <th>IP / Browser</th>
                        <th>Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($activities as $log)
                        <tr>
                            <td><span class="badge bg-info text-dark text-capitalize">{{ $log->event ?? '-' }}</span></td>
                            <td>{{ $log->causer?->name ?? 'System' }}</td>
                            <td>{{ class_basename($log->subject_type ?? '-') }}</td>
                            <td>{{ $log->subject_id ?? '-' }}</td>
                            <td>
                                <small class="text-muted d-block">{{ $log->properties['ip'] ?? '-' }}</small>
                                <small class="text-muted">{{ Str::limit($log->properties['user_agent'] ?? '-', 40) }}</small>
                            </td>
                            <td>{{ $log->created_at->format('d M Y, h:i A') }}</td>
                            <td>
                                <button type="button"
                                    class="btn btn-sm btn-outline-primary view-log-btn"
                                    data-id="{{ $log->id }}">
                                    <i class="bi bi-eye"></i> View
                                </button>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="7" class="text-center text-muted">No activity logs found.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="card-footer">
            {{ $activities->links('pagination::bootstrap-5') }}
        </div>
    </div>

</div>

<!-- Modal -->
<div class="modal fade" id="activityModal" tabindex="-1" aria-labelledby="activityModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="activityModalLabel">Activity Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body" id="activity-details">
        <div class="text-center text-muted">Loading...</div>
      </div>
    </div>
  </div>
</div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

<script>
document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.view-log-btn');
    const modalEl = document.getElementById('activityModal');
    const modalBody = document.getElementById('activity-details');

    // Ensure modal exists before proceeding
    if (!modalEl) return;

    const modal = new bootstrap.Modal(modalEl);

    buttons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.id;

            modalBody.innerHTML = `
                <div class="text-center text-muted py-5">
                    <div class="spinner-border text-primary mb-3" role="status"></div>
                    <div>Loading activity details...</div>
                </div>
            `;

            try {
                const response = await fetch(`/admin/activity-logs/${id}`);
                if (!response.ok) throw new Error('Failed to load details');
                const html = await response.text();
                modalBody.innerHTML = html;
            } catch (error) {
                modalBody.innerHTML = `
                    <div class="text-center text-danger py-4">
                        <i class="bi bi-exclamation-triangle"></i> Failed to load details.
                    </div>
                `;
            }

            // Show modal after content is loaded
            modal.show();
        });
    });
});
</script>

@endsection