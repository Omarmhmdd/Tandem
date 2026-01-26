<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Data\PartnerData;

class PartnerDataTest extends TestCase
{
    public function test_entry_creates_correct_structure(): void
    {
        $result = PartnerData::entry('test-id', 'Test Partner', 'https://example.com/logo.png');

        $this->assertIsArray($result);
        $this->assertEquals('test-id', $result['id']);
        $this->assertEquals('Test Partner', $result['name']);
        $this->assertEquals('https://example.com/logo.png', $result['logo']);
        $this->assertCount(3, $result);
    }

    public function test_all_returns_array_of_partners(): void
    {
        $result = PartnerData::all();

        $this->assertIsArray($result);
        $this->assertCount(4, $result);
    }

    public function test_all_contains_instacart(): void
    {
        $result = PartnerData::all();

        $instacart = array_filter($result, fn($p) => $p['id'] === 'instacart');
        $this->assertCount(1, $instacart);
        
        $instacart = array_values($instacart)[0];
        $this->assertEquals('Instacart', $instacart['name']);
        $this->assertStringContainsString('instacart.com', $instacart['logo']);
    }

    public function test_all_contains_amazon_fresh(): void
    {
        $result = PartnerData::all();

        $amazon = array_filter($result, fn($p) => $p['id'] === 'amazon-fresh');
        $this->assertCount(1, $amazon);
        
        $amazon = array_values($amazon)[0];
        $this->assertEquals('Amazon Fresh', $amazon['name']);
    }

    public function test_all_contains_walmart(): void
    {
        $result = PartnerData::all();

        $walmart = array_filter($result, fn($p) => $p['id'] === 'walmart-grocery');
        $this->assertCount(1, $walmart);
        
        $walmart = array_values($walmart)[0];
        $this->assertEquals('Walmart Grocery', $walmart['name']);
    }

    public function test_all_contains_shipt(): void
    {
        $result = PartnerData::all();

        $shipt = array_filter($result, fn($p) => $p['id'] === 'shipt');
        $this->assertCount(1, $shipt);
        
        $shipt = array_values($shipt)[0];
        $this->assertEquals('Shipt', $shipt['name']);
    }

    public function test_all_partners_have_required_fields(): void
    {
        $result = PartnerData::all();

        foreach ($result as $partner) {
            $this->assertArrayHasKey('id', $partner);
            $this->assertArrayHasKey('name', $partner);
            $this->assertArrayHasKey('logo', $partner);
            $this->assertNotEmpty($partner['id']);
            $this->assertNotEmpty($partner['name']);
            $this->assertNotEmpty($partner['logo']);
        }
    }

    public function test_all_partner_logos_are_urls(): void
    {
        $result = PartnerData::all();

        foreach ($result as $partner) {
            $this->assertStringStartsWith('https://', $partner['logo']);
        }
    }
}
