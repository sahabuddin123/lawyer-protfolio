<?php

$chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function renderPage(string $url, string $savePath, int $waitMs = 5000): void
{
    global $chromePath;
    $cmd = sprintf(
        '"%s" --headless=new --disable-gpu --virtual-time-budget=%d --dump-dom %s',
        $chromePath,
        $waitMs,
        escapeshellarg($url)
    );

    $descriptors = [
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];

    $proc = proc_open($cmd, $descriptors, $pipes);
    if (is_resource($proc)) {
        $dom = stream_get_contents($pipes[1]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        proc_close($proc);

        file_put_contents($savePath, $dom);
        $len = strlen($dom);
        echo "Rendered {$url} -> {$savePath} ({$len} bytes)\n";
    }
}

echo "=== HEADLESS CHROME BROWSER VERIFICATION ===\n";

// 1. Render Admin Login page
renderPage('http://127.0.0.1:8000/admin/login', 'scratch/browser_login.html', 5000);

// 2. Render Unauthenticated Admin route (verify redirection / guard)
renderPage('http://127.0.0.1:8000/admin/users', 'scratch/browser_unauth_users.html', 5000);

// 3. Render Public Home page
renderPage('http://127.0.0.1:8000/', 'scratch/browser_public_home.html', 5000);

echo "\nDone!\n";
