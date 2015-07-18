import styles from './styles.less';

import Lumines from 'flux-lumines';
import reqwest from 'reqwest';

// Let's borrow some stuff from Lumines
import {UPDATE} from 'flux-lumines/src/game/actions.js';
import Clock from 'flux-lumines/src/misc/Clock.js';
import {requestAnimationFrame, cancelAnimationFrame} from 'flux-lumines/src/misc/requestAnimationFrame.js';

const mountpoint = document.getElementById('lumines-mountpoint');
let lumines;
let requestId;

reqwest({url: './assets/game1.record.json', type: 'json'})
    .then(history => replayHistory(history))
    .catch(() => console.log('Loading game record failed'));

function replayHistory(history) {
    // Note: To reduce the history size, the UPDATE action was omitted and we have to generate
    // it manually. We'll use requestAnimationFrame() for that which will also result in a
    // smoother playback. Unfortunately, the game can get out of sync because of occasional FPS
    // drops (like when the browser tab is inactive). That is actually not a big deal. The game
    // will end earlier and we just have to detect it and restart the sequence.

    lumines = new Lumines(mountpoint);
    const clock = new Clock();
    const startTs = performance.now();
    let position = 0;

    function update(time) {
        const elapsed = time - startTs;

        while (history[position] && history[position].time < elapsed) {
            lumines.dispatch(history[position].action, history[position++].payload);
        }

        if (history[position] && !lumines.isOver()) {
            lumines.dispatch(UPDATE, {time: clock.next(time) / 1000});
            lumines.render();
            requestId = requestAnimationFrame(update);
        } else {
            replayHistory(history);
        }
    }
    requestId = requestAnimationFrame(update);
}
