# Tweet Vote
## A Greasemonkey plugin for pruning who you follow

Twitter stays interesting only if you constantly follow
new people and unfollow users who start flooding your feed with
low quality content.

However it can be hard to keep track of the track record of each user and so 
one ends up doing a trigger finger approach and unfollows on the first low quality tweet.

This helps change that.  By appending a voting system after each tweet,
you can privately keep track of how many down and upvotes you have given
to the quality of each users' tweets.

<img src="https://raw.githubusercontent.com/kristopolous/tweetvote/master/tweet.png">

You can use whatever threshold score you want to draw an assessment
of what kind of action you'd like to take.

The votes are stored in localStorage via `GM_set/getValue` and don't need
access to any remote server.
