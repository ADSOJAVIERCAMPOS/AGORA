<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;

class UserSeeder extends Seeder
{
    public function run()
    {
        $coordinadorRole = Role::where('name', 'coordinador')->first();
        $auxiliarRole = Role::where('name', 'auxiliar')->first();

        \App\Models\User::truncate();

        // Usuario Coordinador (único con acceso a gestión de auxiliares)
        \App\Models\User::create([
            'name' => 'Giovanny Agudelo',
            'email' => 'admin@test.com',
            'password' => Hash::make('password123'),
            'role_id' => $coordinadorRole ? $coordinadorRole->id : null,
        ]);

        // Usuarios Auxiliares (sin acceso a gestión de auxiliares)
        \App\Models\User::create([
            'name' => 'Javier Campos',
            'email' => 'javier@test.com',
            'password' => Hash::make('password123'),
            'role_id' => $auxiliarRole ? $auxiliarRole->id : null,
        ]);

        \App\Models\User::create([
            'name' => 'Andres Castro',
            'email' => 'andres@test.com',
            'password' => Hash::make('password123'),
            'role_id' => $auxiliarRole ? $auxiliarRole->id : null,
        ]);
    }
}