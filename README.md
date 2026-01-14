# Toatie Js

a toatie wee javascript event handling library providing higher concept wrapper functions over addEventListener() for complex javascript applications

## Installation

None as such, it's just a single javascript file.

Add to a web page using <script src="toatie.js"></script>.

## License

Open source, except for the words `toatie` and `wee` which are the exclusive property of the nation of Scotland.

## Usage

Trivial use, same as addEventListener():
```javascript
const elmnt = document.createElement(); // or getElementById() or other methods
const handler = e => console.log(e.type);

toatie.event('mousedown', elmnt, handler); // calls addEventListener()

// you can define your own bindings:
const click = toatie.event.bind(null, 'click');
click(elmnt, handler);

document.body.append(click(elmnt, handler)); // chainable API
```

Same, but demonstrates a toggler:
```javascript
const myFirstToggler = click(
  elmnt,
  handler,
  toatie.RETURN_TOGGLER
);
myFirstToggler.off();    // calls removeEventListener()
myFirstToggler.on();     // calls addEventListener()
myFirstToggler.toggle(); // calls removeEventListener()
myFirstToggler.runIfToggledOn() // does nothing
myFirstToggler.toggle();        // calls addEventListener()
myFirstToggler.runIfToggledOn() // runs the handler directly (not as a result of a user event firing)
```

Same, but demonstrates initial state `toatie.OFF`:
```javascript
const mySecondToggler = click(
  elmnt,
  handler,
  toatie.RETURN_TOGGLER, // alternatively NO_TOGGLER (the default) in which case elmnt is returned
  {},                    // addEventListener options (once, passive, useCapture, signal)
  toatie.OFF             // initial state
);
// toatie.OFF means that there has been no call to addEventListener() as yet
mypromise
  .then(mySecondToggler.on)
  .then(() => dostuff())
  .finally(mySecondToggler.off);
```

Same, but caller owns and controls the toggler right from the beginning:
```javascript
const togglerThatIMadeMyself = { myproperty: 'whatever' };
click(
  elmnt,
  handler,
  togglerThatIMadeMyself
); // returns elmnt
console.log(togglerThatIMadeMyself.myproperty); // logs 'whatever'
```

Demonstrates the use of `toatie.bind1()` which allows toatie to preserve the correct target element reference - should the caller fumble the reference, or should they not wish to keep a reference at all - and make it available in the handler function:
```javascript
click(
  ...toatie.bind1(
    elmnt,
    (el, e) => console.log(`clicked element %O, event object %O`, el, e)
  )
);
// it won't matter if the elmnt reference is changed or set to null
// because the argument el to the event handler has been bound and will be preserved
elmnt = null;                     // safe
elmnt = document.createElement(); // safe
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
const myCombinedToggler = toatie.mouseovers(
  elmnt,
  () => console.log('mouseover'),
  () => console.log('mouseout'),
  toatie.RETURN_TOGGLER
);
myCombinedToggler.off(); // calls removeEventListener() for both handlers
```

`toatie.pair()` joins two togglers together using `toatie.joinTogglers()`.  You can use it too:
```javascript
const togglerThatIJoinedMyself = {};
toatie.joinTogglers(
  togglerThatIJoinedMyself,
  toatie.event('scroll', elmnt, handler1, toatie.RETURN_TOGGLER),
  toatie.event('load', imageElmnt, handler2, toatie.RETURN_TOGGLER),
  toatie.event('mousemove', document.body, handler3, toatie.RETURN_TOGGLER)
  // ... add as many toatie.events as you like ...
);
togglerThatIJoinedMyself.off();
```

Joined togglers have more tricks:
```javascript
// toggles the first handler off and the second handler on
togglerThatIJoinedMyself.flipTo2nd();
// toggles the second handler off and the first handler on
togglerThatIJoinedMyself.flipTo1st();
// flips to 2nd if we most recently flipped to 1st
// or flips to 1st if we most recently flipped to 2nd handler
togglerThatIJoinedMyself.flip();
```

Maybe you want to delay the switch on (eg when doing css transitions):
```javascript
// toggles first handler off immediately and the second handler on after 250 milliseconds
togglerThatIJoinedMyself.flipTo2nd(250);
// toggles second handler off immediately and the first handler on after mypromise resolves
togglerThatIJoinedMyself.flipTo1st(mypromise);
```

Togglers can be combined arbitrarily.  That's what you need when you're writing a complex javascript application that does mode switches.
```javascript
const div = document.createElement('div');
div.style.setProperty('width', '100px');
div.style.setProperty('height', '100px');
div.style.setProperty('border', '2px solid Crimson');
const mouseovers_toggler = toatie.mouseovers(...toatie.bind1(div, el => el.style.setProperty('background-color', 'pink'), el => el.style.removeProperty('background-color')), toatie.RETURN_TOGGLER);

// joinTogglers() always returns the joined toggler
const mousemove_and_keyup = toatie.joinTogglers(
  {},
  toatie.event('keyup', document.body, e => console.log(e.key), toatie.RETURN_TOGGLER),
  toatie.event('mousemove', document.body, e => console.log(e.movementX), toatie.RETURN_TOGGLER)
);

const ul = document.createElement('ul');
document.body.append(ul);
const liCombinedToggler = {};
toatie.joinTogglers(
  liCombinedToggler,
  ...Array(3).fill().map((_, ind) => (
    ((li = document.createElement('li')) => (
      li.append(`line item ${ind}`),
      ul.append(li),
      toatie.mouseovers(li, () => console.log(`mouseover ${ind}`), () => console.log(`mouseout ${ind}`), toatie.RETURN_TOGGLER)
    ))()
  ))
);

const combinedToggler = {};
toatie.joinTogglers(combinedToggler, mouseovers_toggler, mousemove_and_keyup, liCombinedToggler);

const checkbox = document.createElement('input');
checkbox.setAttribute('type', 'checkbox');

// The mode switch happens here:
toatie.event('change', checkbox, combinedToggler.toggle);

document.body.append(div, checkbox);
```
