// Regex matching fully quantified http and https links
let regex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;

// checks if a node should be updated. Returns true when it has been updated, or false otherwise
function checkNode(a) {
    // only allow <a> nodes
    if (a.nodeName != 'A') {
        return false;
    }

    // Only allow nodes that have no children other than text
    if (a.childNodes.length != 1 || a.firstChild.nodeName != "#text") {
        return false;
    }

    // Only allow nodes whose text is entirely a valid fully quantified http or https url
    let linkText = a.firstChild.textContent;
    let currentHref = a.href;

    if (regex.exec(linkText) == null) {
        return false;
    }

    // Only allow nodes that have a href different from the url presented to the user
    if (linkText == currentHref) {
        return false;
    }

    // Update the <a> link of the url to it's represented link
    a.href = linkText;
    return true;
}


function scanNode(node) {
    // Ignore special nodes. (e.g., #text)
    if (node.nodeName.startsWith('#')) {
        return;
    }

    // Scan all <a> links
    let children = node.getElementsByTagName('a');
    for (let i = 0; i < children.length; i++) {
        checkNode(children[i]);
    }
}


function onDomMutation(mutationList, observer) {
    mutationList.forEach((mutation) => {
        switch (mutation.type) {
            case "childList":
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    scanNode(mutation.addedNodes[i]);
                }
                break;
        }
    });
}

// Watch for dynamically created <a> links
let mutationObserver = new MutationObserver(onDomMutation);
let mutationConfig = {
    childList: true,
    subtree: true,
    attribute: false
}

// Scan for existing <a> links
scanNode(document.body);

// Start the observer
mutationObserver.observe(document.body, mutationConfig);