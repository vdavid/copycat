/*
 * A main loop useful for games and other animated applications.
 *
 * Source: https://github.com/IceCreamYou/MainLoop.js/
 *
 * The MIT License
 *
 * Copyright (C) 2016 Isaac Sukin
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Manages the main loop that runs updates and rendering.
 *
 * The main loop is a core part of any application in which state changes
 * even if no events are handled. In games, it is typically responsible for
 * computing physics and AI as well as drawing the result on the screen.
 *
 * The body of this particular loop is run every time the browser is ready to
 * paint another frame. The frequency with which this happens depends primarily
 * on the monitor's refresh rate, which is typically 60 frames per second. Most
 * applications aim to run at 60 FPS for this reason, meaning that the main
 * loop runs about once every 16.7 milliseconds. With this target, everything
 * that happens in the main loop (e.g. all updates and drawing) needs to occur
 * within the "budget" of 16.7 milliseconds.  See
 * `GameLoop.setSimulationTimeStep()` for more information about typical
 * monitor refresh rates and frame rate targets.
 *
 * The main loop can be started and stopped, but there can only be one GameLoop
 * (except that each Web Worker can have its own GameLoop). There are four main
 * parts of the loop: {@link #setBeginFunction begin}(), {@link #setUpdateFunction update}(),
 * {@link #setDrawFunction draw}(), and {@link #setEndFunction end}(), in that order. See the
 * functions that set each of them for descriptions of what they are used for.
 * Note that update() can run zero or more times per loop.
 *
 * @class GameLoop
 */

/**
 * @member {Number} GameLoop#_simulationTimeStep The amount of time (in milliseconds) to simulate each time update() runs. See `GameLoop.setSimulationTimeStep()` for details.
 * @member {Number} GameLoop#_frameDelta The cumulative amount of in-app time that hasn't been simulated yet. See the comments inside animate() for details.
 * @member {Number} GameLoop#_lastFrameTimeMs The timestamp in milliseconds of the last time the main loop was run. Used to compute the time elapsed between frames.
 * @member {Number} GameLoop#_fps An exponential moving average of the frames per second.
 * @member {Number} GameLoop#_lastFpsUpdate The timestamp (in milliseconds) of the last time the `fps` moving average was updated.
 * @member {Number} GameLoop#_framesThisSecond The number of frames delivered in the current second.
 * @member {Number} GameLoop#_numUpdateSteps The number of times update() is called in a given frame.
 *         This is only relevant inside of animate(), but a reference is held externally so that this variable is not marked for garbage collection every time the main loop runs.
 * @member {Number} GameLoop#_minimumFrameDelay The minimum amount of time in milliseconds that must pass since the last frame
 *         was executed before another frame can be executed. The multiplicative inverse caps the FPS (the default of zero means there is no cap).
 * @member {Boolean} GameLoop#_isRunning Whether the main loop is running.
 * @member {Boolean} GameLoop#_isStarted `true` if `GameLoop.start()` has been called and the most recent time it was called
 *         has not been followed by a call to `GameLoop.stop()`. This is different than `running` because there is
 *         a delay of a few milliseconds after `GameLoop.start()` is called before the application is considered "running." This delay is due to waiting for the next frame.
 * @member {Boolean} GameLoop#_isInPanic Whether the simulation has fallen too far behind real time. Specifically, `panic` will be
 *         set to `true` if too many updates occur in one frame. This is only relevant inside of animate(), but
 *         a reference is held externally so that this variable is not marked for garbage collection every time the main loop runs.
 * @member {Function} GameLoop#_beginFunction A function that runs at the beginning of the main loop. See `GameLoop.setBeginFunction()` for details.
 * @member {Function} GameLoop#_updateFunction A function that runs updates (i.e. AI and physics). See `GameLoop.setUpdateFunction()` for details.
 * @member {Function} GameLoop#_drawFunction A function that draws things on the screen. See `GameLoop.setDrawFunction()` for details.
 * @member {Function} GameLoop#_endFunction A function that runs at the end of the main loop. See `GameLoop.setEndFunction()` for details.
 * @member {Number} GameLoop#_rafHandle The ID of the currently executing frame. Used to cancel frames when stopping the loop.
 * @member {Boolean} GameLoop#_hasNativeRequestAnimationFrameFunction Falls back to the polyfill in this class if needed.
 * @member {Number} GameLoop#_lastTimestamp Used by animate();
 */
