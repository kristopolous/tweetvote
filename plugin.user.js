// ==UserScript==
// @name         Voting system for twitter
// @include      https://twitter.com*
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
    })
    list[+(dir === 'down')]++;
    GM_setValue(user, list.join(','));
  }
  
  // Otherwise we just use the values to display things.
  stats.innerHTML = '+' + list[0] + ' -' + list[1];
}

function noads(){
  // this is a little add-on to hide the ads.
  var all = document.querySelectorAll(".js-promoted-badge");
  all.forEach(function(row){
    row.parentNode.parentNode.parentNode.parentNode.style.display = 'none';
    // for slight effeciency, let's make sure we don't hit these up every time.
    row.className += "-done";
  })
}
function decorate() {
  noads();
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
    }

    down.innerHTML = '&#9660;';
    down.style.background = 'red';
    down.onclick = function(e) {
      vote(user, 'down', stats);
      e.stopPropagation();
    }

    container.appendChild(up);
    container.appendChild(down);
    container.appendChild(stats);

    // overload our vote system to initialize things
    // and display the current results
    vote(user, false, stats);
    
    node.seen = true;
  });
}

// A unique id to apply the stylesheet under
var un = 'a3b3e8fb256e982cb3215d09f996', 
    style = document.createElement('style');

style.innerHTML= [
  "." + un + " { padding: 0 10px; margin: 0 5px; color: #fff }", 
  "." + un + ":hover { background: #000 !important }"
].join("\n");

document.body.appendChild(style);

// we do this on load and then because
// of infinite scroll, every n seconds
decorate();

