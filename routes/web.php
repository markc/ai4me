<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('chat', [App\Http\Controllers\ChatController::class, 'index'])->name('chat.index');
    Route::get('chat/{conversation}', [App\Http\Controllers\ChatController::class, 'show'])->name('chat.show');
    Route::post('chat/stream', [App\Http\Controllers\ChatController::class, 'stream'])->name('chat.stream');
    Route::delete('chat/{conversation}', [App\Http\Controllers\ChatController::class, 'destroy'])->name('chat.destroy');

    Route::get('users', [App\Http\Controllers\UserController::class, 'index'])->name('users.index');
});

require __DIR__.'/settings.php';
