<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run()
    {
        $roles = [
            ['name' => 'admin', 'description' => 'Administrador del sistema'],
            ['name' => 'user', 'description' => 'Usuario regular'],
            ['name' => 'coordinador', 'description' => 'Coordinador de auxiliares'],
            ['name' => 'auxiliar', 'description' => 'Auxiliar de coordinación'],
        ];

        foreach ($roles as $role) {
            \App\Models\Role::updateOrCreate(['name' => $role['name']], $role);
        }
    }
} 