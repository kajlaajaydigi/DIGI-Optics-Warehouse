<div>
    <h6>Event: <span class="text-capitalize">{{ $activity->event }}</span></h6>
    <p><strong>User:</strong> {{ $activity->causer?->name ?? 'System' }}</p>
    <p><strong>Module:</strong> {{ class_basename($activity->subject_type) }}</p>
    <p><strong>Description:</strong> {{ $activity->description }}</p>
    <pre class="bg-light p-2 rounded"><code>{{ json_encode($activity->properties, JSON_PRETTY_PRINT) }}</code></pre>
</div>