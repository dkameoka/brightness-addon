
let brightness_input = document.getElementById('brightness');


async function set_brightness(tabId, value) {
    await browser.scripting.executeScript({
        target: {tabId: tab.id},
        func: (brightness) => {
            document.documentElement.style.setProperty('--brightness-value', `${brightness}%`);
        },
        args: [value]
    });
}


brightness_input.oninput = async (e) => {
    const [tab] = await browser.tabs.query({active: true, currentWindow: true});
    set_brightness(tab.id, e.target.value);
    await browser.storage.session.set({[`bright-${tab.id}`]: e.target.value});
};


// It can be assumed that querying for tabs that are both active and current will always result in
// one tab, even if there are two tabs in split view mode.
const [tab] = await browser.tabs.query({active: true, currentWindow: true});

// Insert CSS if the tab id is not stored with a value. Tab id is unique until browser restart.
// Storage of session type is also cleared on browser restart. This also allows tracking of
// inserted CSS.
const key = `bright-${tab.id}`;
const values = await browser.storage.session.get(key);
const value = values[key];
if (value == undefined) {
    await browser.scripting.insertCSS({
        target: {tabId: tab.id},
        css: 'html {filter: brightness(var(--brightness-value)) !important;}'
    });
    await browser.storage.session.set({[`bright-${tab.id}`]: 100});
} else {
    set_brightness(tab.id, value);
    brightness_input.value = value;
}
