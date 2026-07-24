# Toatie Js

A toatie wee javascript event handling library providing higher concept wrapper functions over addEventListener() for complex javascript applications.

## Installation

No dependencies, no configuration, no complexity. Add to a web page using <script src="toatie.js"></script>.

## License

Open source except for the words `toatie` and `wee` which are the exclusive property of the nation of Scotland.

## Usage

Trivial use:
```javascript
// wrap addEventListener()
toatie.event('click', elmnt, handler);
// where elmnt comes (typically) from getElementById() or document.createElement()
// and handler is an event handler function, eg e => console.log(e.type)

// for convenience you may wish to define your own bindings:
const click = toatie.event.bind(null, 'click');
// now you can write
click(elmnt, handler);
// instead of elmnt.addEventListener('click', handler)

// bonus - it's a composable API:
document.body.append(click(elmnt, handler));
```

Same, but demonstrates a toggler:
```javascript
const toggler = click(
  elmnt,
  handler,
  toatie.RETURN_TOGGLER // returns elmnt by default
);
toggler.off();    // calls elmnt.removeEventListener('click', handler)
toggler.on();     // calls addEventListener()
toggler.toggle(); // calls removeEventListener()
toggler.run?.() // undefined, does nothing
toggler.toggle();        // calls addEventListener()
toggler.run?.() // runs the handler directly (not as a result of a user event firing)
```

Same, but demonstrates initial state `toatie.OFF`:
```javascript
const toggler = click(
  elmnt,
  handler,
  toatie.RETURN_TOGGLER, // alternatively NO_TOGGLER (the default) in which case elmnt is returned
  {},                    // addEventListener options (once, passive, useCapture, signal)
  toatie.OFF             // initial state
);
// toatie.OFF means that there has been no call to addEventListener() as yet
mypromise
  .then(toggler.on)
  .then(() => dostuff())
  .finally(toggler.off);
```

Same, but caller owns and controls the toggler right from the beginning:
```javascript
const toggler = { myproperty: 'whatever' }; // alternatively toatie.dummy() returns a do-nothing toggler object
click(
  elmnt,
  handler,
  toggler
);
console.log(toggler.myproperty); // logs 'whatever'
```

Demonstrates the use of `toatie.bind1()` which allows toatie to preserve the correct target element reference (should the caller fumble the reference, or should they not wish to keep a reference at all) and make it available in the handler function:
```javascript
click(
  ...toatie.bind1(
    elmnt,
    (el, e) => console.log(`clicked element %O, event object %O`, el, e)
  )
);
// it won't matter if the elmnt reference is changed or set to null
// because the argument el to the event handler has been bound and will be preserved
elmnt = null;                     // does not break the click handler
elmnt = document.createElement(); // does not break the click handler
```

toatie.bind1() clobbers your handler function's `this` reference. If you want to preserve your `this` then:
```javascript
const myobj = {
  myvar: 1,
  handler: (el, e) => console.log(`myvar: ${this.myvar}, element %O, event object %O`, el, e)
};
click(
  ...toatie.bind(
    document.createElement(),
    myobj,
    myobj.handler
  )
)
```

You can sign up for callbacks when your handler is switched on or off:
```javascript
const handler = () => console.log('clicked');
handler.onCb  = () => console.log("toatie just called addEventListener()");
handler.offCb = () => console.log("toatie just called removeEventListener()");
click(elmnt, handler); // logs "toatie just called addEventListener()"
click(elmnt, handler, toatie.NO_TOGGLER, null, toatie.OFF); // logs nothing
```

Events sometimes come in pairs.  Here mouseover events turn the background colour red and mouseout events reset it:
```javascript
toatie.mouseovers(
  ...toatie.bind1(
    elmnt,
    el => el.style.setProperty('background-color', 'red'),
    el => el.style.removeProperty('background-color')
  )
);
```

There's also `toatie.mouseenters()` and `toatie.focusblur()`.  You can define your own bindings:
```javascript
const keydownkeyup = toatie.pair.bind(null, 'keydown', 'keyup');
keydownkeyup(
  elmnt,
  () => console.log('keydown'),
  () => console.log('keyup')
);
```

Toggle both event handlers in one fell swoop:
```javascript
const toggler = toatie.mouseovers(
  elmnt,
  () => console.log('mouseover'),
  () => console.log('mouseout'),
  toatie.RETURN_TOGGLER
);
toggler.off(); // calls removeEventListener() for both handlers
```

`toatie.pair()` joins two togglers together using `toatie.joinTogglers()`.  You can use it too:
```javascript
const toggler = {};
toatie.joinTogglers(
  toggler,
  toatie.event('scroll', elmnt, handler1, toatie.RETURN_TOGGLER),
  toatie.event('load', imageElmnt, handler2, toatie.RETURN_TOGGLER),
  toatie.event('mousemove', document.body, handler3, toatie.RETURN_TOGGLER)
  // ... add as many toatie.events as you like ...
);
toggler.off();
```

Joined togglers have more tricks:
```javascript
// toggles the first handler off and the second handler on
toggler.flipTo2nd();
// toggles the second handler off and the first handler on
toggler.flipTo1st();
// flips to 2nd if we most recently flipped to 1st
// or flips to 1st if we most recently flipped to 2nd handler
toggler.flip();
```

Maybe you want to delay the switch on (eg when doing css transitions):
```javascript
// toggles first handler off immediately and the second handler on after 250 milliseconds
toggler.flipTo2nd(250);
// toggles second handler off immediately and the first handler on after mypromise resolves
toggler.flipTo1st(mypromise);
```

Togglers can be combined arbitrarily.  That's what you need when you're writing a complex javascript application that does mode switches.
```javascript
const modeFlipTheButtons = joinTogglers(
  null,
  ((hurryUpFn = () => (window.lowUrgencyLoading = false)) => (
    joinTogglers(
      {},
      onClick(loadButton, hurryUpFn, RETURN_TOGGLER),
      onClick(reduceButton, hurryUpFn, RETURN_TOGGLER),
      onClick(loadAndReduceButton, hurryUpFn, RETURN_TOGGLER)
    )
  ))(),
  joinTogglers(
    null,
    click(loadButton, loadNewItems, RETURN_TOGGLER, null, OFF),
    onClick(reduceButton, reduce, RETURN_TOGGLER, null, OFF),
    onClick(loadAndReduceButton, () => (loadNewItems(), reduce()), RETURN_TOGGLER, null, OFF)
  )
);
loadStartupData().then(modeFlipTheButtons.flipTo2nd);
```
