'use strict';

const toatie = {
  NO_TOGGLER:     Symbol('NO_TOGGLER'),
  RETURN_TOGGLER: Symbol('RETURN_TOGGLER'),
  ON:             Symbol('HANDLER_IS_ON'),
  OFF:            Symbol('HANDLER_IS_OFF')
};

(({RETURN_TOGGLER, ON, NO_TOGGLER, OFF} = toatie) => (
  (toatie.bind  = (el1, thisref, ...handlers) => [el1, ...handlers.map(h => h.bind(thisref, el1))]),
  (toatie.bind1 = (el1,          ...handlers) => [el1, ...handlers.map(h => h.bind(null, el1))]),
  (toatie.event = (eventType, elmnt, handler, toggleObject = NO_TOGGLER, aELOptions, initial_state = ON) => (
    ([ON, OFF].includes(initial_state) || console.trace(`6th argument to toatie.event() must be either toatie.ON or toatie.OFF`)),
    ((
      (toggleObject === NO_TOGGLER)
      || (toggleObject === RETURN_TOGGLER)
      // null_has_type_'object',_hence_the_additional_test_for_truthiness
      || ((typeof toggleObject === 'object') && toggleObject)
    )
      || console.trace(`toatie.event(): toggleObject must be either an Object or toatie.NO_TOGGLER or toatie.RETURN_TOGGLER`)
    ),
    ((
      wantTogglerReturn = (toggleObject === RETURN_TOGGLER),
      notSwitchedOn = () => console.warn(`Refuse to run ${handler} because it's not switched on`),
      on1 = () => (
        elmnt.addEventListener(eventType, handler, aELOptions),
        (toggleObject && (toggleObject.toggle = off1)),
        (toggleObject && (toggleObject.runIfToggledOn = handler)),
        handler.onCb?.(),
        toggleObject
      ),
      off1 = () => (
        elmnt.removeEventListener(eventType, handler, aELOptions),
        (toggleObject && (toggleObject.toggle = on1)),
        (toggleObject && (toggleObject.runIfToggledOn = notSwitchedOn)),
        handler.offCb?.(),
        toggleObject
      )
    ) => (
      ((toggleObject === NO_TOGGLER)
        ? (toggleObject = null)
        : (
          ((toggleObject === RETURN_TOGGLER) && (toggleObject = {})),
          (toggleObject.on  = on1),
          (toggleObject.off = off1),
          (toggleObject.handler = handler),
          ((initial_state === OFF)
            ? ((toggleObject.toggle = on1),  (toggleObject.runIfToggledOn = notSwitchedOn))
            : ((toggleObject.toggle = off1), (toggleObject.runIfToggledOn = handler))
          )
        )
      ),
      ((initial_state === ON) && on1()),
      (wantTogglerReturn ? toggleObject : elmnt)
    ))()
  )),
  (toatie.joinTogglers = (joinedToggler, ...togglers) => (
    ((joinedToggler === RETURN_TOGGLER) && console.warn('joinTogglers(): 1st argument joinedToggler must be an object, cannot be toatie.RETURN_TOGGLER')),
    (joinedToggler ??= {}),
    (joinedToggler.on  = () => (togglers.forEach(n => n.on()), joinedToggler)),
    (joinedToggler.off = () => (togglers.forEach(n => n.off()), joinedToggler)),
    (joinedToggler.toggle = () => (togglers.forEach(n => n.toggle()), joinedToggler)),
    // if_you_use_delaySwitchOn_then_it_delays_switching_the_1st_handler_on_BUT_NOT_SWITCHING_THE_2ND_HANDLER_OFF
    ((flipTo1st = (delaySwitchOn = 0) => (
      ((delaySwitchOn instanceof Promise)
        ? delaySwitchOn.then(togglers[0].on)
        : (delaySwitchOn ? setTimeout(togglers[0].on, delaySwitchOn) : togglers[0].on())
      ),
      togglers[1].off(),
      (flip1 = flipTo2nd),
      joinedToggler
    ),
      flipTo2nd = (delaySwitchOn = 0) => (
        togglers[0].off(),
        ((delaySwitchOn instanceof Promise)
          ? delaySwitchOn.then(togglers[1].on)
          : (delaySwitchOn ? setTimeout(togglers[1].on, delaySwitchOn) : togglers[1].on())
        ),
        (flip1 = flipTo1st),
        joinedToggler
      ),
      flip1 = flipTo1st
    ) => (
      (joinedToggler.flipTo1st = flipTo1st),
      (joinedToggler.flipTo2nd = flipTo2nd),
      (joinedToggler.flip = () => flip1())
    ))(),
    togglers.forEach((n, ind) => (
      (joinedToggler[ind] = n),
      (joinedToggler[`handler${ind}`] = n.handler)
    )),
    joinedToggler
  )),
  (toatie.pair = (evt1, evt2, el1, handler1, handler2, callerToggleObject = NO_TOGGLER, aELOptions1, aELOptions2, initial_state1 = ON, initial_state2 = ON) => (
    (((callerToggleObject === NO_TOGGLER) || (callerToggleObject === RETURN_TOGGLER) || ((typeof callerToggleObject === 'object') && callerToggleObject)) || console.trace(`toatie.pair(): callerToggleObject must be either an Object or toatie.NO_TOGGLER or toatie.RETURN_TOGGLER`)),
    ((toggleObject1 = (callerToggleObject === NO_TOGGLER) ? NO_TOGGLER : {}, toggleObject2 = (callerToggleObject === NO_TOGGLER) ? NO_TOGGLER : {}) => (
      toatie.event(evt1, el1, handler1, toggleObject1, aELOptions1, initial_state1),
      toatie.event(evt2, el1, handler2, toggleObject2, aELOptions2, initial_state2),
      ((callerToggleObject === NO_TOGGLER)
        ? el1
        : (
          ((joined1 = toatie.joinTogglers(callerToggleObject === RETURN_TOGGLER ? {} : callerToggleObject, toggleObject1, toggleObject2)) => (
            ((callerToggleObject === RETURN_TOGGLER) ? joined1 : el1)
          ))()
        )
      )
    ))()
  ))
  ,(toatie.focusblur   = toatie.pair.bind(null, 'focus', 'blur'))
  ,(toatie.mouseovers  = toatie.pair.bind(null, 'mouseover', 'mouseout'))
  ,(toatie.mouseenters = toatie.pair.bind(null, 'mouseenter', 'mouseleave'))
))();