export default class GameLoop {
    constructor() {
        /* Sets up defaults */
        this._simulationTimeStep = 1000 / 60;
        this._frameDelta = 0;
        this._lastFrameTimeMs = 0;
        this._fps = 60;
        this._lastFpsUpdate = 0;
        this._framesThisSecond = 0;
        this._numUpdateSteps = 0;
        this._minimumFrameDelay = 0;
        this._isRunning = false;
        this._isStarted = false;
        this._isInPanic = false;

        this._hasNativeRequestAnimationFrameFunction = typeof requestAnimationFrame === 'function';

        this._beginFunction = GameLoop.NOOP;
        this._updateFunction = GameLoop.NOOP;
        this._drawFunction = GameLoop.NOOP;
        this._endFunction = GameLoop.NOOP;
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Gets how many milliseconds should be simulated by every run of update().
     *
     * See `GameLoop.setSimulationTimeStep()` for details on this value.
     *
     * @return {Number}
     *   The number of milliseconds that should be simulated by every run of
     *   {@link #setUpdateFunction update}().
     */
    getSimulationTimeStep() {
        return this._simulationTimeStep;
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Sets how many milliseconds should be simulated by every run of update().
     *
     * The perceived frames per second (FPS) is effectively capped at the
     * multiplicative inverse of the simulation time step. That is, if the
     * time step is 1000 / 60 (which is the default), then the maximum perceived
     * FPS is effectively 60. Decreasing the time step increases the maximum
     * perceived FPS at the cost of running {@link #setUpdateFunction update}() more
     * times per frame at lower frame rates. Since running update() more times
     * takes more time to process, this can actually slow down the frame rate.
     * Additionally, if the amount of time it takes to run update() exceeds or
     * very nearly exceeds the time step, the application will freeze and crash
     * in a spiral of death (unless it is rescued; see `GameLoop.setEndFunction()` for
     * an explanation of what can be done if a spiral of death is occurring).
     *
     * The exception to this is that interpolating between updates for each
     * render can increase the perceived frame rate and reduce visual
     * stuttering. See `GameLoop.setDrawFunction()` for an explanation of how to do
     * this.
     *
     * If you are considering decreasing the simulation time step in order to
     * raise the maximum perceived FPS, keep in mind that most monitors can't
     * display more than 60 FPS. Whether humans can tell the difference among
     * high frame rates depends on the application, but for reference, film is
     * usually displayed at 24 FPS, other videos at 30 FPS, most games are
     * acceptable above 30 FPS, and virtual reality might require 75 FPS to
     * feel natural. Some gaming monitors go up to 144 FPS. Setting the
     * time step below 1000 / 144 is discouraged and below 1000 / 240 is
     * strongly discouraged. The default of 1000 / 60 is good in most cases.
     *
     * The simulation time step should typically only be changed at
     * deterministic times (e.g. before the main loop starts for the first
     * time, and not in response to user input or slow frame rates) to avoid
     * introducing non-deterministic behavior. The update time step should be
     * the same for all players/users in multiplayer/multi-user applications.
     *
     * See also `GameLoop.getSimulationTimeStep()`.
     *
     * @param {Number} timeStep
     *   The number of milliseconds that should be simulated by every run of
     *   {@link #setUpdateFunction update}().
     */
    setSimulationTimeStep(timeStep) {
        this._simulationTimeStep = timeStep;
        return this;
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Returns the exponential moving average of the frames per second.
     *
     * @return {Number}
     *   The exponential moving average of the frames per second.
     */
    getFPS() {
        return this._fps;
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Gets the maximum frame rate.
     *
     * Other factors also limit the FPS; see `GameLoop.setSimulationTimeStep`
     * for details.
     *
     * See also `GameLoop.setMaxAllowedFPS()`.
     *
     * @return {Number}
     *   The maximum number of frames per second allowed.
     */
    getMaxAllowedFPS() {
        return 1000 / this._minimumFrameDelay;
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Sets a maximum frame rate.
     *
     * See also `GameLoop.getMaxAllowedFPS()`.
     *
     * @param {Number} [fps=Infinity]
     *   The maximum number of frames per second to execute. If Infinity or not
     *   passed, there will be no FPS cap (although other factors do limit the
     *   FPS; see `GameLoop.setSimulationTimeStep` for details). If zero, this
     *   will stop the loop, and when the loop is next started, it will return
     *   to the previous maximum frame rate. Passing negative values will stall
     *   the loop until this function is called again with a positive value.
     *
     * @chainable
     */
    setMaxAllowedFPS(fps) {
        if (typeof fps === 'undefined') {
            fps = Infinity;
        }
        if (fps === 0) {
            this.stop();
        }
        else {
            // Dividing by Infinity returns zero.
            this._minimumFrameDelay = 1000 / fps;
        }
        return this;
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Reset the amount of time that has not yet been simulated to zero.
     *
     * This introduces non-deterministic behavior if called after the
     * application has started running (unless it is being reset, in which case
     * it doesn't matter). However, this can be useful in cases where the
     * amount of time that has not yet been simulated has grown very large
     * (for example, when the application's tab gets put in the background and
     * the browser throttles the timers as a result). In applications with
     * lockstep the player would get dropped, but in other networked
     * applications it may be necessary to snap or ease the player/user to the
     * authoritative state and discard pending updates in the process. In
     * non-networked applications it may also be acceptable to simply resume
     * the application where it last left off and ignore the accumulated
     * unsimulated time.
     *
     * @return {Number}
     *   The cumulative amount of elapsed time in milliseconds that has not yet
     *   been simulated, but is being discarded as a result of calling this
     *   function.
     */
    resetFrameDelta() {
        const oldFrameDelta = this._frameDelta;
        this._frameDelta = 0;
        return oldFrameDelta;
    }

    /**
     * Sets the function that runs at the beginning of the main loop.
     *
     * The begin() function is typically used to process input before the
     * updates run. Processing input here (in chunks) can reduce the running
     * time of event handlers, which is useful because long-running event
     * handlers can sometimes delay frames.
     *
     * Unlike {@link #setUpdateFunction update}(), which can run zero or more times per
     * frame, begin() always runs exactly once per frame. This makes it useful
     * for any updates that are not dependent on time in the simulation.
     * Examples include adjusting HUD calculations or performing long-running
     * updates incrementally. Compared to {@link #setEndFunction end}(), generally
     * actions should occur in begin() if they affect anything that
     * {@link #setUpdateFunction update}() or {@link #setDrawFunction draw}() use.
     *
     * @param {Function} beginFunction The begin() function.
     * @param {Number} [beginFunction.timestamp]
     *   The current timestamp (when the frame started), in milliseconds. This
     *   should only be used for comparison to other timestamps because the
     *   epoch (i.e. the "zero" time) depends on the engine running this code.
     *   In engines that support `DOMHighResTimeStamp` (all modern browsers
     *   except iOS Safari 8) the epoch is the time the page started loading,
     *   specifically `performance.timing.navigationStart`. Everywhere else,
     *   including node.js, the epoch is the Unix epoch (1970-01-01T00:00:00Z).
     * @param {Number} [beginFunction.delta]
     *   The total elapsed time that has not yet been simulated, in
     *   milliseconds.
     */
    setBeginFunction(beginFunction) {
        this._beginFunction = beginFunction || this._beginFunction;
        return this;
    }

    /**
     * Sets the function that runs updates (e.g. AI and physics).
     *
     * The update() function should simulate anything that is affected by time.
     * It can be called zero or more times per frame depending on the frame
     * rate.
     *
     * As with everything in the main loop, the running time of update()
     * directly affects the frame rate. If update() takes long enough that the
     * frame rate drops below the target ("budgeted") frame rate, parts of the
     * update() function that do not need to execute between every frame can be
     * moved into Web Workers. (Various sources on the internet sometimes
     * suggest other scheduling patterns using setTimeout() or setInterval().
     * These approaches sometimes offer modest improvements with minimal
     * changes to existing code, but because JavaScript is single-threaded, the
     * updates will still block rendering and drag down the frame rate. Web
     * Workers execute in separate threads, so they free up more time in the
     * main loop.)
     *
     * This script can be imported into a Web Worker using importScripts() and
     * used to run a second main loop in the worker. Some considerations:
     *
     * - Profile your code before doing the work to move it into Web Workers.
     *   It could be the rendering that is the bottleneck, in which case the
     *   solution is to decrease the visual complexity of the scene.
     * - It doesn't make sense to move the *entire* contents of update() into
     *   workers unless {@link #setDrawFunction draw}() can interpolate between frames.
     *   The lowest-hanging fruit is background updates (like calculating
     *   citizens' happiness in a city-building game), physics that doesn't
     *   affect the scene (like flags waving in the wind), and anything that is
     *   occluded or happening far off screen.
     * - If draw() needs to interpolate physics based on activity that occurs
     *   in a worker, the worker needs to pass the interpolation value back to
     *   the main thread so that is is available to draw().
     * - Web Workers can't access the state of the main thread, so they can't
     *   directly modify objects in your scene. Moving data to and from Web
     *   Workers is a pain. The fastest way to do it is with Transferable
     *   Objects: basically, you can pass an ArrayBuffer to a worker,
     *   destroying the original reference in the process.
     *
     * You can read more about Web Workers and Transferable Objects at
     * [HTML5 Rocks](http://www.html5rocks.com/en/tutorials/workers/basics/).
     *
     * @param {Function} updateFunction
     *   The update() function.
     * @param {Number} [updateFunction.delta]
     *   The amount of time in milliseconds to simulate in the update. In most
     *   cases this time step never changes in order to ensure deterministic
     *   updates. The time step is the same as that returned by
     *   `GameLoop.getSimulationTimeStep()`.
     */
    setUpdateFunction(updateFunction) {
        this._updateFunction = updateFunction || this._updateFunction;
        return this;
    }

    /**
     * Sets the function that draws things on the screen.
     *
     * The draw() function gets passed the percent of time that the next run of
     * {@link #setUpdateFunction update}() will simulate that has actually elapsed, as
     * a decimal. In other words, draw() gets passed how far between update()
     * calls it is. This is useful because the time simulated by update() and
     * the time between draw() calls is usually different, so the parameter to
     * draw() can be used to interpolate motion between frames to make
     * rendering appear smoother. To illustrate, if update() advances the
     * simulation at each vertical bar in the first row below, and draw() calls
     * happen at each vertical bar in the second row below, then some frames
     * will have time left over that is not yet simulated by update() when
     * rendering occurs in draw():
     *
     *     update() time steps:  |  |  |  |  |  |  |  |  |
     *     draw() calls:        |   |   |   |   |   |   |
     *
     * To interpolate motion for rendering purposes, objects' state after the
     * last update() must be retained and used to calculate an intermediate
     * state. Note that this means renders will be up to one update() behind.
     * This is still better than extrapolating (projecting objects' state after
     * a future update()) which can produce bizarre results. Storing multiple
     * states can be difficult to set up, and keep in mind that running this
     * process takes time that could push the frame rate down, so it's often
     * not worthwhile unless stuttering is visible.
     *
     * @param {Function} drawFunction
     *   The draw() function.
     * @param {Number} [drawFunction.interpolationPercentage]
     *   The cumulative amount of time that hasn't been simulated yet, divided
     *   by the amount of time that will be simulated the next time update()
     *   runs. Useful for interpolating frames.
     */
    setDrawFunction(drawFunction) {
        this._drawFunction = drawFunction || this._drawFunction;
        return this;
    }

    /**
     * Sets the function that runs at the end of the main loop.
     *
     * Unlike {@link #setUpdateFunction update}(), which can run zero or more times per
     * frame, end() always runs exactly once per frame. This makes it useful
     * for any updates that are not dependent on time in the simulation.
     * Examples include cleaning up any temporary state set up by
     * {@link #setBeginFunction begin}(), lowering the visual quality if the frame rate
     * is too low, or performing long-running updates incrementally. Compared
     * to begin(), generally actions should occur in end() if they use anything
     * that update() or {@link #setDrawFunction draw}() affect.
     *
     * @param {Function} endFunction
     *   The end() function.
     * @param {Number} [endFunction.fps]
     *   The exponential moving average of the frames per second. This is the
     *   same value returned by `GameLoop.getFPS()`. It can be used to take
     *   action when the FPS is too low (or to restore to normalcy if the FPS
     *   moves back up). Examples of actions to take if the FPS is too low
     *   include exiting the application, lowering the visual quality, stopping
     *   or reducing activities outside of the main loop like event handlers or
     *   audio playback, performing non-critical updates less frequently, or
     *   increasing the simulation time step (by calling
     *   `GameLoop.setSimulationTimeStep()`). Note that this last option
     *   results in more time being simulated per update() call, which causes
     *   the application to behave non-deterministically.
     * @param {Boolean} [endFunction.panic=false]
     *   Indicates whether the simulation has fallen too far behind real time.
     *   Specifically, `panic` will be `true` if too many updates occurred in
     *   one frame. In networked lockstep applications, the application should
     *   wait for some amount of time to see if the user can catch up before
     *   dropping the user. In networked but non-lockstep applications, this
     *   typically indicates that the user needs to be snapped or eased to the
     *   current authoritative state. When this happens, it may be convenient
     *   to call `GameLoop.resetFrameDelta()` to discard accumulated pending
     *   updates. In non-networked applications, it may be acceptable to allow
     *   the application to keep running for awhile to see if it will catch up.
     *   However, this could also cause the application to look like it is
     *   running very quickly for a few frames as it transitions through the
     *   intermediate states. An alternative that may be acceptable is to
     *   simply ignore the unsimulated elapsed time by calling
     *   `GameLoop.resetFrameDelta()` even though this introduces
     *   non-deterministic behavior. In all cases, if the application panics
     *   frequently, this is an indication that the main loop is running too
     *   slowly. However, most of the time the drop in frame rate will probably
     *   be noticeable before a panic occurs. To help the application catch up
     *   after a panic caused by a spiral of death, the same steps can be taken
     *   that are suggested above if the FPS drops too low.
     */
    setEndFunction(endFunction) {
        this._endFunction = endFunction || this._endFunction;
        return this;
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Starts the main loop.
     *
     * Note that the application is not considered "running" immediately after
     * this function returns; rather, it is considered "running" after the
     * application draws its first frame. The distinction is that event
     * handlers should remain paused until the application is running, even
     * after `GameLoop.start()` is called. Check `GameLoop.isRunning()` for the
     * current status. To act after the application starts, register a callback
     * with requestAnimationFrame() after calling this function and execute the
     * action in that callback. It is safe to call `GameLoop.start()` multiple
     * times even before the application starts running and without calling
     * `GameLoop.stop()` in between, although there is no reason to do this;
     * the main loop will only start if it is not already started.
     *
     * See also `GameLoop.stop()`.
     */
    start() {
        if (!this._isStarted) {
            // Since the application doesn't start running immediately, track
            // whether this function was called and use that to keep it from
            // starting the main loop multiple times.
            this._isStarted = true;

            // In the main loop, draw() is called after update(), so if we
            // entered the main loop immediately, we would never render the
            // initial state before any updates occur. Instead, we run one
            // frame where all we do is draw, and then start the main loop with
            // the next frame.
            this._rafHandle = requestAnimationFrame(timestamp => {
                // Render the initial state before any updates occur.
                this._drawFunction(1);

                // The application isn't considered "running" until the
                // application starts drawing.
                this._isRunning = true;

                // Reset variables that are used for tracking time so that we
                // don't simulate time passed while the application was paused.
                this._lastFrameTimeMs = timestamp;
                this._lastFpsUpdate = timestamp;
                this._framesThisSecond = 0;

                // Start the main loop.
                this._rafHandle = requestAnimationFrame((timestamp) => this._animate(timestamp));
            });
        }
        return this;
    }

    /**
     * Stops the main loop.
     *
     * Event handling and other background tasks should also be paused when the
     * main loop is paused.
     *
     * Note that pausing in multiplayer/multi-user applications will cause the
     * player's/user's client to become out of sync. In this case the
     * simulation should exit, or the player/user needs to be snapped to their
     * updated position when the main loop is started again.
     *
     * See also `GameLoop.start()` and `GameLoop.isRunning()`.
     */
    stop() {
        this._isRunning = false;
        this._isStarted = false;
        this._cancelAnimationFrame(this._rafHandle);
        return this;
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Returns whether the main loop is currently running.
     *
     * See also `GameLoop.start()` and `GameLoop.stop()`.
     *
     * @return {Boolean}
     *   Whether the main loop is currently running.
     */
    isRunning() {
        return this._isRunning;
    }

    //noinspection JSUnusedGlobalSymbols,JSValidateJSDoc
    /**
     * The main loop that runs updates and rendering.
     *
     * @param {DOMHighResTimeStamp} timestamp
     *   The current timestamp. In practice this is supplied by
     *   requestAnimationFrame at the time that it starts to fire callbacks. This
     *   should only be used for comparison to other timestamps because the epoch
     *   (i.e. the "zero" time) depends on the engine running this code. In engines
     *   that support `DOMHighResTimeStamp` (all modern browsers except iOS Safari
     *   8) the epoch is the time the page started loading, specifically
     *   `performance.timing.navigationStart`. Everywhere else, including node.js,
     *   the epoch is the Unix epoch (1970-01-01T00:00:00Z).
     * @ignore
     */
    _animate(timestamp) {
        // Run the loop again the next time the browser is ready to render.
        // We set rafHandle immediately so that the next frame can be canceled
        // during the current frame.
        this._rafHandle = requestAnimationFrame((timestamp) => this._animate(timestamp));

        // Throttle the frame rate (if minFrameDelay is set to a non-zero value by
        // `GameLoop.setMaxAllowedFPS()`).
        if (timestamp < this._lastFrameTimeMs + this._minimumFrameDelay) {
            return;
        }

        // frameDelta is the cumulative amount of in-app time that hasn't been
        // simulated yet. Add the time since the last frame. We need to track total
        // not-yet-simulated time (as opposed to just the time elapsed since the
        // last frame) because not all actually elapsed time is guaranteed to be
        // simulated each frame. See the comments below for details.
        this._frameDelta += timestamp - this._lastFrameTimeMs;
        this._lastFrameTimeMs = timestamp;

        // Run any updates that are not dependent on time in the simulation. See
        // `GameLoop.setBeginFunction()` for additional details on how to use this.
        this._beginFunction(timestamp, this._frameDelta);

        // Update the estimate of the frame rate, `fps`. Every second, the number
        // of frames that occurred in that second are included in an exponential
        // moving average of all frames per second, with an alpha of 0.25. This
        // means that more recent seconds affect the estimated frame rate more than
        // older seconds.
        if (timestamp > this._lastFpsUpdate + 1000) {
            // Compute the new exponential moving average with an alpha of 0.25.
            // Using constants inline is okay here.
            this._fps = 0.25 * this._framesThisSecond + 0.75 * this._fps;

            this._lastFpsUpdate = timestamp;
            this._framesThisSecond = 0;
        }
        this._framesThisSecond++;

        /*
         * A naive way to move an object along its X-axis might be to write a main
         * loop containing the statement `obj.x += 10;` which would move the object
         * 10 units per frame. This approach suffers from the issue that it is
         * dependent on the frame rate. In other words, if your application is
         * running slowly (that is, fewer frames per second), your object will also
         * appear to move slowly, whereas if your application is running quickly
         * (that is, more frames per second), your object will appear to move
         * quickly. This is undesirable, especially in multiplayer/multi-user
         * applications.
         *
         * One solution is to multiply the speed by the amount of time that has
         * passed between rendering frames. For example, if you want your object to
         * move 600 units per second, you might write `obj.x += 600 * delta`, where
         * `delta` is the time passed since the last frame. (For convenience, let's
         * move this statement to an update() function that takes `delta` as a
         * parameter.) This way, your object will move a constant distance over
         * time. However, at low frame rates and high speeds, your object will move
         * large distances every frame, which can cause it to do strange things
         * such as move through walls. Additionally, we would like our program to
         * be deterministic. That is, every time we run the application with the
         * same input, we would like exactly the same output. If the time between
         * frames (the `delta`) varies, our output will diverge the longer the
         * program runs due to accumulated rounding errors, even at normal frame
         * rates.
         *
         * A better solution is to separate the amount of time simulated in each
         * update() from the amount of time between frames. Our update() function
         * doesn't need to change; we just need to change the delta we pass to it
         * so that each update() simulates a fixed amount of time (that is, `delta`
         * should have the same value each time update() is called). The update()
         * function can be run multiple times per frame if needed to simulate the
         * total amount of time passed since the last frame. (If the time that has
         * passed since the last frame is less than the fixed simulation time, we
         * just won't run an update() until the the next frame. If there is
         * unsimulated time left over that is less than our time step, we'll just
         * leave it to be simulated during the next frame.) This approach avoids
         * inconsistent rounding errors and ensures that there are no giant leaps
         * through walls between frames.
         *
         * That is what is done below. It introduces a new problem, but it is a
         * manageable one: if the amount of time spent simulating is consistently
         * longer than the amount of time between frames, the application could
         * freeze and crash in a spiral of death. This won't happen as long as the
         * fixed simulation time is set to a value that is high enough that
         * update() calls usually take less time than the amount of time they're
         * simulating. If it does start to happen anyway, see `GameLoop.setEndFunction()`
         * for a discussion of ways to stop it.
         *
         * Additionally, see `GameLoop.setUpdateFunction()` for a discussion of performance
         * considerations.
         *
         * Further reading for those interested:
         *
         * - http://gameprogrammingpatterns.com/game-loop.html
         * - http://gafferongames.com/game-physics/fix-your-time step/
         * - https://gamealchemist.wordpress.com/2013/03/16/thoughts-on-the-javascript-game-loop/
         * - https://developer.mozilla.org/en-US/docs/Games/Anatomy
         */
        this._numUpdateSteps = 0;
        while (this._frameDelta >= this._simulationTimeStep) {
            this._updateFunction(this._simulationTimeStep);
            this._frameDelta -= this._simulationTimeStep;

            /*
             * Sanity check: bail if we run the loop too many times.
             *
             * One way this could happen is if update() takes longer to run than
             * the time it simulates, thereby causing a spiral of death. For ways
             * to avoid this, see `GameLoop.setEndFunction()`. Another way this could
             * happen is if the browser throttles serving frames, which typically
             * occurs when the tab is in the background or the device battery is
             * low. An event outside of the main loop such as audio processing or
             * synchronous resource reads could also cause the application to hang
             * temporarily and accumulate not-yet-simulated time as a result.
             *
             * 240 is chosen because, for any sane value of simulationTimestep, 240
             * updates will simulate at least one second, and it will simulate four
             * seconds with the default value of simulationTimestep. (Safari
             * notifies users that the script is taking too long to run if it takes
             * more than five seconds.)
             *
             * If there are more updates to run in a frame than this, the
             * application will appear to slow down to the user until it catches
             * back up. In networked applications this will usually cause the user
             * to get out of sync with their peers, but if the updates are taking
             * this long already, they're probably already out of sync.
             */
            if (++this._numUpdateSteps >= 240) {
                this._isInPanic = true;
                break;
            }
        }

        /*
         * Render the screen. We do this regardless of whether update() has run
         * during this frame because it is possible to interpolate between updates
         * to make the frame rate appear faster than updates are actually
         * happening. See `GameLoop.setDrawFunction()` for an explanation of how to do
         * that.
         *
         * We draw after updating because we want the screen to reflect a state of
         * the application that is as up-to-date as possible. (`GameLoop.start()`
         * draws the very first frame in the application's initial state, before
         * any updates have occurred.) Some sources speculate that rendering
         * earlier in the requestAnimationFrame callback can get the screen painted
         * faster; this is mostly not true, and even when it is, it's usually just
         * a trade-off between rendering the current frame sooner and rendering the
         * next frame later.
         *
         * See `GameLoop.setDrawFunction()` for details about draw() itself.
         */
        this._drawFunction(this._frameDelta / this._simulationTimeStep);

        // Run any updates that are not dependent on time in the simulation. See
        // `GameLoop.setEndFunction()` for additional details on how to use this.
        this._endFunction(this._fps, this._isInPanic);

        this._isInPanic = false;
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * The function that runs the main loop. The unprefixed version of
     * `window.requestAnimationFrame()` is available in all modern browsers
     * now, but node.js doesn't have it, so fall back to timers. The polyfill
     * is adapted from the MIT-licensed
     * https://github.com/underscorediscovery/realtime-multiplayer-in-html5
     */
    _requestAnimationFrame(callback) {
        this._lastTimestamp = Date.now();
        let now = Date.now();
        // The next frame should run no sooner than the simulation allows,
        // but as soon as possible if the current frame has already taken
        // more time to run than is simulated in one time step.
        const timeout = Math.max(0, this._simulationTimeStep - (now - this._lastTimestamp));
        this._lastTimestamp = now + timeout;
        return setTimeout(function () {
            callback(now + timeout);
        }, timeout);
    }

    //noinspection JSMethodCanBeStatic
    /**
     * The function that stops the main loop. The unprefixed version of
     * `window.cancelAnimationFrame()` is available in all modern browsers now,
     * but node.js doesn't have it, so fall back to timers.
     */
    _cancelAnimationFrame(rafHandle) {
        if (typeof window === 'object') {
            cancelAnimationFrame(rafHandle);
        } else {
            clearTimeout(rafHandle);
        }
    }
}


// // AMD support
// if (typeof define === 'function' && define.amd) {
//     define(root.GameLoop);
// }
// // CommonJS support
// else if (typeof module === 'object' && module !== null && typeof module.exports === 'object') {
//     module.exports = root.GameLoop;
// }

/**
 * In all major browsers, replacing non-specified functions with NOOPs
 * seems to be as fast or slightly faster than using conditions to only
 * call the functions if they are specified. This is probably due to empty
 * functions being optimized away. http://jsperf.com/noop-vs-condition
 */
GameLoop.NOOP = () => {
};
