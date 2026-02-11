<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
    Route::post('dashboard/settings', [App\Http\Controllers\DashboardController::class, 'updateSettings'])->name('dashboard.settings');

    Route::get('chat', [App\Http\Controllers\ChatController::class, 'index'])->name('chat.index');
    Route::get('chat/projects', [App\Http\Controllers\ChatController::class, 'projects'])->name('chat.projects');
    Route::post('chat/stream', [App\Http\Controllers\ChatController::class, 'stream'])->name('chat.stream');
    Route::post('chat/upload', [App\Http\Controllers\ChatController::class, 'upload'])->name('chat.upload');
    Route::get('chat/attachment/{attachment}', [App\Http\Controllers\ChatController::class, 'attachment'])->name('chat.attachment');
    Route::get('chat/{conversation}', [App\Http\Controllers\ChatController::class, 'show'])->name('chat.show');
    Route::get('chat/{conversation}/export', [App\Http\Controllers\ChatController::class, 'export'])->name('chat.export');
    Route::delete('chat/{conversation}', [App\Http\Controllers\ChatController::class, 'destroy'])->name('chat.destroy');

    Route::post('templates', [App\Http\Controllers\SystemPromptTemplateController::class, 'store'])->name('templates.store');
    Route::put('templates/{template}', [App\Http\Controllers\SystemPromptTemplateController::class, 'update'])->name('templates.update');
    Route::delete('templates/{template}', [App\Http\Controllers\SystemPromptTemplateController::class, 'destroy'])->name('templates.destroy');

    Route::get('docs', [App\Http\Controllers\DocsController::class, 'index'])->name('docs.index');
    Route::get('docs/{slug}', [App\Http\Controllers\DocsController::class, 'show'])->name('docs.show');

    Route::get('users', [App\Http\Controllers\UserController::class, 'index'])->name('users.index');
    Route::post('users', [App\Http\Controllers\UserController::class, 'store'])->name('users.store');
    Route::put('users/{user}', [App\Http\Controllers\UserController::class, 'update'])->name('users.update');
    Route::delete('users/{user}', [App\Http\Controllers\UserController::class, 'destroy'])->name('users.destroy');
});

require __DIR__.'/settings.php';
