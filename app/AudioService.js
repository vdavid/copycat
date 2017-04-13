export class AudioService {
    /**
     * @param {Number} masterVolume A value from 0 to 1.
     */
    constructor(masterVolume) {
        this.audios = {};
        this.masterVolume = masterVolume;
    }

    /**
     * @param {function?} progressCallback No parameters.
     */
    loadResources(progressCallback) {
        for (let i = 0; i < audioResources.length; i++) {
            this._loadAudio(audioResources[i].url, this.masterVolume)
                .then(audio => {
                    this.audios[audioResources[i].audioId] = audio;
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

    play(audioId) {
        this.audios[audioId].play()
    }
}

AudioService.MOVEMENT = Symbol('MOVEMENT');
AudioService.SELECTION = Symbol('SELECTION');
AudioService.SUCCESS = Symbol('SUCCESS');
AudioService.VALIDATION = Symbol('VALIDATION');
AudioService.APPEARANCE = Symbol('APPEARANCE');
AudioService.LANDSLIDE = Symbol('LANDSLIDE');

const audioResources = [
    {audioId: AudioService.MOVEMENT, url: "./resources/sounds/NFF-select-04.mp3"},
    {audioId: AudioService.SELECTION, url: "./resources/sounds/NFF-select.mp3"},
    {audioId: AudioService.SUCCESS, url: "./resources/sounds/NFF-bravo.mp3"},
    {audioId: AudioService.VALIDATION, url: "./resources/sounds/NFF-click-switch.mp3"},
    {audioId: AudioService.APPEARANCE, url: "./resources/sounds/NFF-bubble-input.mp3"},
    {audioId: AudioService.LANDSLIDE, url: "./resources/sounds/NFF-moving-block.mp3"},
];
