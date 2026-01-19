<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class ServeAllCommand extends Command
{
    protected $signature = 'serve:all {--host=127.0.0.1 : The host address to serve the application on} {--port=8000 : The port to serve the application on}';
    protected $description = 'Start Laravel server with queue worker and scheduler';

    private array $processes = [];

    public function handle()
    {
        $this->info(' Starting Tandem Server with all background processes...');
        $this->newLine();

        // Get host and port from options
        $host = $this->option('host');
        $port = $this->option('port');

        // Start Laravel development server
        $this->info(' Starting Laravel Server on http://' . $host . ':' . $port);
        $this->startProcess('server', ['php', 'artisan', 'serve', '--host=' . $host, '--port=' . $port]);

        // Wait a moment for server to start
        sleep(2);

        // Start Queue Worker
        $this->info(' Starting Queue Worker (RAG processing)');
        $this->startProcess('queue', ['php', 'artisan', 'queue:work', '--sleep=3', '--tries=3']);

        // Start Scheduler
        $this->info(' Starting Scheduler (Notifications)');
        $this->startProcess('scheduler', ['php', 'artisan', 'schedule:work']);

        $this->newLine();
        $this->info(' All services started successfully!');
        $this->newLine();
        $this->line('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->line('  Running Services:');
        $this->line('  • Laravel Server: http://' . $host . ':' . $port);
        $this->line('  • Queue Worker: Processing RAG jobs');
        $this->line('  • Scheduler: Sending habit notifications');
        $this->line('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->newLine();
        $this->warn('Press Ctrl+C to stop all services');
        $this->newLine();

        // Keep the command running and monitor processes
        $this->monitorProcesses();

        return Command::SUCCESS;
    }

    private function startProcess(string $name, array $command): void
    {
        $process = new Process($command);
        $process->setTimeout(null);
        $process->start();

        $this->processes[$name] = $process;
    }

    private function monitorProcesses(): void
    {
        // Register shutdown handler (only on Unix systems)
        if (function_exists('pcntl_async_signals') && function_exists('pcntl_signal')) {
            pcntl_async_signals(true);
            
            if (defined('SIGINT')) {
                pcntl_signal(SIGINT, function () {
                    $this->stopAllProcesses();
                    exit(0);
                });
            }

            if (defined('SIGTERM')) {
                pcntl_signal(SIGTERM, function () {
                    $this->stopAllProcesses();
                    exit(0);
                });
            }
        }

        // Keep running and check process status
        while (true) {
            foreach ($this->processes as $name => $process) {
                if (!$process->isRunning()) {
                    $this->error("⚠️  Process '{$name}' has stopped unexpectedly!");
                    $this->stopAllProcesses();
                    exit(1);
                }
            }

            sleep(1);
        }
    }

    private function stopAllProcesses(): void
    {
        $this->newLine();
        $this->info(' Stopping all services...');

        foreach ($this->processes as $name => $process) {
            if ($process->isRunning()) {
                // Use SIGINT if available (Unix), otherwise just stop gracefully
                $signal = defined('SIGINT') ? SIGINT : null;
                $process->stop(3, $signal);
                $this->line("  • Stopped {$name}");
            }
        }

        $this->info(' All services stopped successfully!');
    }

    public function __destruct()
    {
        $this->stopAllProcesses();
    }
}
