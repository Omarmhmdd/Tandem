<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ValidationTest extends TestCase
{
    public function test_email_validation(): void
    {
        $validEmail = 'test@example.com';
        $invalidEmail = 'invalid-email';

        $this->assertTrue(filter_var($validEmail, FILTER_VALIDATE_EMAIL) !== false);
        $this->assertFalse(filter_var($invalidEmail, FILTER_VALIDATE_EMAIL) !== false);
    }

    public function test_url_validation(): void
    {
        $validUrl = 'https://example.com';
        $invalidUrl = 'not-a-url';

        $this->assertTrue(filter_var($validUrl, FILTER_VALIDATE_URL) !== false);
        $this->assertFalse(filter_var($invalidUrl, FILTER_VALIDATE_URL) !== false);
    }

    public function test_numeric_validation(): void
    {
        $this->assertTrue(is_numeric('123'));
        $this->assertTrue(is_numeric(123));
        $this->assertTrue(is_numeric('123.45'));
        $this->assertFalse(is_numeric('abc'));
    }

    public function test_date_format_validation(): void
    {
        $validDate = '2026-01-24';
        $invalidDate = '24-01-2026';

        $timestamp1 = strtotime($validDate);
        $timestamp2 = strtotime($invalidDate);

        $this->assertNotFalse($timestamp1);
        $this->assertNotFalse($timestamp2); // Both are valid, just different formats
    }

    public function test_array_key_exists(): void
    {
        $array = ['name' => 'John', 'age' => 30];

        $this->assertTrue(array_key_exists('name', $array));
        $this->assertTrue(array_key_exists('age', $array));
        $this->assertFalse(array_key_exists('email', $array));
    }

    public function test_string_length_validation(): void
    {
        $shortString = 'test';
        $longString = str_repeat('a', 100);

        $this->assertLessThan(10, strlen($shortString));
        $this->assertGreaterThan(50, strlen($longString));
    }
}
