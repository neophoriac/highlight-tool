function createElements(...arrays) {
    let createdElements = {};
    arrays.forEach(item => {
        if (typeof item === "string") { item = [item] };
        let el = document.createElement(item[0]);
        if (item[1]) {
            for (const prop in item[1]) {
                el.setAttribute(prop, item[1][prop]);
            };
        };
        if (item[2]) {
            createdElements[item[2]] = el;
        } else {
            let i = 1;
            while (createdElements[item[0] + i]) { i++ };
            createdElements[item[0] + i] = el;
        }
    });
    return createdElements;
};

function appendChilds(el, childs) {
    childs.forEach(child => {
        el.appendChild(child)
    });
};

function getColor() {
    let rgb = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)]; // get random RGB colors
    let hexColor = rgb.map(x => x.toString(16))
    hexColor = hexColor.map((val) => {
        if (val.length == 1) {
            return 0 + val
        } else {
            return val
        }
    })
    hexColor = '#' + hexColor.join(''); // complete hex color code
    let Y = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722; // calculate relative luminance with formula provided by ITU-R BT.709 color space standards src: https://en.wikipedia.org/wiki/Relative_luminance
    let color;
    Y >= 145 ? color = '#000000' : color = '#ffffff'; // if rgb is dark, color is white, else color is black
    return [hexColor, color, rgb, Y]; // return all info in an array
};

function visibleColor(rgb) {
    let Y = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    let color = Y >= 145 ? '#000000' : '#ffffff';
    return color;
}

function hexToRGB(hex) {
    hex = hex.substr(1);
    let rgb = [];
    for (let i = 0; i < hex.length; i += 2) {
        const color = hex.substr(i, 2);
        rgb.push(parseInt(color, 16))
    }
    return rgb
}


function lInterpRGB(rgb1, rgb2, dist) {
    let newPoint = [rgb1[0] + (rgb2[0] - rgb1[0]) * dist, rgb1[1] + (rgb2[1] - rgb1[1]) * dist, rgb1[2] + (rgb2[2] - rgb1[2]) * dist];
    return newPoint.map(val => Math.floor(val));
}

function RGBtoHex(rgb) {
    return '#' + rgb.map(x => x.toString(16)).join('')
}

function startHighlight({ bc = "yellow", c = "black", f = "flag-off", i = "", p = "", l = "", e = true, regex = false, wholeWords = true, is = false, bs = false, us = false }) {

    f = f === 'flag-on' ? 'gi' : 'g';

    let obj = {
        p: p,
        f: f,
        bc: bc,
        c: c,
        i: i,
        l: l,
        e: e,
        is: is,
        bs: bs,
        us: us,
        regex: regex,
        wholeWords: wholeWords
    };

    chrome.runtime.sendMessage({ command: { query: obj } })
};

function setAttributes(el, attributes) {
    for (const key in attributes) {
        el.setAttribute(key, attributes[key]);
    };
};

function cssStyle(el, string) {
    let styles = string.split(';');
    styles = styles.map(val => val.trim())

    styles.forEach(style => {
        style = style.split(':');
        el.style[style[0]] = style[1];
    })
}

function tooltipCreate(tooltip, element, comment, placement, arrow, type) {

    let elRect = element.getBoundingClientRect();

    let offsetArrow = 8;

    let centeredTip = (elRect.width - tooltip.offsetWidth) / 2;
    let centeredArrow = (tooltip.offsetWidth / 2) - (arrow.offsetWidth / 2);
    let top = elRect.top - tooltip.offsetHeight - 8;
    let bottom = elRect.top + elRect.height + 8;
    let center = elRect.left + centeredTip;
    let start = center - centeredArrow + offsetArrow;
    let end = center + centeredArrow - offsetArrow;

    let yPlacement, xPlacement, arrowX

    if (placement.indexOf("bottom") > -1) {
        if (bottom + tooltip.offsetHeight > tooltip.parentElement.offsetHeight) {
            yPlacement = top
            cssStyle(arrow, "bottom: -8px; top: initial; transform: rotate(180deg)");
            if (type !== "menu") {
                tooltip.className = "tooltip tip-bottom";
            }
        } else {
            yPlacement = bottom
            cssStyle(arrow, "bottom: initial; top: -8px; transform: rotate(0deg)");
            if (type !== "menu") {
                tooltip.className = "tooltip tip-top";
            }
        }
    }
    if (placement.indexOf("top") > -1) {
        if (top < 0) {
            yPlacement = bottom;
            cssStyle(arrow, "bottom: initial; top: -8px; transform: rotate(180deg)");
            if (type !== "menu") {
                tooltip.className = "tooltip tip-top";
            }
        } else {
            yPlacement = top;
            cssStyle(arrow, "bottom: -8px; top: initial; transform: rotate(0deg)");
            if (type !== "menu") {
                tooltip.className = "tooltip tip-bottom";
            }
        }

    }
    if (placement.indexOf("start") > -1) {
        if (start < 0) {
            xPlacement = start - start;
            arrowX = offsetArrow - start;
        } else {
            xPlacement = start;
            arrowX = offsetArrow;
        }
    }
    if (placement.indexOf("end") > -1) {
        if (end + tooltip.offsetWidth > tooltip.parentElement.offsetWidth) {
            xPlacement = end - (end + tooltip.offsetWidth - tooltip.parentElement.offsetWidth);
            arrowX = offsetArrow + (end + tooltip.offsetWidth - tooltip.parentElement.offsetWidth);
        } else {
            xPlacement = end;
            arrowX = offsetArrow;
        }
    }

    if (placement == "top-center") {
        placeToolTip(yPlacement, center, centeredArrow, 'left');
    }
    if (placement == "top-start") {
        placeToolTip(yPlacement, xPlacement, arrowX, 'right');
    }
    if (placement == "top-end") {
        placeToolTip(yPlacement, xPlacement, arrowX, 'left');
    }
    if (placement == "bottom-center") {
        placeToolTip(yPlacement, center, centeredArrow, 'left');
    }
    if (placement == "bottom-start") {
        placeToolTip(yPlacement, xPlacement, arrowX, 'right');
    }
    if (placement == "bottom-end") {
        placeToolTip(yPlacement, xPlacement, arrowX, 'left');
    }

    function placeToolTip(side, bodyPos, arrowPos, prop) {
        cssStyle(tooltip, `top: ${side}px; left: ${bodyPos}px;`);
        arrow.style[prop] = `${arrowPos}px`;
    }

}

