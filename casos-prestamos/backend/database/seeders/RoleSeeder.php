<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run()
    {
        Role::create([
            'name' => 'admin',
            'description' => 'Administrador del sistema'
        ]);

        Role::create([
            'name' => 'user',
            'description' => 'Usuario regular'
        ]);

        Role::create([
            'name' => 'coordinador',
            'description' => 'Coordinador de auxiliares'
        ]);

        Role::create([
            'name' => 'auxiliar',
            'description' => 'Auxiliar de coordinación'
        ]);
    }
} 