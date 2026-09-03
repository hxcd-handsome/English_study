Add-Type -AssemblyName System.Runtime.WindowsRuntime
$path = Get-ChildItem -Recurse -Filter *.png | Select-Object -First 1 -ExpandProperty FullName
$stream = [System.IO.File]::OpenRead($path)
try {
  $ras = [System.IO.WindowsRuntimeStreamExtensions]::AsRandomAccessStream($stream)
  $decoder = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($ras).GetAwaiter().GetResult()
  $bitmap = $decoder.GetSoftwareBitmapAsync().GetAwaiter().GetResult()
  $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
  if (-not $engine) { throw 'No OCR engine' }
  $result = $engine.RecognizeAsync($bitmap).GetAwaiter().GetResult()
  $result.Text
} finally {
  $stream.Dispose()
}