function tooltip(element, comment, placement, event, type = "text") {

    const container = document.createElement('div');
    const message = document.createElement('span');
    const arrowUp = document.createElement('div');
    const arrowDown = document.createElement('div');
    const close = document.createElement('button')

    close.innerText = "\u2716";

    container.className = "tooltip"
    message.className = "tooltip_message"
    arrowUp.className = "arrow-up"
    arrowDown.className = "arrow-down"
    arrowDown.className = "arrow-down"
    close.className = "close";
    container.dataset.visible = false;

    if (type === "text") {
        message.innerText = comment;
    } else if (type === "prompt") {
        message.innerText = "";
        message.appendChild(comment);
        container.appendChild(close);
    } else if (type === "menu") {
        message.innerText = "";
        message.appendChild(comment);
    }

    const arrow = getArrow(placement);

    container.appendChild(message);
    container.appendChild(arrowUp);
    container.appendChild(arrowDown);

    document.body.appendChild(container);

    element.addEventListener(event, mouseActionHandler);
    close.addEventListener('click', hideTooltip);

    function getArrow(placement) {
        if (placement.indexOf('top') > -1) {
            if (type !== "menu") {
                container.className += ' tip-bottom';
            }
            return arrowDown;
        }
        if (placement.indexOf('bottom') > -1) {
            if (type !== "menu") {
                container.className += ' tip-top';
            }
            return arrowUp;
        }
    }

    function mouseActionHandler() {
        tooltipCreate(container, element, comment, placement, arrow, type);
        let isVisible = container.dataset.visible === "true";

        window.addEventListener("mousewheel", hideTooltip);

        if (typeof comment === 'string') {
            displayTooltip();
            element.addEventListener('mouseout', hideTooltip);
        } else {
            if (!isVisible) {
                window.addEventListener('mousedown', mousedownHandler);
                container.addEventListener('mouseout', mouseoutClick);
                container.addEventListener('mouseover', mouseoverClick)
                displayTooltip();
            } else {
                hideTooltip();
            }

        }
    }

    function mousedownHandler(e) {
        if (e.target === element) return;
        hideTooltip(e)
    }

    function mouseoutClick(e) {
        window.addEventListener('mousedown', mousedownHandler);
    }

    function mouseoverClick(e) {
        window.removeEventListener('mousedown', mousedownHandler);
    }

    function displayTooltip() {
        container.style.pointerEvents = "initial"
        container.style.opacity = "1";
        if (type !== "menu") {
            arrow.style.opacity = "1";
        }
        container.dataset.visible = true;
    }

    function hideTooltip(e) {
        container.style.pointerEvents = "none"
        arrow.style.opacity = "0";
        container.style.opacity = "0";
        container.dataset.visible = false;
        element.removeEventListener('mouseout', hideTooltip);
        window.removeEventListener("mousewheel", hideTooltip);

    }

    return container
}

function createSvgIcon(svg, className) {
    let div = document.createElement('div');
    div.innerHTML = svg;
    div.className = className;
    return div;
}

async function storageSet(key, value) {
    let data = {}
    data[key] = value
    let set = await chrome.storage.local.set(data).then(() => {
        console.log(`${key} is set!`);
        return chrome.runtime.lastError ? chrome.runtime.lastError : true;
    });
    return set;
}

async function storageGet(key) {
    let get = await chrome.storage.local.get([key]).then((result) => {
        return chrome.runtime.lastError ? chrome.runtime.lastError : result[key];
    })
    return get
}