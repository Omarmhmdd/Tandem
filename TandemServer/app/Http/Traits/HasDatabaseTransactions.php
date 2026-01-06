<?php

namespace App\Http\Traits;

use Illuminate\Support\Facades\DB;

trait HasDatabaseTransactions
{
    protected function transaction(callable $callback)
    {
        return DB::transaction($callback);
    }
}


