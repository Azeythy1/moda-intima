# Cria o repositório pollishop-moda no GitHub e envia o código atual.
# Pré-requisito: gh auth login (autenticado como Azeythy1)

$ErrorActionPreference = "Stop"
$RepoName = "pollishop-moda"
$Description = "PolliShop - Catálogo de Moda Íntima e Fitness (lingerie, cuecas, fitness)"

$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

Write-Host "Verificando autenticação GitHub..." -ForegroundColor Cyan
gh auth status
if ($LASTEXITCODE -ne 0) {
    Write-Host "Execute primeiro: gh auth login" -ForegroundColor Red
    exit 1
}

Set-Location (Split-Path $PSScriptRoot -Parent)

if (git remote get-url origin-eletronicos 2>$null) {
    Write-Host "Remote origin-eletronicos já existe." -ForegroundColor Yellow
} elseif (git remote get-url origin 2>$null) {
    $currentOrigin = git remote get-url origin
    if ($currentOrigin -match "pollishop-eletroinicos") {
        Write-Host "Renomeando origin -> origin-eletronicos" -ForegroundColor Cyan
        git remote rename origin origin-eletronicos
    }
}

if (git remote get-url origin 2>$null) {
    Write-Host "Remote origin já configurado: $(git remote get-url origin)" -ForegroundColor Yellow
} else {
    Write-Host "Criando repositório $RepoName no GitHub..." -ForegroundColor Cyan
    gh repo create $RepoName `
        --public `
        --description $Description `
        --source . `
        --remote origin `
        --push
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Repositório criado com sucesso!" -ForegroundColor Green
    gh repo view --web
} else {
    Write-Host "Falha ao criar o repositório." -ForegroundColor Red
    exit 1
}
