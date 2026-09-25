const brightness_input = document.getElementById('brightness');

let new_value;


async function get_tab_id() {
    // It can be assumed that querying for tabs that are both active and current will
    //  always result in one tab, even if there are two tabs in split view mode.
    const [tab] = await browser.tabs.query({active: true, currentWindow: true});
    return tab.id;
}


async function get_session_by_pair(a, b) {
    const key = `${a}-${b}`;
    const session = await browser.storage.session.get(key);
    return session[key];
}


async function set_session_by_pair(a, b, value) {
    const key = `${a}-${b}`;
    await browser.storage.session.set({[key]: value});
}


async function set_brightness() {
    const tab_id = await get_tab_id();

    const old_value = await get_session_by_pair('bright', tab_id);

    let value = new_value;
    if (value === undefined) {
        value = old_value || 100;
    }

    await set_session_by_pair('bright', tab_id, value);

    // Swap CSS by inserting first and then removing the previous. Usage of style
    //  properties can cause conflicts within the page JS and can be detected.
    await browser.scripting.insertCSS({ // Must be awaited as order of execution is needed.
        target: {tabId: tab_id},
        css: `html {filter: brightness(${value}%) !important;}`,
        origin: 'USER'
    });

    // Only remove CSS if old value is not undefined and not the same.
    if (old_value !== undefined && old_value !== value) {
        await browser.scripting.removeCSS({
            target: {tabId: tab_id},
            css: `html {filter: brightness(${old_value}%) !important;}`,
            origin: 'USER'
        });
    }

    // Rate limit and prevent race condition, but runs with no new value.
    setTimeout(set_brightness, 50);
}


brightness_input.oninput = function (e) {
    new_value = e.target.value;
};


set_brightness();


// Restore input value on initial run.
brightness_input.value = await get_session_by_pair('bright', await get_tab_id()) || 100;
