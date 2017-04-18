export default class StateRepository {
    static getLastLevelIndex(defaultLevel) {
        if (!localStorage['copycat']) {
            StateRepository.setLastLevelIndex(defaultLevel);
        }
        return JSON.parse(localStorage['copycat']);
    }

    static setLastLevelIndex(levelIndex) {
        localStorage.setItem("copycat", levelIndex);
    }
}