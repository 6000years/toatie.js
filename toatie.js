'use strict';

const toatie = {
  dummy: (clue1 = 'dummy switched on', clue2 = 'dummy switched off') => ({
    on:  () => console.debug(clue1),
    off: () => console.debug(clue2),
    toggle:  () => false,
    handler: () => false
  }),
  NO_TOGGLER:     Symbol('NO_TOGGLER'),
  RETURN_TOGGLER: Symbol('RETURN_TOGGLER'),
  ON:             Symbol('HANDLER_IS_ON'),
  OFF:            Symbol('HANDLER_IS_OFF')
};

((
  {RETURN_TOGGLER, ON, NO_TOGGLER, OFF} = toatie,
  join_togglers = (joinedToggler, ...togglers) => (
    ((joinedToggler === RETURN_TOGGLER) && (joinedToggler = {})),
    (joinedToggler ??= {}),
    (joinedToggler.on  = () => (togglers.forEach(n => n.on()), joinedToggler)),
    (joinedToggler.off = () => (togglers.forEach(n => n.off()), joinedToggler)),
    (joinedToggler.toggle = () => (togglers.forEach(n => n.toggle()), joinedToggler)),
    ((flipTo1st = () => (
      togglers[0].on(),
      togglers[1].off(),
      (flip1 = flipTo2nd),
      joinedToggler
    ),
      flipTo2nd = () => (
        togglers[0].off(),
        togglers[1].on(),
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
  ),
  handle_event = (initialState, toggleObject, eventType, elmnt, handler, aELOptions, toatieOptions) => (
    ((
      (toggleObject === NO_TOGGLER)
      || (toggleObject === RETURN_TOGGLER)
      // null_has_type_'object',_hence_the_additional_test_for_truthiness
      || ((typeof toggleObject === 'object') && toggleObject)
    )
      || console.trace(`toggleObject must be either an Object or toatie.NO_TOGGLER or toatie.RETURN_TOGGLER`)
    ),
    ((
      toggle_object = toatieOptions?.toggleObject || toggleObject,
      initial_state = toatieOptions?.initialState || initialState,
      // do_not_be_tempted_to_inline_this_-_toggle_object_gets_reassigned_so_you_can't_reliably_run_this_test_later_on
      wantTogglerReturn = (toggle_object === RETURN_TOGGLER)
    ) => (
      ((toggle_object === NO_TOGGLER)
        ? (toggle_object = null)
        : (
          ((toggle_object === RETURN_TOGGLER) && (toggle_object = {})),
          ((
            on1 = () => (
              elmnt.addEventListener(eventType, handler, aELOptions),
              (toggle_object && (toggle_object.toggle = off1)),
              (toggle_object && (toggle_object.run = handler)),
              handler.onCb?.(),
              toggle_object
            ),
            off1 = () => (
              elmnt.removeEventListener(eventType, handler, aELOptions),
              (toggle_object && (toggle_object.toggle = on1)),
              (toggle_object && (toggle_object.run = null)),
              handler.offCb?.(),
              toggle_object
            )
          ) => (
            (toggle_object.on  = on1),
            (toggle_object.off = off1),
            (toggle_object.handler = handler),
            ((initial_state === OFF)
              ? ((toggle_object.toggle = on1),  (toggle_object.run = null))
              : ((toggle_object.toggle = off1), (toggle_object.run = handler))
            )
          ))()
        )
      ),
      ((initial_state === ON) && (elmnt.addEventListener(eventType, handler, aELOptions), handler.onCb?.())),
      (wantTogglerReturn ? toggle_object : elmnt)
    ))()
  )
) => (
  (toatie.bindWithThis = (el1, thisref, ...handlers) => [el1, ...handlers.map(h => h.bind(thisref, el1))]),
  (toatie.bind = (el1, ...handlers) => [el1, ...handlers.map(h => h.bind(null, el1))]),
  // const click = toatie.setup('click');
  // click(el, handler);                 // repeated use
  // toatie.setup('click')(el, handler); // ad hoc use
  // click.off(el, handler);
  // click.toggler()(el, handler);
  // click.toggler(my_toggler)(el, handler);
  // click.options(OFF, RETURN_TOGGLER)(el, handler);   // for *combinations* of options
  (toatie.setup = (...events) => (
    (events.length === 1)
    ? ((default_handler = handle_event.bind(null, ON, NO_TOGGLER, events[0])) => (
      // would prefer to name it just 'bind' but that clashes with Function.bind()
      (default_handler.easybind = (el, handler, ...args) => handle_event(ON, NO_TOGGLER, events[0], el, handler.bind(null, el), ...args)),
      (default_handler.off = handle_event.bind(null, OFF, NO_TOGGLER, events[0])),
      (default_handler.off.toggler = callers_toggle_object => handle_event.bind(null, OFF, callers_toggle_object || RETURN_TOGGLER, events[0])),
      (default_handler.toggler = callers_toggle_object => handle_event.bind(null, ON, callers_toggle_object || RETURN_TOGGLER, events[0])),
      (default_handler.options = (arg1, arg2) => (
        console.assert(arg1, 'caller must supply at least one argument to .options()'),
        (
          [ON, OFF].includes(arg1)
          ? (
            console.assert(((  ! arg2) || (typeof arg2 === 'object') || [RETURN_TOGGLER, NO_TOGGLER].includes(arg2)), 'option for toggler arg must be an object, NO_TOGGLER or RETURN_TOGGLER, or omitted'), //_no_interpolated_variables,_js_always_evaluates_them_whether_or_not_the_assert_trips
            handle_event.bind(null, arg1, arg2 || NO_TOGGLER, events[0])
          )
          : (
            console.assert(((  ! arg2) || [ON, OFF].includes(arg2)), 'arg 2, if provided to .options(), must be either toatie.ON or toatie.OFF'),
            handle_event.bind(null, arg2 || ON, arg1, events[0])
          )
        )
      )),
      default_handler
    ))()
    : (
      // multi_argument_setup##_is_a_convenience_&_NOT_DESIGNED_to_allow_everything_that_setup_single##_can_do;_the_combo_toggler_is_a_must,_anything_else_(.off_or_binding_both_handlers_to_an_Element_eg_documentKeyUpKeyDown##,_more_than_2_event_types)_is_a_bonus
      // mouseenters(el, hndlr1, hndlr2) --> el;
      // setup('mouseenter', 'mouseleave')(el, enter_handler, leave_handler);
      // mouseenters = setup('mouseenter', 'mouseleave'); mouseenters(el, enter_handler, leave_handler);
      // my_toggler = dummy(); mouseenters.toggler(my_toggler)(el, enter_handler, leave_handler);
      // mouseenters.toggler()(el, enter_handler, leave_handler) --> toggler ..._UNDECIDED,_probably_treat_as_a_bonus,_implement_if_easy_to_do_so
      // ?? maybe later ??
      // triple event types: setup('mouseenter', 'mouseleave', 'keyup')(el, enter_handler, leave_handler, keyup_handler);
      // both initial_state and toggler options: mouseenters = setup('mouseenter', 'mouseleave'); my_toggler = dummy(); mouseenters.off.toggler(my_toggler)(el, enter_handler, leave_handler);
      // bind to element: documentKeyUpKeyDown = setup('keyup', 'keydown').easybind(null, document); documentKeyUpKeyDown(enter_handler, leave_handler);
      ((
        pair = (el, ...handlers) => (
          handlers.forEach((h, ind) => handle_event(ON, NO_TOGGLER, events[ind], el, h)),
          el
        )
      ) => (
        pair.options = (initialState, caller_provided_toggler = NO_TOGGLER, aELOptions = null) => (
          (el, ...handlers) => (
            ((jt = join_togglers(caller_provided_toggler, ...handlers.map((h, ind) => handle_event(initialState, RETURN_TOGGLER, events[ind], el, h, aELOptions)))) => (
              (((  ! caller_provided_toggler) || (caller_provided_toggler === RETURN_TOGGLER)) ? jt : el)
            ))()
          )
        ),
        pair.off = (el, ...handlers) => (
          handlers.forEach((h, ind) => handle_event(OFF, NO_TOGGLER, events[ind], el, h)),
          el
        ),
        // would prefer to name it just 'bind' but that clashes with Function.bind()
        pair.easybind = (el, ...handlers) => (
          handlers.forEach((h, ind) => handle_event(ON, NO_TOGGLER, events[ind], el, h.bind(null, el))),
          el
        ),
        pair.toggler = caller_provided_toggler => (
          (el, ...handlers) => (
            ((jt = join_togglers(caller_provided_toggler, ...handlers.map((h, ind) => handle_event(ON, RETURN_TOGGLER, events[ind], el, h)))) => (
              (((  ! caller_provided_toggler) || (caller_provided_toggler === RETURN_TOGGLER)) ? jt : el)
            ))()
          )
        ),
        pair
      ))()
    )
  )),
  (toatie.joinTogglers = join_togglers.bind(null, null)),
  (toatie.joinTogglers.toggler = callerToggleObject => join_togglers.bind(null, callerToggleObject))
  ,(toatie.focusblur   = toatie.setup('focus', 'blur'))
  ,(toatie.mouseovers  = toatie.setup('mouseover', 'mouseout'))
  ,(toatie.mouseenters = toatie.setup('mouseenter', 'mouseleave'))
))();
