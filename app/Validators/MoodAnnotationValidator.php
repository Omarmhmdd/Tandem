<?php

namespace App\Validators;

use Illuminate\Support\Facades\Validator;

class MoodAnnotationValidator
{
    public static function validateAndSanitize(array $data): array
    {
        $annotationsArray = [];
        
        if (isset($data['annotations']) && is_array($data['annotations'])) {
            $annotationsArray = $data['annotations'];
        } elseif (is_array($data) && isset($data[0]) && is_array($data[0])) {
            $annotationsArray = $data;
        }

        $validated = [];
        foreach ($annotationsArray as $annotation) {
            $validator = Validator::make($annotation, [
                'title' => 'required|string|min:1|max:255',
                'description' => 'required|string|min:1',
                'date' => 'nullable|date',
                'type' => 'nullable|string|in:call,trip,purchase,event',
                'confidence' => 'nullable|numeric|min:0|max:1',
            ]);

            if ($validator->fails()) {
                continue;
            }

            $validatedData = $validator->validated();
            $title = trim($validatedData['title']);
            $description = trim($validatedData['description']);

            if (empty($title) || empty($description)) {
                continue;
            }

            $validated[] = [
                'text' => $description,
                'date' => $validatedData['date'] ?? now()->format('Y-m-d'),
                'type' => $validatedData['type'] ?? 'event',
                'title' => $title,
            ];
                    }

                    return $validated;
                }
            }

