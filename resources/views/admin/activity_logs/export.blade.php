<table>
    <thead>
        <tr>
            <th>Event</th>
            <th>User</th>
            <th>Module</th>
            <th>Description</th>
            <th>IP</th>
            <th>Browser</th>
            <th>Date</th>
        </tr>
    </thead>
    <tbody>
        @foreach($logs as $log)
            <tr>
                <td>{{ $log->event }}</td>
                <td>{{ optional($log->causer)->name ?? 'System' }}</td>
                <td>{{ $log->log_name }}</td>
                <td>{{ $log->description }}</td>
                <td>{{ $log->properties['ip'] ?? '-' }}</td>
                <td>{{ $log->properties['user_agent'] ?? '-' }}</td>
                <td>{{ $log->created_at->format('d M Y H:i:s') }}</td>
            </tr>
        @endforeach
    </tbody>
</table>
