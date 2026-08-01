# Toatie Js

A toatie wee javascript event handling library providing higher concept wrapper functions over addEventListener() for complex javascript applications.

## Installation

No dependencies, no configuration, no complexity. Add <script src="toatie.js"></script> to your HTML.

## License

Open source except for the words `toatie` and `wee` which are the exclusive property of the nation of Scotland.

## Usage

Trivial use:
```javascript
// wrap addEventListener()
toatie.setup('click')(elmnt, handler);
// where elmnt comes (typically) from getElementById() or document.createElement()
// and handler is an event handler function, eg e => console.log(e.type)

// for convenience you may wish to define your own bindings:
const click = toatie.setup('click');
// now you can write
click(elmnt, handler);
// instead of elmnt.addEventListener('click', handler)

// bonus - it's a composable API:
document.body.append(click(elmnt, handler));
```

Same, but demonstrates a toggler:
```javascript
const myToggler = click.toggler()(
  elmnt,
  handler
);
myToggler.off();    // calls elmnt.removeEventListener('click', handler)
myToggler.on();     // calls addEventListener()
myToggler.toggle(); // calls removeEventListener()
myToggler.run?.()   // undefined, does nothing
myToggler.toggle(); // calls addEventListener()
myToggler.run?.()   // runs the handler directly (not as a result of a user event firing)
```

For brevity we declare toatie aliases like this:
```javascript
const {setup, joinTogglers, ON, OFF, RETURN_TOGGLER, dummy, bind, bindWithThis, mouseovers} = toatie;
```

Same, but demonstrates setting up an event listener and toggler without calling addEventListener() as yet:
```javascript
// .off means no call to addEventListener() as yet
const myToggler = click.off.toggler()(elmnt, handler);
// if on/off depends on an expression then you can write this: const myToggler = click.options(expr ? ON : OFF, RETURN_TOGGLER)(elmnt, handler);
mypromise
  .then(myToggler.on)
  .then(() => dostuff())
  .finally(myToggler.off);
```

Same, but caller owns and controls the toggler right from the beginning:
```javascript
const myToggler = { myproperty: 'whatever' }; // alternatively dummy() returns a do-nothing toggler object
click.toggler(myToggler)(elmnt, handler);
console.log(myToggler.myproperty); // myproperty is intact, this logs 'whatever'
```

Demonstrates the use of `bind()` which allows toatie to preserve the correct target element reference (should the caller fumble the reference, or should they not wish to keep a reference at all) and make it available in the handler function:
```javascript
click(
  ...bind(
    elmnt,
    (el, e) => console.log(`clicked element %O, event object %O`, el, e)
  )
);
// it won't matter if the elmnt reference is changed or set to null
// because the argument el to the event handler has been bound and will be preserved
elmnt = null;                     // does not break the click handler
elmnt = document.createElement(); // does not break the click handler
```

toatie.bind() clobbers your handler function's `this` reference. If you want to preserve your `this` then:
```javascript
const myobj = {
  myvar: 1,
  handler: (el, e) => console.log(`myvar: ${this.myvar}, element %O, event object %O`, el, e)
};
click(
  ...bindWithThis(
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
click.off(elmnt, handler); // logs nothing
```

Events sometimes come in pairs.  Here mouseenter events turn the background colour red and mouseleave events reset it:
```javascript
setup('mouseenter', 'mouseleave')(
  ...bind(
    elmnt,
    el => el.style.setProperty('background-color', 'red'),
    el => el.style.removeProperty('background-color')
  )
);
// you can also write setup('mouseenter', 'mouseleave').easybind(elmnt, handler1, handler2) -- NB naming easybind 'bind' would clash with Function.bind()
```

There's also `mouseenters()` and `focusblur()`.  You can define your own bindings:
```javascript
const keydownkeyup = setup('keydown', 'keyup');
keydownkeyup(
  elmnt,
  () => console.log('keydown'),
  () => console.log('keyup')
);
```

Toggle both event handlers in one fell swoop:
```javascript
const doubleToggler = mouseovers.toggler(
  elmnt,
  () => console.log('mouseover'),
  () => console.log('mouseout')
);
doubleToggler.off(); // calls removeEventListener() for both handlers
```

`setup('keydown', 'keyup')` joins two togglers together using `joinTogglers()`.  You can use it too:
```javascript
const myToggler = {};
joinTogglers.toggler(myToggler)(
  setup('scroll').toggler()(elmnt, handler1),
  setup('load').toggler()(imageElmnt, handler2),
  setup('mousemove').toggler()(document.body, handler3)
  // ... add as many events as you like ...
);
myToggler.off();
```

Joined togglers have more tricks:
```javascript
// toggles the first handler off and the second handler on
myToggler.flipTo2nd();
// toggles the second handler off and the first handler on
myToggler.flipTo1st();
// flips to 2nd if we most recently flipped to 1st
// or flips to 1st if we most recently flipped to 2nd handler
myToggler.flip();
```

Togglers can be combined arbitrarily.  That's what you need when you're writing a complex javascript application that does mode switches.
```javascript
const modeFlipTheButtons = joinTogglers(
  ((hurryUpFn = () => (window.lazyLoad = false)) => (
    joinTogglers(
      click.toggler()(loadButton, hurryUpFn),
      click.toggler()(reduceButton, hurryUpFn),
      click.toggler()(loadAndReduceButton, hurryUpFn)
    )
  ))(),
  joinTogglers(
    click.off.toggler()(loadButton, loadNewItems),
    click.off.toggler()(reduceButton, reduce),
    click.off.toggler()(loadAndReduceButton, () => (loadNewItems(), reduce()))
  )
);
loadStartupData().then(modeFlipTheButtons.flipTo2nd);
```
