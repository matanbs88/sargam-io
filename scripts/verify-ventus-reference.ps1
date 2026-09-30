$ErrorActionPreference = 'Stop'
$root = Join-Path $PSScriptRoot '..'
$reference = Join-Path $root 'output/tools/conNCW-NG/src/ConNCW.Core'
$files = @('Bit/BitReader.cs','Bit/BitWriter.cs','Models/AudioFormat.cs','Models/NcwHeader.cs','Signatures/SignatureEntry.cs','Signatures/SignatureStore.cs','Ncw/NcwBlockHeader.cs','Ncw/NcwFile.cs')
$imports = [System.Collections.Generic.HashSet[string]]::new()
@('using System;','using System.IO;','using System.Linq;','using System.Collections.Generic;') | ForEach-Object { [void]$imports.Add($_) }
$bodies = foreach ($file in $files) {
  $content = Get-Content -LiteralPath (Join-Path $reference $file) -Raw
  foreach ($match in [regex]::Matches($content, '(?m)^using [^\r\n]+;')) { [void]$imports.Add($match.Value) }
  $content = [regex]::Replace($content, '(?m)^using [^\r\n]+;', '')
  $content = [regex]::Replace($content, '(?m)^namespace ([^;]+);', 'namespace $1 {')
  $content + "`n}"
}
# Compile the separately maintained reference implementation unchanged in memory.
# Only namespace wrappers replace file-scoped syntax for a single compilation unit.
Add-Type -TypeDefinition (($imports -join "`n") + "`n" + ($bodies -join "`n")) -CompilerOptions '/nullable:enable'
$store = [ConNCW.Core.Signatures.SignatureStore]::new((Join-Path $reference 'Signatures/signatures.json'))
$manifest = Get-Content -LiteralPath (Join-Path $root 'src/lib/ventusSamples.json') -Raw | ConvertFrom-Json
$destination = Join-Path $root 'output/ventus-reference'
[void][System.IO.Directory]::CreateDirectory($destination)
foreach ($sample in $manifest) {
  $source = Join-Path 'C:/Users/matan/OneDrive/Documents/Ventus Winds Bansuri/Samples/SustainNormal' $sample.source
  $decoded = [ConNCW.Core.Ncw.NcwFile]::Open($source, $store, $false)
  $bytes = [byte[]]::new($decoded.Samples.Length * 4)
  [System.Buffer]::BlockCopy($decoded.Samples, 0, $bytes, 0, $bytes.Length)
  [System.IO.File]::WriteAllBytes((Join-Path $destination ($sample.source + '.pcm32')), $bytes)
  Write-Output "$($sample.source): $($decoded.Samples.Length) PCM samples"
}
