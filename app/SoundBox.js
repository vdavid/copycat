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
        this.audios = {};
        for (let i = 0; i < audioResources.length; i++) {
            this._loadAudio(audioResources[i].url, masterVolume)
                .then(audio => {
                    console.log('Audio loaded: ' + audioResources[i].name);
                    this.audios[audioResources[i].name] = audio;
                    progressCallback();
                })
                .catch(error => {
                    console.log(error);
                    console.log('Audio not loaded. Error code: ' + error.code + '. Url: ' + error.url);
                });
        }
    }

    _loadAudio(url, masterVolume) {
        return new Promise((resolve, reject) => {
            //noinspection JSUnresolvedFunction
            let audio = new Audio();
            audio.addEventListener('canplaythrough', () => { resolve(audio); });
            audio.addEventListener('error', (error) => { error.url = url; reject(error); });
            audio.src = url;
            audio.volume = masterVolume;
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