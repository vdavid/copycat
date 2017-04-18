export class Transition {
    /**
     *
     * @param {Symbol} style One of the constants in this class.
     * @param {Number} currentX In pixels.
     * @param {Number} currentY In pixels.
     * @param {Number} deltaX In pixels.
     * @param {Number} deltaY In pixels.
     */
    constructor(style, currentX, currentY, deltaX, deltaY) {
        this._startDateTime = new Date();
        this._duration = (style === Transition.STYLE_WALK) ? 200 : 80;
        this._style = style;
        this._currentX = currentX;
        this._currentY = currentY;
        this._deltaX = deltaX;
        this._deltaY = deltaY;
    }

    get isFinished() {
        return new Date() - this._startDateTime >= this._duration;
    }

    calculateCurrentX() {
        if (this._style === Transition.STYLE_WALK) {
            return Transition.easeInOutQuart(new Date() - this._startDateTime, this._currentX, this._deltaX, this._duration);
        } else {
            return Transition.linearTween(new Date() - this._startDateTime, this._currentX, this._deltaX, this._duration);
        }
    }

    calculateCurrentY() {
        if (this._style === Transition.STYLE_WALK) {
            return Transition.easeInOutQuart(new Date() - this._startDateTime, this._currentY, this._deltaY, this._duration);
        } else {
            return Transition.linearTween(new Date() - this._startDateTime, this._currentY, this._deltaY, this._duration);
        }
    }

    static linearTween(elapsedTime, startValue, amount, transitionDuration) {
        return amount * elapsedTime / transitionDuration + startValue;
    }

    static easeInOutQuart(elapsedTime, startValue, changeAmount, transitionDuration) {
        elapsedTime /= transitionDuration / 2;
        if (elapsedTime < 1) return changeAmount / 2 * elapsedTime * elapsedTime * elapsedTime * elapsedTime + startValue;
        elapsedTime -= 2;
        return -changeAmount / 2 * (elapsedTime * elapsedTime * elapsedTime * elapsedTime - 2) + startValue;
    }
}

Transition.STYLE_WALK = Symbol('STYLE_WALK');
Transition.STYLE_SLIDE = Symbol('STYLE_SLIDE');

