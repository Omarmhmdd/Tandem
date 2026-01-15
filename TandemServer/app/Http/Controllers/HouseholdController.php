<?php

namespace App\Http\Controllers;

use App\Services\HouseholdService;
use App\Http\Requests\CreateHouseholdRequest;
use App\Http\Requests\JoinHouseholdRequest;
use App\Http\Requests\TransferOwnershipRequest;
use App\Http\Requests\UpdateHouseholdRequest;
use App\Http\Resources\HouseholdResource;
use App\Http\Resources\HouseholdMemberResource;
use Illuminate\Http\JsonResponse;
use Exception;

class HouseholdController extends Controller
{
    public function __construct(
        protected HouseholdService $householdService
    ) {}

    public function create(CreateHouseholdRequest $request): JsonResponse
    {
        $result = $this->householdService->create($request->getHouseholdData());

        return $this->created([
            'household' => new HouseholdResource($result['household']),
            'invite_code' => $result['invite_code'],
        ], 'Household created successfully');
    }

    public function getAllByUserId(?int $householdId = null): JsonResponse
    {
        $households = $this->householdService->getAllByUserId($householdId);

        return $this->success([
            'households' => HouseholdResource::collection($households),
        ]);
    }

    public function join(JoinHouseholdRequest $request): JsonResponse
    {
        try {
            $result = $this->householdService->join($request->getCode());

            return $this->success([
                'household' => new HouseholdResource($result['household']),
            ], 'Successfully joined household');
        } catch (Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function getInviteCode(int $householdId): JsonResponse
    {
        $inviteCode = $this->householdService->getInviteCode($householdId);

        if (!$inviteCode) {
            return $this->error('Invite code not found or you do not have permission', 404);
        }

        return $this->success([
            'invite_code' => $inviteCode,
        ]);
    }

    public function regenerateInviteCode(int $householdId): JsonResponse
    {
        try {
            $inviteCode = $this->householdService->regenerateInviteCode($householdId);

            return $this->success([
                'invite_code' => $inviteCode,
            ], 'Invite code regenerated successfully');
        } catch (Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function update(UpdateHouseholdRequest $request, int $householdId): JsonResponse
    {
        try {
            $household = $this->householdService->update($householdId, $request->getHouseholdData());

            return $this->success([
                'household' => new HouseholdResource($household),
            ], 'Household updated successfully');
        } catch (Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function getMembers(int $householdId): JsonResponse
    {
        $members = $this->householdService->getMembers($householdId);

        return $this->success([
            'members' => HouseholdMemberResource::collection($members),
        ]);
    }

    public function leaveHousehold(int $householdId): JsonResponse
    {
        try {
            $this->householdService->leaveHousehold($householdId);

            return $this->success(null, 'Successfully left household');
        } catch (Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function transferOwnership(TransferOwnershipRequest $request, int $householdId): JsonResponse
    {
        try {
            $this->householdService->transferOwnership($householdId, $request->getNewPrimaryUserId());

            return $this->success(null, 'Ownership transferred successfully');
        } catch (Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function deleteHousehold(int $householdId): JsonResponse
    {
        try {
            $this->householdService->deleteHousehold($householdId);

            return $this->success(null, 'Household deleted successfully');
        } catch (Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }
    //for admin only
    public function getAllHouseholds(): JsonResponse
    {
        $households = $this->householdService->getAllHouseholds();
        
        return $this->success([
            'households' => HouseholdResource::collection($households),
        ]);
    }
}