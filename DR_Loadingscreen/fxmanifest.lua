game 'common'

fx_version 'cerulean'
author 'ESX-Framework'
description 'Custom ESX Loading Screen'
version '2.0.0'
lua54 'yes'

loadscreen 'index.html'

loadscreen_manual_shutdown "yes"

client_script 'client/client.lua'

files {
    'index.html',
    './css/index.css',
    './js/index.js',
    './vid/background.mp4',
    './vid/background.webm',
    './img/logo.png',
    './img/staff/*.png',
    './img/staff/*.jpg',
    './img/staff/*.webp',
    './music/*.mp3',
    './music/*.ogg',
    './music/*.wav',
}
