# Xiaomi Home token extractor

A simple script to extract Xiaomi Home devices tokens from an unencrypted iOS backup.

> Only tested on MacOS Catalina

## Installation

```sh
curl -o- https://github.com/LeoMartinDev/Mi-Home-token-extractor/releases/latest/download/mi-home-token-extractor-linux | bash
```
```sh
wget -qO- https://github.com/LeoMartinDev/Mi-Home-token-extractor/releases/latest/download/mi-home-token-extractor-linux | bash
```

Alternatively, clone the repo, switch to Node v12, run `npm i` and launch the script `npm start` !

```
> ./mi-home-token-extractor --help

Usage: mi-home-token-extractor [options]

Options:
  -V, --version      output the version number
  -s, --ssid <ssid>  filter devices by SSID
  -n, --name <name>  filter devices by name
  -h, --help         display help for command
```

You can simply run `./mi-home-token-extractor` without options to get a list of your Mi Home devices with corresponding decrypted `token`.

```
> ./mi-home-token-extractor 

Lampe de bureau - Livebox-Z300
[TOKEN] a40264428ecc981f8eecb381116c50b8
[IP] 192.168.1.12 - [MAC] 5C:5C:5C:5C:5C:5C

Lampe de chevet de Léo - Livebox-Z300
[TOKEN] a40264428ecc981f8eecb381116c50b8
[IP] 192.168.1.14 - [MAC] 5C:5C:5C:5C:5C:5C
```

`--ssid`option allows you to filter devices based on which SSID they are connected to which can be helpful when you have several homes attached to your Mi Home application.

## How to get my Xiaomi Home devices tokens ?

1. Download __Xiaomi Home token extractor__
2. Create an unencrypted iOS backup https://support.apple.com/en-us/HT203977#computer
3. Run `./mi-home-token-extractor`

> There is other methods to find your devices tokens, check https://github.com/Maxmudjon/com.xiaomi-miio/blob/master/docs/obtain_token.md
