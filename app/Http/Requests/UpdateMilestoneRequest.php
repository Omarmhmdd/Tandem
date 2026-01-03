<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMilestoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255', 'min:1'],
            'completed' => ['sometimes', 'boolean'],
            'deadline' => ['nullable', 'date'],
            'order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    public function getMilestoneData(): array
    {
        $data = [];

        if ($this->has('title')) {
            $data['title'] = $this->title;
        }
        if ($this->has('completed')) {
            $data['completed'] = $this->completed;
        }
        if ($this->has('deadline')) {
            $data['deadline'] = $this->deadline;
        }
        if ($this->has('order')) {
            $data['order'] = $this->order;
        }

        return $data;
    }
}