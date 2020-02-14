function fragment_observer(el, f, g) {
    const observer = new MutationObserver(function(mutations) { 
        for(let mutation of mutations) {
            if(mutation.attributeName === "class" && mutation.target.getAttribute("class").includes("current-fragment")) {
                f ? f() : 0; 
                return;
            }
            if(mutation.attributeName === "class" && !mutation.target.getAttribute("class").includes("current-fragment")) {
                g ? g() : 0; 
                return;
            }
        };
    });
    // Start observing the target node for configured mutations
    observer.observe(el, {attributes:true});
}

function slide_observer(el, f, g) {
    const observer = new MutationObserver(function(mutations) { 
        for(let mutation of mutations) {
            if(mutation.attributeName === "aria-hidden" && mutation.target.getAttribute("aria-hidden") === null) {
                f ? f() : 0; 
                return;
            }
            if(mutation.attributeName === "aria-hidden" && mutation.target.getAttribute("aria-hidden") === "true") {
                g ? g() : 0;
                return;
            }
        };
    });
    
    observer.observe(el, {attributes:true});
}
function slide_hider(parent_section, el) {
    $(el).hide();
    slide_observer(parent_section, () => $(el).show(), () => $(el).hide());
}

function getClosest(elem, selector) {
	for ( ; elem && elem !== document; elem = elem.parentNode ) {
		if ( elem.matches( selector ) ) return elem;
	}
	return null;
};

function collapsible_fragment_observer(el) {
    $(el).hide(); 
    const observer = new MutationObserver(function(mutations) { 
        for(let mutation of mutations) {
            if(mutation.attributeName === "class" && mutation.target.getAttribute("class").includes("current-fragment")) {
                $(el).show(); 
                return;
            }
        };
    });
    // Start observing the target node for configured mutations
    observer.observe(el, {attributes:true});
}

$(document).ready($(".collapsible").each((i,v) => collapsible_fragment_observer(v)));
