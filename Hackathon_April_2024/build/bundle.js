
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Game.svelte generated by Svelte v3.59.2 */
    const file$1 = "src/Game.svelte";

    // (528:2) {:else}
    function create_else_block(ctx) {
    	let h1;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t4;
    	let t5;
    	let t6;
    	let div;
    	let p2;
    	let t7;
    	let t8;
    	let t9;
    	let p3;
    	let t10;
    	let t11_value = /*currentLevel*/ ctx[2] + 1 + "";
    	let t11;
    	let t12;
    	let p4;
    	let t13;
    	let t14;
    	let t15;
    	let t16_value = /*levels*/ ctx[6][/*currentLevel*/ ctx[2]].logos.length + "";
    	let t16;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Match the Frameworks!";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Use the arrow keys to move the logos to the correct role at the bottom.";
    			t3 = space();
    			p1 = element("p");
    			t4 = text("Current: ");
    			t5 = text(/*currentGuess*/ ctx[3]);
    			t6 = space();
    			div = element("div");
    			p2 = element("p");
    			t7 = text("Score: ");
    			t8 = text(/*score*/ ctx[1]);
    			t9 = space();
    			p3 = element("p");
    			t10 = text("Level: ");
    			t11 = text(t11_value);
    			t12 = space();
    			p4 = element("p");
    			t13 = text("Frameworks: ");
    			t14 = text(/*counter*/ ctx[4]);
    			t15 = text("/");
    			t16 = text(t16_value);
    			add_location(h1, file$1, 528, 4, 14453);
    			add_location(p0, file$1, 529, 4, 14488);
    			add_location(p1, file$1, 530, 4, 14571);
    			attr_dev(p2, "class", "info svelte-6dfwi6");
    			add_location(p2, file$1, 532, 6, 14636);
    			attr_dev(p3, "class", "info svelte-6dfwi6");
    			add_location(p3, file$1, 533, 6, 14677);
    			attr_dev(p4, "class", "info svelte-6dfwi6");
    			add_location(p4, file$1, 534, 6, 14729);
    			attr_dev(div, "class", "game-info svelte-6dfwi6");
    			add_location(div, file$1, 531, 4, 14606);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t4);
    			append_dev(p1, t5);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, p2);
    			append_dev(p2, t7);
    			append_dev(p2, t8);
    			append_dev(div, t9);
    			append_dev(div, p3);
    			append_dev(p3, t10);
    			append_dev(p3, t11);
    			append_dev(div, t12);
    			append_dev(div, p4);
    			append_dev(p4, t13);
    			append_dev(p4, t14);
    			append_dev(p4, t15);
    			append_dev(p4, t16);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentGuess*/ 8) set_data_dev(t5, /*currentGuess*/ ctx[3]);
    			if (dirty & /*score*/ 2) set_data_dev(t8, /*score*/ ctx[1]);
    			if (dirty & /*currentLevel*/ 4 && t11_value !== (t11_value = /*currentLevel*/ ctx[2] + 1 + "")) set_data_dev(t11, t11_value);
    			if (dirty & /*counter*/ 16) set_data_dev(t14, /*counter*/ ctx[4]);
    			if (dirty & /*currentLevel*/ 4 && t16_value !== (t16_value = /*levels*/ ctx[6][/*currentLevel*/ ctx[2]].logos.length + "")) set_data_dev(t16, t16_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(528:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (525:2) {#if gameFinished}
    function create_if_block(ctx) {
    	let h1;
    	let t1;
    	let h2;
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Game Over!";
    			t1 = space();
    			h2 = element("h2");
    			t2 = text("Your score: ");
    			t3 = text(/*score*/ ctx[1]);
    			add_location(h1, file$1, 525, 4, 14386);
    			add_location(h2, file$1, 526, 4, 14410);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t2);
    			append_dev(h2, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*score*/ 2) set_data_dev(t3, /*score*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(525:2) {#if gameFinished}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let div0;
    	let h20;
    	let t1;
    	let p;
    	let t3;
    	let button0;
    	let t5;
    	let div3;
    	let div2;
    	let h21;
    	let t7;
    	let button1;
    	let t9;
    	let button2;
    	let t11;
    	let div6;
    	let t12;
    	let div5;
    	let div4;
    	let canvas_1;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*gameFinished*/ ctx[5]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Game Over!";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Your score: 0";
    			t3 = space();
    			button0 = element("button");
    			button0.textContent = "Play Again";
    			t5 = space();
    			div3 = element("div");
    			div2 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Level Complete!";
    			t7 = space();
    			button1 = element("button");
    			button1.textContent = "Next Level";
    			t9 = space();
    			button2 = element("button");
    			button2.textContent = "Replay";
    			t11 = space();
    			div6 = element("div");
    			if_block.c();
    			t12 = space();
    			div5 = element("div");
    			div4 = element("div");
    			canvas_1 = element("canvas");
    			add_location(h20, file$1, 509, 4, 13947);
    			attr_dev(p, "id", "finalScore");
    			add_location(p, file$1, 510, 4, 13971);
    			attr_dev(button0, "onclick", "startNewGame()");
    			attr_dev(button0, "class", "svelte-6dfwi6");
    			add_location(button0, file$1, 511, 4, 14012);
    			attr_dev(div0, "class", "popup-content svelte-6dfwi6");
    			add_location(div0, file$1, 508, 2, 13915);
    			attr_dev(div1, "id", "endGamePopup");
    			set_style(div1, "display", "none");
    			attr_dev(div1, "class", "svelte-6dfwi6");
    			add_location(div1, file$1, 507, 0, 13866);
    			add_location(h21, file$1, 517, 4, 14188);
    			attr_dev(button1, "class", "svelte-6dfwi6");
    			add_location(button1, file$1, 518, 4, 14217);
    			attr_dev(button2, "class", "svelte-6dfwi6");
    			add_location(button2, file$1, 519, 4, 14276);
    			attr_dev(div2, "class", "popup-content svelte-6dfwi6");
    			add_location(div2, file$1, 516, 2, 14156);
    			attr_dev(div3, "id", "levelEndPopup");
    			set_style(div3, "display", "none");
    			attr_dev(div3, "class", "svelte-6dfwi6");
    			add_location(div3, file$1, 515, 0, 14106);
    			attr_dev(canvas_1, "width", "600");
    			attr_dev(canvas_1, "height", "400");
    			attr_dev(canvas_1, "class", "svelte-6dfwi6");
    			add_location(canvas_1, file$1, 540, 6, 14891);
    			attr_dev(div4, "class", "center-column svelte-6dfwi6");
    			add_location(div4, file$1, 539, 4, 14857);
    			attr_dev(div5, "class", "container svelte-6dfwi6");
    			add_location(div5, file$1, 538, 2, 14829);
    			attr_dev(div6, "class", "page svelte-6dfwi6");
    			add_location(div6, file$1, 523, 0, 14342);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			append_dev(div0, t3);
    			append_dev(div0, button0);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, h21);
    			append_dev(div2, t7);
    			append_dev(div2, button1);
    			append_dev(div2, t9);
    			append_dev(div2, button2);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div6, anchor);
    			if_block.m(div6, null);
    			append_dev(div6, t12);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, canvas_1);
    			/*canvas_1_binding*/ ctx[9](canvas_1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button1, "click", /*loadNextLevel*/ ctx[7], false, false, false, false),
    					listen_dev(button2, "click", /*reloadLevel*/ ctx[8], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div6, t12);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div6);
    			if_block.d();
    			/*canvas_1_binding*/ ctx[9](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function showLevelEndPopup() {
    	document.getElementById('levelEndPopup').style.display = 'flex';
    }

    function closeLevelEndPopup() {
    	document.getElementById('levelEndPopup').style.display = 'none';
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Game', slots, []);
    	let canvas, ctx;
    	let score = 0;
    	let totalScore = 0;
    	let lastRenderTime = 0;
    	let currentLogoIndex = 0; // Index to track the current logo
    	let currentLevel = 0;
    	let currentGuess = '';

    	let levels = [
    		{
    			logoSpeedPerSecond: 100,
    			roles: ['Backend', 'Frontend', 'Mobile'],
    			logos: // Mobile Development
    			[
    				{
    					src: '/assets/logos/Android.png',
    					name: 'Android',
    					image: new Image(),
    					position: { x: 250, y: 0 },
    					hasFallen: false,
    					roles: ['Mobile'],
    					languages: ['Kotlin', 'Java']
    				},
    				{
    					src: '/assets/logos/iOS.png',
    					name: 'iOS',
    					image: new Image(),
    					position: { x: 150, y: 0 },
    					hasFallen: false,
    					roles: ['Mobile'],
    					languages: ['Swift', 'Objective-C']
    				},
    				{
    					src: '/assets/logos/Flutter.png',
    					name: 'Flutter',
    					image: new Image(),
    					position: { x: 120, y: 0 },
    					hasFallen: false,
    					roles: ['Mobile'],
    					languages: ['Dart']
    				},
    				{
    					src: '/assets/logos/React Native.png',
    					name: 'React Native',
    					image: new Image(),
    					position: { x: 153, y: 0 },
    					hasFallen: false,
    					roles: ['Mobile'],
    					languages: ['JavaScript']
    				},
    				// Frontend Development
    				{
    					src: '/assets/logos/Svelte.png',
    					name: 'Svelte',
    					image: new Image(),
    					position: { x: 100, y: 0 },
    					hasFallen: false,
    					roles: ['Frontend']
    				},
    				{
    					src: '/assets/logos/React.js.png',
    					name: 'React.js',
    					image: new Image(),
    					position: { x: 300, y: 0 },
    					hasFallen: false,
    					roles: ['Frontend']
    				},
    				{
    					src: '/assets/logos/Angular.png',
    					name: 'Angular',
    					image: new Image(),
    					position: { x: 221, y: 0 },
    					hasFallen: false,
    					roles: ['Frontend']
    				},
    				{
    					src: '/assets/logos/Vue.js.png',
    					name: 'Vue.js',
    					image: new Image(),
    					position: { x: 270, y: 0 },
    					hasFallen: false,
    					roles: ['Frontend']
    				},
    				// Backend Development
    				{
    					src: '/assets/logos/Node.js.png',
    					name: 'Node.js',
    					image: new Image(),
    					position: { x: 150, y: 0 },
    					hasFallen: false,
    					roles: ['Backend'],
    					languages: ['JavaScript']
    				},
    				{
    					src: '/assets/logos/Django.png',
    					name: 'Django',
    					image: new Image(),
    					position: { x: 167, y: 0 },
    					hasFallen: false,
    					roles: ['Backend'],
    					languages: ['Python']
    				},
    				{
    					src: '/assets/logos/Spring.png',
    					name: 'Spring',
    					image: new Image(),
    					position: { x: 50, y: 0 },
    					hasFallen: false,
    					roles: ['Backend'],
    					languages: ['Java']
    				}
    			]
    		},
    		{
    			logoSpeedPerSecond: 100,
    			roles: ['Data Science', 'Backend', 'DevOps', 'Mobile'],
    			logos: // Mobile Development
    			[
    				{
    					src: '/assets/logos/AWS.png',
    					name: 'AWS',
    					image: new Image(),
    					position: { x: 50, y: 0 },
    					hasFallen: false,
    					roles: ['DevOps']
    				},
    				{
    					src: '/assets/logos/Swift.png',
    					name: 'Swift',
    					image: new Image(),
    					position: { x: 50, y: 0 },
    					hasFallen: false,
    					roles: ['Mobile']
    				},
    				{
    					src: '/assets/logos/CSharp.png',
    					name: 'C#',
    					image: new Image(),
    					position: { x: 120, y: 0 },
    					hasFallen: false,
    					roles: ['Backend']
    				},
    				{
    					src: '/assets/logos/TensorFlow.png',
    					name: 'TensorFlow',
    					image: new Image(),
    					position: { x: 150, y: 0 },
    					hasFallen: false,
    					roles: ['Data Science']
    				},
    				{
    					src: '/assets/logos/Docker.png',
    					name: 'Docker',
    					image: new Image(),
    					position: { x: 153, y: 0 },
    					hasFallen: false,
    					roles: ['DevOps']
    				},
    				// Frontend Development
    				{
    					src: '/assets/logos/Kubernetes.png',
    					name: 'Kubernetes',
    					image: new Image(),
    					position: { x: 100, y: 0 },
    					hasFallen: false,
    					roles: ['DevOps']
    				},
    				{
    					src: '/assets/logos/Laravel.png',
    					image: new Image(),
    					position: { x: 300, y: 0 },
    					hasFallen: false,
    					roles: ['Backend']
    				},
    				{
    					src: '/assets/logos/Azure.png',
    					name: 'Azure',
    					image: new Image(),
    					position: { x: 250, y: 0 },
    					hasFallen: false,
    					roles: ['DevOps']
    				},
    				{
    					src: '/assets/logos/Pandas.png',
    					image: new Image(),
    					position: { x: 221, y: 0 },
    					hasFallen: false,
    					roles: ['Data Science']
    				},
    				{
    					src: '/assets/logos/Numpy.png',
    					image: new Image(),
    					position: { x: 270, y: 0 },
    					hasFallen: false,
    					roles: ['Data Science']
    				},
    				{
    					src: '/assets/logos/Symfony.png',
    					name: 'Symfony',
    					image: new Image(),
    					position: { x: 167, y: 0 },
    					hasFallen: false,
    					roles: ['Backend']
    				},
    				{
    					src: '/assets/logos/R.png',
    					name: 'R',
    					image: new Image(),
    					position: { x: 50, y: 0 },
    					hasFallen: false,
    					roles: ['Data Science']
    				}
    			]
    		},
    		{
    			logoSpeedPerSecond: 100,
    			roles: ['BI', 'Design', 'Backend', 'DevOps', 'Data Engineering', 'Mobile'],
    			logos: // Mobile Development
    			[
    				{
    					src: '/assets/logos/Snowflake.png',
    					name: 'Snowflake',
    					image: new Image(),
    					position: { x: 50, y: 0 },
    					hasFallen: false,
    					roles: ['Data Engineering']
    				},
    				{
    					src: '/assets/logos/Microsoft Power BI.png',
    					name: 'Microsoft Power BI',
    					image: new Image(),
    					position: { x: 120, y: 0 },
    					hasFallen: false,
    					roles: ['BI']
    				},
    				{
    					src: '/assets/logos/FastAPI.png',
    					name: 'FastAPI',
    					image: new Image(),
    					position: { x: 153, y: 0 },
    					hasFallen: false,
    					roles: ['Backend']
    				},
    				{
    					src: '/assets/logos/Ionic.png',
    					name: 'Ionic',
    					image: new Image(),
    					position: { x: 100, y: 0 },
    					hasFallen: false,
    					roles: ['Mobile']
    				},
    				{
    					src: '/assets/logos/Laravel.png',
    					name: 'Laravel',
    					image: new Image(),
    					position: { x: 300, y: 0 },
    					hasFallen: false,
    					roles: ['Backend']
    				},
    				{
    					src: '/assets/logos/PHP.png',
    					name: 'PHP',
    					image: new Image(),
    					position: { x: 250, y: 0 },
    					hasFallen: false,
    					roles: ['Backend']
    				},
    				{
    					src: '/assets/logos/SQL.png',
    					name: 'SQL',
    					image: new Image(),
    					position: { x: 221, y: 0 },
    					hasFallen: false,
    					roles: ['Backend', 'Data Engineering']
    				},
    				{
    					src: '/assets/logos/Tableau.png',
    					name: 'Tableau',
    					image: new Image(),
    					position: { x: 270, y: 0 },
    					hasFallen: false,
    					roles: ['BI']
    				},
    				{
    					src: '/assets/logos/Google Cloud.png',
    					name: 'Google Cloud',
    					image: new Image(),
    					position: { x: 167, y: 0 },
    					hasFallen: false,
    					roles: ['DevOps']
    				},
    				{
    					src: '/assets/logos/Figma.png',
    					name: 'Figma',
    					image: new Image(),
    					position: { x: 50, y: 0 },
    					hasFallen: false,
    					roles: ['Design']
    				}
    			]
    		}
    	];

    	let counter = 0;
    	let gameFinished = false;

    	function loadLogos() {
    		levels[currentLevel].logos.forEach(logo => {
    			logo.image.src = logo.src;

    			logo.image.onload = () => {
    				if (levels[currentLevel].logos.every(logo => logo.image.complete)) {
    					requestAnimationFrame(updateAndDraw); // Start the loop when all images are loaded
    				}
    			};
    		});
    	}

    	function handleKeyPress(event) {
    		let currentLogo = levels[currentLevel].logos[currentLogoIndex];

    		if (event.key === "ArrowLeft") {
    			currentLogo.position.x -= 10;
    		} else if (event.key === "ArrowRight") {
    			currentLogo.position.x += 10;
    		}
    	}

    	function updateAndDraw(timestamp) {
    		const timeSinceLastRender = (timestamp - lastRenderTime) / 1000; // Convert to seconds
    		lastRenderTime = timestamp;
    		update(timeSinceLastRender);
    		draw();
    		requestAnimationFrame(updateAndDraw);
    	}

    	function update(timeDelta) {
    		let currentLogo = levels[currentLevel].logos[currentLogoIndex];
    		$$invalidate(3, currentGuess = currentLogo.name);
    		const moveDistance = levels[currentLevel].logoSpeedPerSecond * timeDelta;
    		currentLogo.position.y += moveDistance;

    		if (currentLogo.position.y >= canvas.height - 40) {
    			// Logo reaches the bottom
    			// Reset the logo position for simplicity
    			currentLogo.position.y = 0;

    			currentLogo.hasFallen = true;
    			let segmentWidth = canvas.width / levels[currentLevel].roles.length; // Divide canvas width by number of roles

    			// Determine if the logo landed on its correct role
    			let logoLandedInSegment = Math.floor(currentLogo.position.x / segmentWidth);

    			if (currentLogo.roles.includes(levels[currentLevel].roles.at(logoLandedInSegment))) {
    				$$invalidate(1, score++, score);
    			}

    			// Move to the next logo
    			currentLogoIndex = (currentLogoIndex + 1) % levels[currentLevel].logos.length;

    			$$invalidate(4, counter++, counter);

    			if (counter === levels[currentLevel].logos.length) {
    				$$invalidate(5, gameFinished = true);
    				$$invalidate(0, canvas.style.display = 'none', canvas);
    				endLevel();
    			}
    		}
    	}

    	function draw() {
    		ctx.clearRect(0, 0, canvas.width, canvas.height);

    		// Draw the roles at the bottom
    		let segmentWidth = canvas.width / levels[currentLevel].roles.length;

    		levels[currentLevel].roles.forEach((role, index) => {
    			let x = index * segmentWidth;
    			ctx.fillStyle = index % 2 === 0 ? '#ddd' : '#bbb'; // Alternate colors for visual distinction
    			ctx.fillRect(x, canvas.height - 30, segmentWidth, 30); // Draw a segment for each role
    			ctx.fillStyle = 'black';
    			ctx.fillText(role, x + 5, canvas.height - 10); // Adjust text positioning as needed
    		});

    		// Draw the current logo
    		let currentLogo = levels[currentLevel].logos[currentLogoIndex];

    		if (currentLogo) {
    			ctx.drawImage(currentLogo.image, currentLogo.position.x, currentLogo.position.y, 40, 40);
    		}
    	}

    	function endLevel() {
    		if (currentLevel + 1 < levels.length) {
    			showLevelEndPopup();
    		} else {
    			showEndGamePopup();
    		}
    	}

    	function showEndGamePopup() {
    		document.getElementById('finalScore').innerText = `Your score: ${score}`;
    		document.getElementById('endGamePopup').style.display = 'flex';
    	}

    	function loadNextLevel() {
    		$$invalidate(5, gameFinished = false);
    		totalScore += score;
    		$$invalidate(1, score = 0);
    		lastRenderTime = 0;
    		$$invalidate(4, counter = 0);
    		loadLevel(currentLevel + 1);
    		$$invalidate(0, canvas.style.display = '', canvas);
    		closeLevelEndPopup();
    	}

    	function reloadLevel() {
    		loadLevel(currentLevel);
    		closeLevelEndPopup();
    	}

    	function loadLevel(levelIndex) {
    		$$invalidate(2, currentLevel = levelIndex);
    		loadLogos();
    		requestAnimationFrame(updateAndDraw); // Added to start the game loop
    	}

    	onMount(() => {
    		ctx = canvas.getContext('2d');
    		loadLogos();
    		window.addEventListener('keydown', handleKeyPress);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Game> was created with unknown prop '${key}'`);
    	});

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			canvas = $$value;
    			$$invalidate(0, canvas);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		canvas,
    		ctx,
    		score,
    		totalScore,
    		lastRenderTime,
    		currentLogoIndex,
    		currentLevel,
    		currentGuess,
    		levels,
    		counter,
    		gameFinished,
    		loadLogos,
    		handleKeyPress,
    		updateAndDraw,
    		update,
    		draw,
    		showLevelEndPopup,
    		endLevel,
    		showEndGamePopup,
    		loadNextLevel,
    		reloadLevel,
    		closeLevelEndPopup,
    		loadLevel
    	});

    	$$self.$inject_state = $$props => {
    		if ('canvas' in $$props) $$invalidate(0, canvas = $$props.canvas);
    		if ('ctx' in $$props) ctx = $$props.ctx;
    		if ('score' in $$props) $$invalidate(1, score = $$props.score);
    		if ('totalScore' in $$props) totalScore = $$props.totalScore;
    		if ('lastRenderTime' in $$props) lastRenderTime = $$props.lastRenderTime;
    		if ('currentLogoIndex' in $$props) currentLogoIndex = $$props.currentLogoIndex;
    		if ('currentLevel' in $$props) $$invalidate(2, currentLevel = $$props.currentLevel);
    		if ('currentGuess' in $$props) $$invalidate(3, currentGuess = $$props.currentGuess);
    		if ('levels' in $$props) $$invalidate(6, levels = $$props.levels);
    		if ('counter' in $$props) $$invalidate(4, counter = $$props.counter);
    		if ('gameFinished' in $$props) $$invalidate(5, gameFinished = $$props.gameFinished);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		canvas,
    		score,
    		currentLevel,
    		currentGuess,
    		counter,
    		gameFinished,
    		levels,
    		loadNextLevel,
    		reloadLevel,
    		canvas_1_binding
    	];
    }

    class Game extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Game",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let game;
    	let current;
    	game = new Game({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(game.$$.fragment);
    			add_location(main, file, 4, 0, 55);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(game, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(game.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(game.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(game);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Game });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
