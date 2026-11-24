# BelanjaKu Maven Wrapper bootstrap for Windows PowerShell.
# Downloads the configured Maven distribution once, caches it under the user's
# .m2 folder, and forwards all arguments to Maven.

$MavenArgs = $args
$ErrorActionPreference = 'Stop'

try {
    $propertiesFile = Join-Path $PSScriptRoot 'maven-wrapper.properties'
    if (-not (Test-Path -LiteralPath $propertiesFile)) {
        throw "File konfigurasi wrapper tidak ditemukan: $propertiesFile"
    }

    $propertiesText = Get-Content -LiteralPath $propertiesFile -Raw
    $match = [regex]::Match($propertiesText, '(?m)^\s*distributionUrl\s*=\s*(\S+)\s*$')
    if (-not $match.Success) {
        throw 'distributionUrl tidak ditemukan di maven-wrapper.properties.'
    }

    $distributionUrl = $match.Groups[1].Value.Trim()
    $archiveName = [System.IO.Path]::GetFileName(([uri]$distributionUrl).AbsolutePath)
    if (-not $archiveName.EndsWith('-bin.zip')) {
        throw "URL distribusi Maven harus mengarah ke arsip *-bin.zip. URL saat ini: $distributionUrl"
    }

    $distributionFolder = $archiveName -replace '-bin\.zip$', ''
    $mavenRoot = Join-Path $HOME '.m2\wrapper\dists'
    $mavenHome = Join-Path $mavenRoot $distributionFolder
    $mavenCommand = Join-Path $mavenHome 'bin\mvn.cmd'

    if (-not (Test-Path -LiteralPath $mavenCommand)) {
        Write-Host "Maven belum tersedia. Mengunduh $archiveName untuk BelanjaKu..." -ForegroundColor Cyan
        New-Item -ItemType Directory -Path $mavenRoot -Force | Out-Null

        $tempFolder = Join-Path $env:TEMP ('belanjaku-maven-' + [guid]::NewGuid().ToString('N'))
        New-Item -ItemType Directory -Path $tempFolder -Force | Out-Null

        try {
            $zipFile = Join-Path $tempFolder $archiveName
            [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
            Invoke-WebRequest -UseBasicParsing -Uri $distributionUrl -OutFile $zipFile
            Write-Host 'Unduhan selesai. Mengekstrak Maven...' -ForegroundColor Cyan
            Expand-Archive -LiteralPath $zipFile -DestinationPath $tempFolder -Force

            $extractedFolder = Join-Path $tempFolder $distributionFolder
            $extractedMavenCommand = Join-Path $extractedFolder 'bin\mvn.cmd'
            if (-not (Test-Path -LiteralPath $extractedMavenCommand)) {
                $candidate = Get-ChildItem -LiteralPath $tempFolder -Directory |
                    Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'bin\mvn.cmd') } |
                    Select-Object -First 1
                if ($null -eq $candidate) {
                    throw 'File bin\mvn.cmd tidak ditemukan setelah arsip Maven diekstrak.'
                }
                $extractedFolder = $candidate.FullName
            }

            if (Test-Path -LiteralPath $mavenHome) {
                Remove-Item -LiteralPath $mavenHome -Recurse -Force
            }
            Move-Item -LiteralPath $extractedFolder -Destination $mavenHome
        }
        finally {
            if (Test-Path -LiteralPath $tempFolder) {
                Remove-Item -LiteralPath $tempFolder -Recurse -Force -ErrorAction SilentlyContinue
            }
        }
    }

    if (-not (Test-Path -LiteralPath $mavenCommand)) {
        throw "Maven belum siap. File tidak ditemukan: $mavenCommand"
    }

    & $mavenCommand @MavenArgs
    $mavenExitCode = $LASTEXITCODE
    if ($null -eq $mavenExitCode) { $mavenExitCode = 0 }
    exit $mavenExitCode
}
catch {
    Write-Host "Maven Wrapper BelanjaKu gagal: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host 'Pastikan internet aktif saat pertama kali menjalankan wrapper.' -ForegroundColor Yellow
    exit 1
}
