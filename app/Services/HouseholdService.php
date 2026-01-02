<?php

namespace App\Services;

use App\Models\Household;
use App\Models\HouseholdMember;
use App\Data\HouseholdMemberData;
use App\Http\Traits\PreparesHouseholdMemberData;
use App\Http\Traits\HasAuthenticatedUser;
use App\Http\Traits\HasDatabaseTransactions;
use Illuminate\Support\Str;
use Exception;

class HouseholdService
{
    use PreparesHouseholdMemberData, HasAuthenticatedUser, HasDatabaseTransactions;
    private const MAX_HOUSEHOLD_MEMBERS = 2;

    public function create(array $householdData): array
    {
        $user = $this->getAuthenticatedUser();

        return $this->transaction(function () use ($user, $householdData) {
            $household = Household::create($householdData);
            HouseholdMember::create(HouseholdMemberData::forPrimary($user, $household));

            return [
                'household' => $household,
                'invite_code' => $this->generateInviteCode($household),
            ];
        });
    }

    public function getAllByUserId(?int $householdId = null): \Illuminate\Support\Collection
    {
        $user = $this->getAuthenticatedUser();

        if ($householdId) {
            $household = Household::with(['members.user', 'primaryMember'])
                ->find($householdId);

            if (!$household) {
                return collect([]);
            }

            return collect([$household]);
        }

        $householdMembers = HouseholdMember::where('user_id', $user->id)
            ->with(['household.members.user', 'household.primaryMember'])
            ->get();

        return $householdMembers->map(function ($member) {
            return $member->household;
        });
    }

    public function join(string $code): array
{
    $user = $this->getAuthenticatedUser();

    $household = Household::where('invite_code', $code)->first();

    if (!$household) {
        throw new Exception('Invalid or expired invite code');
    }


    if (HouseholdMember::where('household_id', $household->id)
        ->where('user_id', $user->id)
        ->exists()) {
        throw new Exception('You are already a member of this household');
    }


    $activeCount = HouseholdMember::where('household_id', $household->id)
        ->where('status', 'active')
        ->whereNotNull('user_id')
        ->count();

    if ($activeCount >= self::MAX_HOUSEHOLD_MEMBERS) {
        throw new Exception('Household is full');
    }


    HouseholdMember::create(HouseholdMemberData::forPartner($user, $household));

    return [
        'household' => $household->fresh(['members.user']),
    ];
}
    public function generateInviteCode(Household $household): string
    {
        do {
            $code = Str::random(8);
        } while (Household::where('invite_code', $code)->exists());
            $household->update(['invite_code' => $code]);
            return $code;
    }
    

    public function getInviteCode(int $householdId): ?string
{
    $user = $this->getAuthenticatedUser();

    $household = Household::find($householdId);

    if (!$household) {
        return null;
    }


    $member = HouseholdMember::where('household_id', $householdId)
        ->where('user_id', $user->id)
        ->where('role', 'primary')
        ->first();

    if (!$member) {
        return null;
    }


    if (!$household->invite_code) {
        $this->generateInviteCode($household);
        $household->refresh();
    }

    return $household->invite_code;
}

    public function regenerateInviteCode(int $householdId): string
{
    $user = $this->getAuthenticatedUser();

    return $this->transaction(function () use ($user, $householdId) {
        $household = Household::find($householdId);

        if (!$household) {
            throw new Exception('Household not found');
        }

    
        $member = HouseholdMember::where('household_id', $householdId)
            ->where('user_id', $user->id)
            ->where('role', 'primary')
            ->first();

        if (!$member) {
            throw new Exception('Only primary member can regenerate invite code');
        }


        return $this->generateInviteCode($household);
    });
}

    public function getMembers(int $householdId): \Illuminate\Support\Collection
{
    $user = $this->getAuthenticatedUser();

    $household = Household::find($householdId);

    if (!$household) {
        return collect([]);
    }


    $member = HouseholdMember::where('household_id', $householdId)
        ->where('user_id', $user->id)
        ->first();

    if (!$member) {
        return collect([]);
    }


    return HouseholdMember::where('household_id', $householdId)
        ->where('status', 'active')
        ->whereNotNull('user_id')
        ->with('user')
        ->get();
}

    public function leaveHousehold(int $householdId): void
    {
        $user = $this->getAuthenticatedUser();

        $this->transaction(function () use ($user, $householdId) {
            $member = HouseholdMember::where('household_id', $householdId)
                ->where('user_id', $user->id)
                ->first();

            if (!$member) {
                throw new Exception('You are not a member of this household');
            }

            if ($member->role === 'primary') {
                throw new Exception('Primary member cannot leave household. Transfer ownership first.');
            }

            $member->delete();
        });
    }

    public function transferOwnership(int $householdId, int $newPrimaryUserId): void
    {
        $user = $this->getAuthenticatedUser();

        $this->transaction(function () use ($user, $householdId, $newPrimaryUserId) {
            $currentPrimary = HouseholdMember::where('household_id', $householdId)
                ->where('user_id', $user->id)
                ->where('role', 'primary')
                ->where('status', 'active')
                ->first();

            if (!$currentPrimary) {
                throw new Exception('Only primary member can transfer ownership');
            }

            $newPrimary = HouseholdMember::where('household_id', $householdId)
                ->where('user_id', $newPrimaryUserId)
                ->where('status', 'active')
                ->first();

            if (!$newPrimary) {
                throw new Exception('Target user is not an active member of this household');
            }

            if ($newPrimary->role === 'primary') {
                throw new Exception('User is already the primary member');
            }

            // Transfer ownership
            $currentPrimary->update(['role' => 'partner']);
            $newPrimary->update(['role' => 'primary']);
        });
    }

    public function deleteHousehold(int $householdId): void
    {
        $user = $this->getAuthenticatedUser();

        $this->transaction(function () use ($user, $householdId) {
            $household = Household::find($householdId);

            if (!$household) {
                throw new Exception('Household not found');
            }

            $member = HouseholdMember::where('household_id', $householdId)
                ->where('user_id', $user->id)
                ->where('role', 'primary')
                ->where('status', 'active')
                ->first();

            if (!$member) {
                throw new Exception('Only primary member can delete household');
            }

            $household->delete();
        });
    }

    //for admin
    public function getAllHouseholds(): \Illuminate\Support\Collection
    {
        return Household::with(['members.user'])->get();
    }
}