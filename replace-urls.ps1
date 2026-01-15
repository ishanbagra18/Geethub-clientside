# PowerShell script to replace hardcoded URLs with API_BASE_URL

$files = Get-ChildItem -Path "." -Include *.jsx -Recurse

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    if ($content -match "http://localhost:9000") {
        Write-Host "Processing: $($file.FullName)"
        
        # Replace all instances
        $content = $content -replace 'http://localhost:9000', '${API_BASE_URL}'
        $content = $content -replace '\$\{API_BASE_URL\}', '${API_BASE_URL}'
        
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Updated: $($file.Name)"
    }
}

Write-Host "`nReplacement complete!"
