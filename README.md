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
[TOKEN] dd23817c662dcccbb4ab8fcf1e658b1c37925ad79a39cdcb205a966f2ff9a3cd0143db63ee66b0cdff9f69917680151e
[IP] 192.168.1.12 - [MAC] 5C:5C:5C:5C:5C:5C

Lampe de chevet de Léo - Livebox-Z300
[TOKEN] b76415c00b2488f248fd248c2e379f79850e478ed0ea0ae0a0559a420e4e95ed0143db63ee66b0cdff9f69917680151e
[IP] 192.168.1.14 - [MAC] 5C:5C:5C:5C:5C:5C
```

`--ssid`option allows you to filter devices based on which SSID they are connected to which can be helpful when you have several homes attached to your Mi Home application.

## How to get my Xiaomi Home devices tokens ?

1. Download __Xiaomi Home token extractor__
2. Create an unencrypted iOS backup https://support.apple.com/en-us/HT203977#computer
3. Run `./mi-home-token-extractor`

> There is other methods to find your devices tokens, check https://github.com/Maxmudjon/com.xiaomi-miio/blob/master/docs/obtain_token.md
