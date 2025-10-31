<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            'Super Admin',
            'Warehouse Manager',
            'Store Manager',
            'Procurement',
            'Ops',
            'QC Officer',
            'Vendor User',
            'Accountant',
            'Sales Staff',
            'Viewer'
        ];

        foreach ($roles as $role){
            Role::firstOrCreate(['name'=>$role]);
        }

        //Create Initial Super Admin
        $admin = User::create([
            'name' => 'Ribhu',
            'email' => 'ribhu02@gmail.com',
            'mobile' => '8583024644',
            'password' => bcrypt('Ribhu@123')
        ]);

        $admin->assignRole('Super Admin');
    }
}
