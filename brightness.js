
let brightness_input = document.getElementById('brightness');

// TODO: Switch to "browser.storage.session"; though, it does not yet exist in Firefox as of Dec 2022.
brightness_input.oninput = function(e) {
    browser.tabs.query({active: true, currentWindow: true}).then(async tabs => {
        for (const tab of tabs) {
            // Set new brightness first to reduce flashing.
            let brightness_step = parseInt(e.target.value);
            await browser.scripting.insertCSS({
                target: {tabId: tab.id},
                css: 'html {filter: brightness(' + brightness_step * 10 + '%) !important;}'
            });

            // Iterate to remove all other possible inserted CSS.
            for (let step = 0;step < 10;step++) {
                if (step == brightness_step) {
                    continue;
                }
                browser.scripting.removeCSS({
                    target: {tabId: tab.id},
                    css: 'html {filter: brightness(' + step * 10 + '%) !important;}'
                });
            }

            // Store new brightness
            browser.sessions.setTabValue(tab.id,'brightness_step',brightness_step);
        }
    });
};

browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
    for (const tab of tabs) {
        browser.sessions.getTabValue(tab.id,'brightness_step').then(result => {
            if (result == undefined) {
                brightness_input.value = '100';
            } else {
                brightness_input.value = result;
            }
        });
    }
});
