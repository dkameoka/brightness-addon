
let brightness_input = document.getElementById('brightness');

// TODO: Switch to "browser.storage.session"; though, it does not yet exist in Firefox as of Dec 2022.
async function set_brightness(tabId,value) {
    // Set new brightness first to reduce flashing.
    let brightness_step = parseInt(value);
    await browser.tabs.insertCSS(tabId,{
        code: 'html {filter: brightness(' + brightness_step * 10 + '%) !important;}'
    });

    // Iterate to remove all other possible inserted CSS.
    for (let step = 0;step < 10;step++) {
        if (step == brightness_step) {
            continue;
        }
        await browser.tabs.removeCSS(tabId,{
            code: 'html {filter: brightness(' + step * 10 + '%) !important;}'
        });
    }

    // Store new brightness
    await browser.sessions.setTabValue(tabId,'brightness_step',brightness_step);
};

brightness_input.oninput = function(e) {
    browser.tabs.query({active: true,currentWindow: true}).then(async tabs => {
        for (const tab of tabs) {
            set_brightness(tab.id,e.target.value);
        }
    });
};

browser.tabs.query({active: true,currentWindow: true}).then(tabs => {
    for (const tab of tabs) {
        browser.sessions.getTabValue(tab.id,'brightness_step').then(result => {
            if (result == undefined) {
                brightness_input.value = '100';
            } else {
                brightness_input.value = result;
                set_brightness(tab.id,result);
            }
        });
    }
});

