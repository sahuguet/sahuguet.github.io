/* 
    GestureNavigator

    This component listens to touch events and dispatches gesture events.
    The web components genreates keydown events for the given keys: ArrowLeft, ArrowRight, ArrowUp, ArrowDown.

    Usage:
    - add <gesture-navigator></gesture-navigator> to your html file.
    - listen for the gesture events in your javascript code
*/

class GestureNavigator extends HTMLElement {
    constructor() {
        super();
        this.startX = 0;
        this.startY = 0;
        this.threshold = 30; // Minimum movement in pixels to be considered a swipe
    }

    connectedCallback() {
        document.addEventListener('touchstart', this.onTouchStart.bind(this));
        document.addEventListener('touchmove', this.onTouchMove.bind(this));
        document.addEventListener('touchend', this.onTouchEnd.bind(this));
    }

    disconnectedCallback() {
        this.removeEventListener('touchstart', this.onTouchStart);
        this.removeEventListener('touchmove', this.onTouchMove);
        this.removeEventListener('touchend', this.onTouchEnd);
    }

    onTouchStart(event) {
        const touch = event.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;
    }

    onTouchMove(event) {
        // Prevent scrolling while swiping
        event.preventDefault();
    }

    onTouchEnd(event) {
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - this.startX;
        const deltaY = touch.clientY - this.startY;

        let keyEvent;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (Math.abs(deltaX) > this.threshold) {
                if (deltaX > 0) {
                    log("gesture-right");
                    this.dispatchGesture('gesture-right', 'ArrowRight');
                } else {
                    log("gesture-left");
                    this.dispatchGesture('gesture-left', 'ArrowLeft');
                }
            }
        } else {
            // Vertical swipe
            if (Math.abs(deltaY) > this.threshold) {
                if (deltaY > 0) {
                    this.dispatchGesture('gesture-down', 'ArrowDown');
                } else {
                    this.dispatchGesture('gesture-up', 'ArrowUp');
                }
            }
        }
    }

    dispatchGesture(eventName, key) {
        this.dispatchEvent(new CustomEvent(eventName));

        const keyEvent = new KeyboardEvent('keydown', {
            key: key,
            code: key,
            bubbles: true,
            cancelable: true
        });

        document.dispatchEvent(keyEvent);
    }
}

// Define the custom element
customElements.define('gesture-navigator', GestureNavigator);
