$ErrorActionPreference = 'Stop'

$appId = 'com.pmfdev.piruleta'
$mainActivity = '.MainActivity'
$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')

Push-Location $projectRoot
try {
  cmd /c npm run build
  cmd /c npx cap copy android

  $distBundle = Get-ChildItem 'dist/assets/index-*.js' | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  $androidBundle = Get-ChildItem 'android/app/src/main/assets/public/assets/index-*.js' | Sort-Object LastWriteTime -Descending | Select-Object -First 1

  if (-not $distBundle -or -not $androidBundle) {
    throw 'No se encontraron bundles JS en dist o android assets.'
  }

  if ($distBundle.Name -ne $androidBundle.Name) {
    throw "Hash desalineado: dist=$($distBundle.Name) android=$($androidBundle.Name)"
  }

  $jbrPath = 'C:\Program Files\Android\Android Studio\jbr'
  if (Test-Path $jbrPath) {
    $env:JAVA_HOME = $jbrPath
    $env:Path = "$jbrPath\\bin;$env:Path"
  }

  Push-Location 'android'
  try {
    .\gradlew.bat installDebug
  }
  finally {
    Pop-Location
  }

  $adb = Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools\adb.exe'
  if (-not (Test-Path $adb)) {
    throw "No se encontro adb en $adb"
  }

  & $adb shell pm clear $appId | Out-Null
  & $adb shell am start -n "$appId/$mainActivity" | Out-Null

  Start-Sleep -Seconds 2
  $loaded = & $adb logcat -d | Select-String 'Handling local request: https://localhost/assets/index-.*\.js' | Select-Object -Last 1
  if ($loaded) {
    Write-Output $loaded.Line
  }

  Write-Output "Android deploy OK con bundle $($distBundle.Name)"
}
finally {
  Pop-Location
}
