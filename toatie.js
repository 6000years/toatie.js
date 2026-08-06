'use strict';

const toatie = {
  dummy: (clue = 'dummy switched') => ({
    on:  () => console.debug(`${clue} ON`),
    off: () => console.debug(`${clue} OFF`),
    toggle:  () => false,
    handler: () => false
  }),
  RETURN_TOGGLER: Symbol('RETURN_TOGGLER'),
  ON:             Symbol('HANDLER_IS_ON'),
  OFF:            Symbol('HANDLER_IS_OFF')
};

((
  {RETURN_TOGGLER, ON, OFF} = toatie,
  PRIVATE_SYMBOL = Symbol('PRIVATE_SYMBOL'),
  opts = {NOTYET: Symbol('NOTYET'), BIND_ELEMENT_TO_HANDLERS: Symbol('BIND_ELEMENT_TO_HANDLERS'), TOGGLER: Symbol('TOGGLER'), USE_ELEMENT: Symbol('USE_ELEMENT')},
  NO_TOGGLER = Symbol('NO_TOGGLER'),
  join_togglers = (joinedToggler, ...togglers) => (
    ((joinedToggler === RETURN_TOGGLER) && (joinedToggler = {})),
    (joinedToggler ??= {}),
    (joinedToggler.on  = () => (togglers.forEach(n => n.on()), joinedToggler)),
    (joinedToggler.off = () => (togglers.forEach(n => n.off()), joinedToggler)),
    (joinedToggler.toggle = on_or_off_1 => (togglers.forEach(n => n.toggle(on_or_off_1)), joinedToggler)),
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
  handle_event = (he_flags, event_type, elmnt, handler, aELOptions) => (
    ((
      bound_handler = he_flags[opts.BIND_ELEMENT_TO_HANDLERS] ? handler.bind(null, elmnt) : handler,
      toggle_object = he_flags[opts.TOGGLER] || NO_TOGGLER,
      initial_state = he_flags[opts.NOTYET] || ON
    ) => (
      ((
        (toggle_object === NO_TOGGLER)
        || (toggle_object === RETURN_TOGGLER)
        // null_has_type_'object',_hence_the_additional_test_for_truthiness
        || ((typeof toggle_object === 'object') && toggle_object)
      )
        || console.trace(`toggle_object must be either an Object or NO_TOGGLER or toatie.RETURN_TOGGLER`)
      ),
      // do_not_be_tempted_to_inline_this_-_toggle_object_gets_reassigned_so_you_can't_reliably_run_this_test_later_on
      ((want_toggler_return = (toggle_object === RETURN_TOGGLER)) => (
        ((toggle_object === NO_TOGGLER)
          ? (toggle_object = null)
          : (
            ((toggle_object === RETURN_TOGGLER) && (toggle_object = {})),
            ((
              on1 = () => (
                elmnt.addEventListener(event_type, bound_handler, aELOptions),
                (toggle_object && (toggle_object.run = bound_handler)),
                handler.onCb?.(),
                toggle_object
              ),
              off1 = () => (
                elmnt.removeEventListener(event_type, bound_handler, aELOptions),
                (toggle_object && (toggle_object.run = null)),
                handler.offCb?.(),
                toggle_object
              )
            ) => (
              (toggle_object.on  = on1),
              (toggle_object.off = off1),
              (toggle_object.handler = bound_handler),
              (toggle_object.toggle = (on_or_off = PRIVATE_SYMBOL) => (
                (
                  (on_or_off === PRIVATE_SYMBOL) // ie_caller_did_not_specify_an_arg
                  ? ((toggle_object.run === null) ? on1() : off1())
                  : ((on_or_off === OFF) || (  ! on_or_off)) ? off1() : on1()
                )
              )),
              (toggle_object.run = ((initial_state === OFF) ? null : bound_handler))
            ))()
          )
        ),
        ((initial_state === ON) && (elmnt.addEventListener(event_type, bound_handler, aELOptions), handler.onCb?.())),
        (want_toggler_return ? toggle_object : elmnt)
      ))()
    ))()
  )
) => (
  (toatie.bindWithThis = (el1, thisref, ...handlers) => [el1, ...handlers.map(h => h.bind(thisref, el1))]),
  (toatie.bind = (el1, ...handlers) => [el1, ...handlers.map(h => h.bind(null, el1))]),
  // const click = toatie._setup('click');
  // click(el, handler);                 // repeated use
  // toatie._setup('click')(el, handler); // ad hoc use
  // click.notyet(el, handler);
  // click.toggler()(el, handler);
  // click.toggler(my_toggler)(el, handler);
  // click.options(_OFF, _RETURN_TOGGLER)(el, handler);   // for *combinations* of options
  (toatie.setup = (...events) => (
    (events.length === 1)
    ? ((
      chain = (event_type_1, flags, done) => (
        ((
          terminal = (
            flags[opts.USE_ELEMENT]
            ? (handler_1, ...args)           => handle_event(flags, event_type_1, flags[opts.USE_ELEMENT], handler_1, ...args)
            :(element_1, handler_1, ...args) => handle_event(flags, event_type_1, element_1, handler_1, ...args)
          )
        ) => (
          (done.includes(opts.TOGGLER) || (terminal.toggler = (callers_toggle_object = RETURN_TOGGLER) => chain(event_type_1, {...flags, [opts.TOGGLER]: callers_toggle_object}, done.concat(opts.TOGGLER)))),
          (done.includes(opts.NOTYET) || (terminal.notyet = chain(event_type_1, {...flags, [opts.NOTYET]: true}, done.concat(opts.NOTYET)))),
          // would prefer to name it just 'bind' but that clashes with Function.bind()
          (done.includes(opts.BIND_ELEMENT_TO_HANDLERS) || (terminal.ttbind = chain(event_type_1, {...flags, [opts.BIND_ELEMENT_TO_HANDLERS]: true}, done.concat(opts.BIND_ELEMENT_TO_HANDLERS)))),
          (done.includes(opts.USE_ELEMENT) || (terminal.element =
            use_this_element => (
              console.assert(use_this_element && ((use_this_element instanceof HTMLElement) || (use_this_element instanceof HTMLDocument)), 'caller must supply one argument of type HTMLElement to setup().element()'),
              chain(event_type_1, {[opts.USE_ELEMENT]: use_this_element}, done.concat(opts.USE_ELEMENT))
            )
          )),
          terminal
        ))()
      )
    ) => (
      Object.assign(
        chain(events[0], {}, []),
        // only_needed_because_sometimes_caller_will_decide_on_options_based_on_an_expression_(and_you_can't_convert_an_expression_into_'.notyet')
        {options: (arg1, arg2) => (
          console.assert(arg1, 'caller must supply at least one argument to .options()'),
          (
            [ON, OFF].includes(arg1)
            ? (
              console.assert(((  ! arg2) || (typeof arg2 === 'object') || [RETURN_TOGGLER, NO_TOGGLER].includes(arg2)), 'option for toggler arg must be an object, NO_TOGGLER or RETURN_TOGGLER, or omitted'), //_no_interpolated_variables,_js_always_evaluates_them_whether_or_not_the_assert_trips
              handle_event.bind(null, {[opts.TOGGLER]: arg2 || NO_TOGGLER, [opts.NOTYET]: arg1}, events[0])
            )
            : (
              console.assert(((  ! arg2) || [ON, OFF].includes(arg2)), 'arg 2, if provided to .options(), must be either toatie.ON or toatie.OFF'),
              handle_event.bind(null, {[opts.TOGGLER]: arg1, [opts.NOTYET]: arg2 || ON}, events[0])
            )
          )
        )}
      )
    ))()
    : (
      // multi_argument_setup##_is_a_convenience_&_NOT_DESIGNED_to_allow_everything_that_setup_single##_can_do;_the_combo_toggler_is_a_must,_anything_else_(.off_or_binding_both_handlers_to_an_Element_eg_documentKeyUpKeyDown##,_more_than_2_event_types)_is_a_bonus
      // mouseenters(el, hndlr1, hndlr2) --> el;
      // _setup('mouseenter', 'mouseleave')(el, enter_handler, leave_handler);
      // mouseenters = _setup('mouseenter', 'mouseleave'); mouseenters(el, enter_handler, leave_handler);
      // my_toggler = dummy(); mouseenters.toggler(my_toggler)(el, enter_handler, leave_handler);
      // mouseenters.toggler()(el, enter_handler, leave_handler) --> toggler ..._UNDECIDED,_probably_treat_as_a_bonus,_implement_if_easy_to_do_so
      // ?? maybe later ??
      // triple event types: _setup('mouseenter', 'mouseleave', 'keyup')(el, enter_handler, leave_handler, keyup_handler);
      // both_initial_state and toggler options: mouseenters = _setup('mouseenter', 'mouseleave'); my_toggler = dummy(); mouseenters.notyet.toggler(my_toggler)(el, enter_handler, leave_handler);
      // bind to element: documentKeyUpKeyDown = _setup('keyup', 'keydown').ttbind(null, document); documentKeyUpKeyDown(enter_handler, leave_handler);
      ((
        pair = (el, ...handlers) => (
          handlers.forEach((h, ind) => handle_event({[opts.TOGGLER]: NO_TOGGLER, [opts.NOTYET]: ON}, events[ind], el, h)),
          el
        )
      ) => (
        pair.options = (initialState, caller_provided_toggler = NO_TOGGLER, aELOptions = null) => (
          (el, ...handlers) => (
            ((jt = join_togglers(caller_provided_toggler, ...handlers.map((h, ind) => handle_event({[opts.TOGGLER]: RETURN_TOGGLER, [opts.NOTYET]: initialState}, events[ind], el, h, aELOptions)))) => (
              (((  ! caller_provided_toggler) || (caller_provided_toggler === RETURN_TOGGLER)) ? jt : el)
            ))()
          )
        ),
        pair.notyet = (el, ...handlers) => (
          handlers.forEach((h, ind) => handle_event({[opts.TOGGLER]: NO_TOGGLER, [opts.NOTYET]: OFF}, events[ind], el, h)),
          el
        ),
        // would prefer to name it just 'bind' but that clashes with Function.bind()
        pair.ttbind = (el, ...handlers) => (
          handlers.forEach((h, ind) => handle_event({[opts.TOGGLER]: NO_TOGGLER, [opts.NOTYET]: ON}, events[ind], el, h.bind(null, el))),
          el
        ),
        pair.toggler = caller_provided_toggler => (
          (el, ...handlers) => (
            ((jt = join_togglers(caller_provided_toggler, ...handlers.map((h, ind) => handle_event({[opts.TOGGLER]: RETURN_TOGGLER, [opts.NOTYET]: ON}, events[ind], el, h)))) => (
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
