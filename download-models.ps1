# Download face-api.js models properly

$modelsDir = "public\models"
New-Item -ItemType Directory -Path $modelsDir -Force | Out-Null

# GitHub raw URLs for models
$baseUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

$models = @(
    "tiny_face_detector_model-weights_manifest.json",
    "tiny_face_detector_model-shard1",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1"
)

Write-Host "Downloading face-api.js models..." -ForegroundColor Cyan
Write-Host ""

foreach ($model in $models) {
    $url = "$baseUrl/$model"
    $output = "$modelsDir\$model"
    
    Write-Host "Downloading: $model..." -NoNewline
    
    try {
        # Use WebClient for better binary file handling
        $webClient = New-Object System.Net.WebClient
        $webClient.DownloadFile($url, $output)
        
        $fileSize = (Get-Item $output).Length
        Write-Host " OK ($fileSize bytes)" -ForegroundColor Green
    }
    catch {
        Write-Host " FAILED" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Download complete!" -ForegroundColor Green
Write-Host "Models saved to: $modelsDir" -ForegroundColor Yellow
