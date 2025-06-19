<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run()
    {
        // Primero ejecutamos el RoleSeeder
        $this->call(RoleSeeder::class);
        
        // Luego ejecutamos el UserSeeder
        $this->call(UserSeeder::class);
        
        // Ejecutamos el AprendizSeeder para crear aprendices
        $this->call(AprendizSeeder::class);
        
        // Finalmente ejecutamos el CasoGeneralSeeder para crear datos de prueba
        $this->call(CasoGeneralSeeder::class);
    }
}
