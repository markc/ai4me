<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::select(['id', 'name', 'email', 'created_at'])
            ->orderBy('id')
            ->get();

        return Inertia::render('users/index', [
            'users' => $users,
        ]);
    }
}
