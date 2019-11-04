// ==UserScript==
// @name         Voting system for twitter
// @match      https://twitter.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

function vote(user, dir, stats) {
    var values = GM_getValue(user) || '0,0';
    var list = values.split(',');

    // If we have a direction then we
    // can parse out and apply things
    if(dir) {
        list = list.map(function(row){
            return parseInt(row, 10);
        });
        list[+(dir === 'down')]++;
        GM_setValue(user, list.join(','));
    }

    // Otherwise we just use the values to display things.

    // total number of posts since first seen
    var perc = [Math.round( (GM_getValue('.posts:' + user) * 1000) /
                           Math.max(ix - GM_getValue('.first:' + user), 1)
                          ), GM_getValue('.posts:' + user)].join(':');
    stats.innerHTML = '+' + list[0] + ' -' + list[1] + ' (' + perc + ')';
}

function up(count, what) {
    while(count > 0) {
        what = what.parentNode;
        count --;
    }
    return what;
}

function upto(what, klass) {
    if(what.className.search(klass) > -1) {
        return what;
    }
    if(what.parentNode) {
        return upto(what.parentNode, klass);
    }
}

function norepeat() {
    if(window.location.toString() === 'https://twitter.com/') {
        norepeat.image();
        norepeat.video();
    }
}
norepeat.hide = function(name, node) {
    if(name) {
        var isSeen = GM_getValue('.i:' + name);
        unsafeWindow.console.log(name, isSeen);
        if(!isSeen) {
            GM_setValue('.i:' + name, 1);
        } else {
            var parent = upto(node, 'tweet');
            if(parent) {
                parent.parentNode.removeChild(parent);
            }
        }
    }
};

norepeat.video = function() {
    var all = document.querySelectorAll('.PlayableMedia-player');
    all.forEach(function(node) {
        if(node.hasAttribute('visited')) {
            return;
        }
        node.setAttribute('visited', '1');
        var url = node.style.backgroundImage;
        if(url.search(/pbs.twimg.com/) > -1) {
            norepeat.hide(url.split('/').pop().split('.').shift(), node);
        }
    });
};
norepeat.image = function() {
    var all = document.querySelectorAll('.js-adaptive-photo');
    all.forEach(function(node) {
        if(node.hasAttribute('visited')) {
            return;
        }
        node.setAttribute('visited', '1');
        var url = node.getAttribute('data-image-url');
        if(url.search(/pbs.twimg.com/) > -1) {
            norepeat.hide(url.split('/').pop().split('.').shift(), node);
        }
    });
};

function noads(){
    // this is a little add-on to hide the ads.
    var all = document.querySelectorAll(".js-promoted-badge");
    all.forEach(function(row){
        row.parentNode.parentNode.parentNode.parentNode.style.display = 'none';
        // for slight effeciency, let's make sure we don't hit these up every time.
        row.className += "-done";
    });
}

function decorate() {
    noads();
    //norepeat();
    // We get all the stream-items which are effectively all the tweets
    var all = document.querySelectorAll('.stream-item');
    all.forEach(function(node) {
        // if we've decorated this one, let's skip it
        if(node.seen || node.dataset.itemType !== 'tweet') {
            return;
        }
        // Otherwise we figure out where we should append
        var container =
            node.querySelector('.tweet-context') ||
            node.querySelector('.stream-item-header');

        if(!container) {
            return;
        }

        // Now we need to contextualize the vote by finding the user that
        // posted this thing.
        var user = container.querySelector('.js-user-profile-link');


        // Sometimes you can get "suggested" tweets which don't have
        // this data.
        if(!user) {
            return;
        }
        user = user.dataset.userId;
        // Do some frequency distribution.
        ix++;
        var first_seen = GM_getValue('.first:' + user);
        if(!first_seen) {
            GM_setValue('.first:' + user, ix);
            GM_setValue('.posts:' + user, 0);
        } else {
            GM_setValue('.posts:' + user, GM_getValue('.posts:' + user) + 1);
        }


        // We create the user interface based on that
        var stats = document.createElement('span');
        var down = document.createElement('span');

        stats.style.color = 'black';

        down.className = un;
        var up = down.cloneNode(true);

        up.innerHTML = '&#9650;';
        up.style.background = 'green';
        up.onclick = function(e) {
            vote(user, 'up', stats);
            e.stopPropagation();
        };

        down.innerHTML = '&#9660;';
        down.style.background = 'red';
        down.onclick = function(e) {
            vote(user, 'down', stats);
            e.stopPropagation();
        };

        container.appendChild(up);
        container.appendChild(down);
        container.appendChild(stats);

        // overload our vote system to initialize things
        // and display the current results
        vote(user, false, stats);

        node.seen = true;
        GM_setValue('.counter', ix);
    });
}

// A unique id to apply the stylesheet under
var un = 'a3b3e8fb256e982cb3215d09f996',
    interacted = false,
    ix = GM_getValue('.counter') || 0,
    style = document.createElement('style');

style.innerHTML= [
    "." + un + " { padding: 0 10px; margin: 0 5px; color: #fff }",
    "." + un + ":hover { background: #000 !important }"
].join("\n");

document.body.appendChild(style);

window.addEventListener('mousedown', function() {
    interacted = true;
    unsafeWindow.console.log('toggle', interacted);
}, true);

window.addEventListener('unload', () => {
    if(interacted === false) {
        var user = window.location.toString().split('/')[3];
        if(user) {
            var noload = GM_getValue('.noload') || '';
            Array.from(new Set(noload.split(',').concat([user]))
            GM_setValue('.noload', noload + ',' + user);
        }
    }
});


// we do this on load and then because
// of infinite scroll, every n seconds
setInterval( decorate, 1000);
decorate();
