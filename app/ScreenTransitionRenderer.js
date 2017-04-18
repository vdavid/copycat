export default class ScreenTransitionRenderer {
    constructor() {
    }

    slideVertically(context, duration, direction, backgroundRenderFunction) {
        return new Promise((resolve) => {
            let transitionStartDateTime = new Date();
            let initialHeight = (direction === ScreenTransitionRenderer.OPEN) ? context.canvas.height / 2 : 0;
            let finalHeight = (direction === ScreenTransitionRenderer.OPEN) ? -context.canvas.height / 2 : context.canvas.height / 2;

            loop();

            function loop() {
                let elapsedTime = new Date() - transitionStartDateTime;
                if (elapsedTime < duration) {
                    backgroundRenderFunction();
                    ScreenTransitionRenderer._render(context, elapsedTime, initialHeight, finalHeight, duration);
                    requestAnimationFrame(loop);
                } else {
                    resolve();
                }
            }
        });
    }

    static _render(context, elapsedTime, initialHeight, finalHeight, duration) {
        context.fillStyle = "black";
        let currentHeight = easeInOutQuart(elapsedTime, initialHeight, finalHeight, duration);
        context.fillRect(0, 0, context.canvas.width, currentHeight);
        context.fillRect(0, context.canvas.height, context.canvas.width, currentHeight * -1);
    }
}

function easeInOutQuart(elapsedTime, startValue, changeAmount, transitionDuration) {
    elapsedTime /= transitionDuration / 2;
    if (elapsedTime < 1) return changeAmount / 2 * elapsedTime * elapsedTime * elapsedTime * elapsedTime + startValue;
    elapsedTime -= 2;
    return -changeAmount / 2 * (elapsedTime * elapsedTime * elapsedTime * elapsedTime - 2) + startValue;
}

ScreenTransitionRenderer.OPEN = Symbol('OPEN');
ScreenTransitionRenderer.CLOSE = Symbol('CLOSE');