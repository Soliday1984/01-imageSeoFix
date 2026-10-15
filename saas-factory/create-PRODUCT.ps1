$script = Join-Path $PSScriptRoot 'scripts\create-product.mjs'

node $script @args
exit $LASTEXITCODE
