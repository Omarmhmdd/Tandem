<?php

namespace App\Services\Rag;

use Illuminate\Http\Client\Factory;
use Illuminate\Http\Client\Response;
use GuzzleHttp\Promise\PromiseInterface;

class QdrantClient
{
    private Factory $http;
    private array $headers;

    public function __construct(array $headers)
    {
        $this->headers = $headers;
        $this->http = new Factory();
    }

    public function get(string $url): Response
    {
        $response = $this->http->withHeaders($this->headers)->get($url);
        return $response instanceof PromiseInterface ? $response->wait() : $response;
    }

    public function post(string $url, array $data = []): Response
    {
        $response = $this->http->withHeaders($this->headers)->post($url, $data);
        return $response instanceof PromiseInterface ? $response->wait() : $response;
    }

    public function put(string $url, array $data = []): Response
    {
        $response = $this->http->withHeaders($this->headers)->put($url, $data);
        return $response instanceof PromiseInterface ? $response->wait() : $response;
    }
}

