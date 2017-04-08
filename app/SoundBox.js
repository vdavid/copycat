const audioResources = [
    {name: "movement", url: "./resources/sounds/NFF-select-04.wav"},
    {name: "selection", url: "./resources/sounds/NFF-select.wav"},
    {name: "bravo", url: "./resources/sounds/NFF-bravo.wav"},
    {name: "validation", url: "./resources/sounds/NFF-click-switch.wav"},
    {name: "appearance", url: "./resources/sounds/NFF-bubble-input.wav"},
    {name: "landslide", url: "./resources/sounds/NFF-moving-block.wav"},
];

export class SoundBox {
    /**
     * @param {Number} masterVolume
     * @param {function?} progressCallback No parameters.
     */
    constructor(masterVolume, progressCallback) {
        this.loadedAudioCount = 0;

        this.audios = {};
        for (let index in audioResources) {
            if (audioResources.hasOwnProperty(index)) {
                this._loadAudio(audioResources[index].url, masterVolume)
                    .then(audio => {
                            this.audios[audioResources[index].name] = audio;
                            this.loadedAudioCount++;
                            progressCallback();
                        })
                    .catch(error => {
                            console.log('Media not loaded. Error code: ' + error.code + '. Url: ' + error.url);
                        });
            }
        }
    }

    _loadAudio(url, masterVolume) {
        return new Promise((resolve, reject) => {
            //noinspection JSUnresolvedFunction
            let audio = new Audio(url);
            if (!audio.error) {
                audio.volume = masterVolume;
                audio.addEventListener('canplaythrough', () => resolve(audio));
            } else {
                audio.error.url = url;
                reject(audio.error);
            }
        });
    }

    static getSupportedSoundCount() {
        return audioResources.length;
    }

    playMovementAudio() {
        this.audios['movement'].play();
    }

    playSelectionAudio() {
        this.audios['selection'].play();
    }

    playSuccessAudio() {
        this.audios['bravo'].play();
    }

    playValidationAudio() {
        this.audios['validation'].play();
    }

    playAppearanceAudio() {
        this.audios['appearance'].play();
    }

    playLandslideAudio() {
        this.audios['landslide'].play();
    }
}