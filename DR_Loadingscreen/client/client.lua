local loaded = false

RegisterNUICallback('openDiscord', function(data, cb)
    SetClipboardText(data.url)
    cb({ ok = true })
end)

AddEventHandler("playerSpawned", function()
    if not loaded then
        loaded = true
        SendNUIMessage({ type = 'loadProgress', loadFraction = 1.0, status = 'Vítej na serveru!' })
        Wait(800)
        ShutdownLoadingScreenNui()
        DoScreenFadeOut(0)
        Wait(3000)
        DoScreenFadeIn(2500)
    end
end)
