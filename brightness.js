
let brightness_range = document.getElementById('brightness');

brightness_range.onchange = function(e) {
    browser.tabs.query({active: true, currentWindow: true}).then(async tabs => {
        for (const tab of tabs) {
            //Set new brightness first to reduce flashing.
            let new_brightness = parseInt(e.target.value);
            await browser.scripting.insertCSS({
                target: {tabId: tab.id},
                css: 'html {filter: brightness(' + new_brightness + '%) !important;}'
            });

            //Remove older brightness CSS. browser.storage.session does not yet exist in Firefox as of Dec 2022.
            //browser.storage.session.get({[tab.id]: 100}).then(result => {
            //    let brightness = parseInt(result[tab.id]);
            await browser.sessions.getTabValue(tab.id,'brightness').then(result => {
                let brightness = parseInt(result);
                browser.scripting.removeCSS({
                    target: {tabId: tab.id},
                    css: 'html {filter: brightness(' + brightness + '%) !important;}'
                });
            });

            // Store new brightness
            //browser.storage.session.set({[tab.id]: [new_brightness]});
            browser.sessions.setTabValue(tab.id,'brightness',new_brightness);
        }
    });
};

browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
    for (const tab of tabs) {
        browser.sessions.getTabValue(tab.id,'brightness').then(result => {
            if (result == undefined) {
                brightness_range.value = '100';
            } else {
                brightness_range.value = result;
            }
        });
    }
});
