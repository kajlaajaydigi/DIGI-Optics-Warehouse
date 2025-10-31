<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Otp extends Model
{
     use HasFactory;

    protected $fillable = [
        'user_id',
        'otp_hash',
        'expires_at',
        'attempts',
        'last_sent_at',
        'send_count'
    ];

    protected $casts = [
        'last_sent_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
