# Xiaomi Home token extractor

A simple script to extract Xiaomi Home devices tokens from an unencrypted iOS backup.

> Only tested on MacOS.

## Installation

### MacOS

**macOS x64**
```sh
curl -o- https://github.com/LeoMartinDev/Mi-Home-token-extractor/releases/latest/download/mi-home-token-extractor-macos-x64 | bash
```

**macOS arm64**
```sh
curl -o- https://github.com/LeoMartinDev/Mi-Home-token-extractor/releases/latest/download/mi-home-token-extractor-macos-arm64 | bash
```

### Linux

```sh
curl -o- https://github.com/LeoMartinDev/Mi-Home-token-extractor/releases/latest/download/mi-home-token-extractor-linux | bash
```

### Windows

```sh
curl -o- https://github.com/LeoMartinDev/Mi-Home-token-extractor/releases/latest/download/mi-home-token-extractor-windows | bash
```

Alternatively, clone the repo, run `bun install` and launch the script `bun start` !

## Usage

1. Connect your Xiaomi Home devices in the Xiaomi app.
2. Create an unencrypted iOS backup: https://support.apple.com/en-us/118426#computer
3. Run `token-extractor`.
4. Profit!

```sh
> ./token-extractor-macos-arm64

Found 1 backups
Using backup iPhone de Léo (2024-05-29T14:11:51.000Z)
Found 1 devices

DEVICE    My device
TOKEN     unencrypted_token
MAC       CC:CC:CC:CC:CC:CC
LOCAL IP  0.0.0.0
SSID      MY_SSID
```
