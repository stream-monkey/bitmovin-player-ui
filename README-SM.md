### Quick and dirty readme for our own custom development

(Alex) For the time being, just copying the messages I sent to Paul re: the details to get up and running re: building custom components:

```
Alex Coleman  2:57 PM
okay, so, few things





2:57
first, i just pushed up that script
2:57
you can run it just using npm run bmui
2:59
you can look at the script if you want - /scripts/copy-bitmovinui.sh - which is just copying the three production bmui build files
3:00
also, did i explain to you how to this stuff is connected?
3:00
so the bitmovin stuff all lives in its own repo
3:00
https://github.com/stream-monkey/bitmovin-player-ui

stream-monkey/bitmovin-player-ui
The Bitmovin Adaptive Streaming Player UI
Language
TypeScript
Last updated
3 months ago
<https://github.com/stream-monkey/bitmovin-player-ui|stream-monkey/bitmovin-player-ui>stream-monkey/bitmovin-player-ui | Dec 10th, 2019 | Added by GitHub

Paul Le Grand  3:01 PM
I saw that and saw that it uses the SmUiFactory to load it, which is used in the player-ui mixin

Alex Coleman  3:01 PM
right

Paul Le Grand  3:01 PM
and that’s about as far as I got aha

Alex Coleman  3:01 PM
the only files that are committed to the actual craft repo are those three built asset files
3:01
haha okay word, just didn't wanna repeat myself
3:01
k, so you what you need to do is the following
3:02
open up a new vscode repo for the resources/bitmovin-player-ui folder
3:02
and then pull down the feature-sm-theme branch of that https://github.com/stream-monkey/bitmovin-player-ui branch in that folder

Paul Le Grand  3:04 PM
Ok yea, so then when I’m editing it, I can pass the data from the player mixin in Craft, but for adding a component (i.e., a component to select a different live stream and swap out the source), is there documentation on that somewhere? Or do I just need to look at how it’s currently being done and figure it out from there?

Alex Coleman  3:05 PM
the reason for all of this separation by the way is that, if you check out that github page, it's forked from the actual core bitmovin-ui repo
3:05
that way, if/when they update it, we can just easily pull down and merge in their updates
3:05
yeah one sec, i'm gonna explain it all haha

Alex Coleman  3:11 PM
okay so, to answer your first question about why it's only showing the offline image...
[3:09 PM]
so if you open up that main index.html file, you'll see that uiData json object
[3:09 PM]
which, in that page, is just a mock of the actual settings we pass from our app so that it's easy to just modify them and test things
[3:10 PM]
so if you just change isOffline in that object to false, the offline image will go away
3:11
sorry just sent all those messages to chris by accident :joy:

Paul Le Grand  3:11 PM
haha

Alex Coleman  3:14 PM
okay right, and so you saw as you just mentioned that, right, from the player-ui mixin, craft calls that main bitmovin.playerui.SmUIFactory.buildSmUI function, which lives - in the bitmovin repo - in the smuifactory.ts file
3:14
that's the main entry-point bitmovin ui file that sort of runs everything
3:17
so within that buildSmUI function, that return new UIManager() passes as that second param any array of objects, each of which specifies which ui-building function to call for a few different contexts, which it then handles dynamically. which is pretty cool, so what it'll do is, based on those condition functions, it'll call the associated ui-building function. the main one, that runs almost always, is the modernUi() function
3:17
(the last one in that array)
3:17
but, e.g., that third one is called when it detects it's on mobile (edited) 
3:18
first one is for the mobile ad-playing ui; and second for regular ad-playing
3:18
so modernUi() is the "desktop" ui function; modernSmallScreenUI() is the mobile ui function
3:22
k sorry, this is long-winded, there are just a good handful of things to explain
3:22
okay, so in modernUi() is where it "builds" all of the ui elements
3:22
and like you said, right, every different "piece" of the UI is a different component, and components all live in their own typescript .ts files
3:23
which all live in src/ts/components
3:23
so, e.g., you can see one of our custom ones is playlistmenu.ts
3:23
and then it's sub components eg are playlistmenuitem.ts, playlistmenunavbutton.ts, etc.
3:24
simpler ones are say for the share button and share panel menu
3:25
so - finally got to the info you really want, haha - to create new component/s for the things you're doing, you'll need to create: 1) a new component ts file for each; and a corresponding sass file - e.g. the sharepanel's one is src/scss/skin-sm/components/_sharepanel.scss
3:25
the sass files need to be imported in src/scss/skin-sm/_skin.scss
3:26
then that's all good
3:26
and that's where, obviously, you'd include any custom style rules you need
3:26
all of the component files, just open up one of them and check them out, are all classes
3:27
they specify an interface with any config settings that you would need to pass into them
3:27
(again, just stuff out and play around with our custom ones to get a feel for things)
3:27
and then in the constructor function of the main class is where all the magic happens
3:28
where it builds up its contents
3:28
k, and then the last thing, to close the whole loop, is that you then need to new up and add any of those components into those modernUi and modernSSUi functions in the factory file
3:28
again, just check those out for examples of how that all works
```