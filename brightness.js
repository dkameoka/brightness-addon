
let brightness_input = document.getElementById('brightness');


async function set_brightness(tabId, value) {
    await browser.scripting.executeScript({
        target: {tabId: tab.id},
        func: (brightness) => {
            document.documentElement.style.setProperty('--brightness-value', `${brightness}%`);
        },
        args: [value]
    });
    await browser.storage.session.set({[`bright-${tab.id}`]: value});
}


brightness_input.oninput = async (e) => {
    const [tab] = await browser.tabs.query({active: true, currentWindow: true});
    set_brightness(tab.id, e.target.value);
};


// It can be assumed that querying for tabs that are both active and current will always result in
// one tab, even if there are two tabs in split view mode.
const [tab] = await browser.tabs.query({active: true, currentWindow: true});

// Retrieve style property to detect if CSS needs to be inserted.
// TODO: Allow customizing of property name to avoid collisions and profiling?
const [prop_result] = await browser.scripting.executeScript({
    target: {tabId: tab.id},
    func: (prop_name) => {
        return document.documentElement.style.getPropertyValue(prop_name);
    },
    args: ['--brightness-value']
});
const prop_value = prop_result.result;
if (prop_value.length === 0) {
    await browser.scripting.insertCSS({
        target: {tabId: tab.id},
        css: 'html {filter: brightness(var(--brightness-value)) !important;}',
        origin: 'USER'
    });
}

// Restore brightness and input value.
const key = `bright-${tab.id}`;
const values = await browser.storage.session.get(key);
const value = values[key] || 100;
set_brightness(tab.id, value);
brightness_input.value = value;
