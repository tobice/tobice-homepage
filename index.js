import Lumines from 'flux-lumines';
import reqwest from 'reqwest';
import React from 'react';
import classNames from 'classnames';
import bowser from 'bowser';

// Let's borrow some stuff from Lumines
import {UPDATE} from 'flux-lumines/src/game/actions.js';
import Clock from 'flux-lumines/src/misc/Clock.js';
import {requestAnimationFrame, cancelAnimationFrame} from 'flux-lumines/src/misc/requestAnimationFrame.js';

import styles from './styles.less';

const domBody = document.getElementsByTagName('body')[0];
const domPage = document.getElementById('page');

class GameWrapper extends React.Component {
    constructor() {
        this.state = {
            visible: false,
            disabled: localStorage.disabled ? JSON.parse(localStorage.disabled) : false
        };
    }

    componentDidMount() {
        reqwest({url: './assets/game1.record.json', type: 'json'})
            .then(record => {
                if (!this.state.visible && !this.state.disabled) {
                    this.replayRecord(record);
                }
            })
            .catch(() => console.log('Loading game record failed'));
    }

    setVisible(visible) {
        if (visible && (this.animationRequestId || !this.lumines)) {
            cancelAnimationFrame(this.animationRequestId);
            this.animationRequestId = null;

            this.lumines = new Lumines(React.findDOMNode(this.refs.lumines));
            this.lumines.start();
        }
        this.setState({
            visible: visible
        })
    }

    setDisabled(disabled) {
        localStorage.disabled = disabled;

        if (disabled) {
            if (this.animationRequestId) {
                cancelAnimationFrame(this.animationRequestId);
            }
            if (this.lumines) {
                this.lumines.stop();
                this.lumines = null;
            }
        }

        this.setState({
            visible: disabled ? false : this.state.visible,
            disabled: disabled
        })
    }

    replayRecord(record) {
        // Note: To reduce the history size, the UPDATE action was omitted and we have to generate
        // it manually. We'll use requestAnimationFrame() for that which will also result in a
        // smoother playback. Unfortunately, the game can get out of sync because of occasional FPS
        // drops (like when the browser tab is inactive). That is actually not a big deal. The game
        // will end earlier and we just have to detect it and restart the sequence.

        this.lumines = new Lumines(React.findDOMNode(this.refs.lumines));
        const clock = new Clock();
        const startTs = performance.now();
        let position = 0;

        const update = (time) => {
            const elapsed = time - startTs;

            while (record[position] && record[position].time < elapsed) {
                this.lumines.dispatch(record[position].action, record[position++].payload);
            }

            if (record[position] && !this.lumines.isOver()) {
                this.lumines.dispatch(UPDATE, {time: clock.next(time) / 1000});
                this.lumines.render();
                this.animationRequestId = requestAnimationFrame(update);
            } else {
                this.replayRecord(record);
            }
        };
        this.animationRequestId = requestAnimationFrame(update);
    }

    render() {
        const {visible, disabled} = this.state;

        if (visible) {
            domBody.classList.add('disable-scrolling');
            domPage.classList.add('page-hidden');
        } else {
            domBody.classList.remove('disable-scrolling');
            domPage.classList.remove('page-hidden');
        }

        const overlayClasses = classNames({
            'game-overlay': true,
            'game-muted': !visible
        });

        return (
            <div>
                {!disabled && <div className={overlayClasses}>
                    <div id="lumines-mountpoint" ref="lumines"></div>
                </div>}

                <ControlButton visible={disabled} onClick={this.setDisabled.bind(this, false)} big={false}>
                    Enable the game
                </ControlButton>
                <ControlButton visible={!disabled && visible} onClick={this.setVisible.bind(this, false)} big={true}>
                    Go back to the page
                </ControlButton>
                <ControlButton visible={!disabled && !visible} onClick={this.setVisible.bind(this, true)} big={true}>
                    Click to play <span className="blue-text">Lumines</span>
                </ControlButton>
                <ControlButton visible={!disabled} onClick={this.setDisabled.bind(this, true)} big={false}>
                    Slow? Disable the game
                </ControlButton>
            </div>
        )
    }
}

class ControlButton extends React.Component {
    render() {
        const props = this.props;
        const classes = classNames({
            'control-button': true,
            'control-button-small': !props.big,
            'control-button-big': props.big,
            'control-button-visible': props.visible
        });
        return (
            <div className={classes} {...props}>
                {React.DOM.div(null, props.children)}
            </div>
        )
    }
}


const browser = bowser.browser;
const disable = (browser.msie && browser.version < 10) || browser.tablet || browser.mobile;
if (!disable) {
    React.render(<GameWrapper />, document.getElementById('game-wrapper'));
}
