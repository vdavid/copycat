import {SpriteService} from "./../SpriteService";
import {AudioService} from "./../AudioService";
import {KeyCodes} from "./../KeyCodes";
import {MainMenu} from "./MainMenu";

export class AppMenu {
    constructor(context, levelCount, lastUnlockedLevelIndex, spriteService, audioService) {
        this._context = context;
        this._levelCount = levelCount;
        this._lastUnlockedLevelIndex = lastUnlockedLevelIndex;
        this._spriteService = spriteService;
        this._audioService = audioService;
        this._activePage = AppMenu.MAIN_PAGE;
        this._selectedLevelInLevelsMenu = 0;

        let menuItems = [{
            name: "start game",
            link: AppMenu.NO_PAGE
        }, {
            name: "levels",
            link: AppMenu.LEVELS_PAGE
        }, {
            name: "how to play",
            link: AppMenu.RULES_PAGE
        }, {
            name: "about",
            link: AppMenu.ABOUT_PAGE
        },];
        this._mainMenu = new MainMenu(context, this._context.canvas.width / 2, 110, menuItems, audioService, spriteService);
    }

    set activePage(activePage) {
        this._activePage = activePage;
    }

    set lastUnlockedLevelIndex(index) {
        this._lastUnlockedLevelIndex = index;
    }

    handleKeyDownEvent(keyCode) {
        if ((keyCode === KeyCodes.C) && ([AppMenu.RULES_PAGE, AppMenu.ABOUT_PAGE, AppMenu.LEVELS_PAGE, AppMenu.FINISHED_LAST_LEVEL_PAGE].indexOf(this._activePage) >= 0)) {
            this._audioService.play(AudioService.VALIDATION);
            this._activePage = AppMenu.MAIN_PAGE;

        } else if (this._activePage === AppMenu.MAIN_PAGE) {
            let result = this._mainMenu.handleKeyDownEvent(keyCode);

            if (result.action === AppMenu.NO_PAGE) {
                /* Gives back control to app and starts game at current level */
                return {startGame: true};
            } else if (result.action) {
                this._activePage = result.action;
            }

        } else if (this._activePage === AppMenu.LEVELS_PAGE) {
            let result = this._handleLevelsMenuKeyDownEvents(keyCode);

            if (result.action === AppMenu.NO_PAGE) {
                /* Gives back control to app and start game at level 1 */
                return {startGame: true, levelIndex: result.levelIndex};
            }
        }
        this.render();

        return {startGame: false};
    }

    _handleLevelsMenuKeyDownEvents(keyCode) {
        if (keyCode === KeyCodes.UP && this._selectedLevelInLevelsMenu - 6 > 0) {
            this._audioService.play(AudioService.SELECTION);
            this._selectedLevelInLevelsMenu -= 7;
            this._renderLevelsMenu();
        }
        if (keyCode === KeyCodes.DOWN && this._selectedLevelInLevelsMenu + 7 < this._lastUnlockedLevelIndex) {
            this._audioService.play(AudioService.SELECTION);
            this._selectedLevelInLevelsMenu += 7;
            this._renderLevelsMenu();
        }
        if (keyCode === KeyCodes.LEFT && this._selectedLevelInLevelsMenu > 0) {
            this._audioService.play(AudioService.SELECTION);
            this._selectedLevelInLevelsMenu -= 1;
            this._renderLevelsMenu();
        }
        if (keyCode === KeyCodes.RIGHT && this._selectedLevelInLevelsMenu + 1 < this._lastUnlockedLevelIndex) {
            this._audioService.play(AudioService.SELECTION);
            this._selectedLevelInLevelsMenu += 1;
            this._renderLevelsMenu();
        }
        if (keyCode === KeyCodes.X) {
            return {action: AppMenu.NO_PAGE, levelIndex: this._selectedLevelInLevelsMenu};
        }

        return {action: false};
    }

    render() {
        if(this._activePage === AppMenu.MAIN_PAGE) {
            this._renderMainMenu();
        } else if(this._activePage === AppMenu.FINISHED_LAST_LEVEL_PAGE) {
            this._renderFinishedLastLevelScreen();
        } else if(this._activePage === AppMenu.RULES_PAGE) {
            this._renderRules();
        } else if(this._activePage === AppMenu.ABOUT_PAGE) {
            this._renderAbout();
        } else if(this._activePage === AppMenu.LEVELS_PAGE) {
            this._renderLevelsMenu();
        }
    }

    _renderMainMenu() {
        this._context.fillStyle = this._context.createPattern(this._spriteService.getSpriteSheet(SpriteService.PATTERN).image, "repeat");
        this._context.fillRect(0, 0, this._context.canvas.width, this._context.canvas.height);

        this._context.drawImage(this._spriteService.getSpriteSheet(SpriteService.TITLE).image, 0, 0);
        this._mainMenu.render();
    }

    _renderLevelsMenu() {
        this._clearScreen("#fff1e8");

        this._context.fillStyle = "#fff1e8";
        this._spriteService.drawFrame(10, 10, this._context.canvas.width - 20, 200 - 20, "#fff1e8");
        this._spriteService.write("select level", this._context.canvas.width / 2, 25);
        for (let i = 0; i < this._levelCount; i++) {
            if (i > this._lastUnlockedLevelIndex - 1) {
                this._context.globalAlpha = 0.6;

                this._spriteService.draw(SpriteService.LOCK,
                    (32 + Math.floor(i % 7) * 32) - this._spriteService.getLockImage().width / 2,
                    (64 + Math.floor(i / 7) * 32) + 10);
            }
            this._spriteService.write((i + 1).toString(), 32 + Math.floor(i % 7) * 32, 64 + Math.floor(i / 7) * 32);
            this._context.globalAlpha = 1;
        }
        this._spriteService.draw(SpriteService.CURSOR_FRAME, 16 + Math.floor(this._selectedLevelInLevelsMenu % 7) * 32, 51 + Math.floor(this._selectedLevelInLevelsMenu / 7) * 32);

        this._context.fillStyle = "#83769c";
        this._context.fillRect(0, this._context.canvas.height - 35, this._context.canvas.width, 28);
        this._spriteService.write("arrow keys to select 'x' to confirm", this._context.canvas.width / 2, this._context.canvas.height - 30);
        this._spriteService.write("press 'c' to return to menu", this._context.canvas.width / 2, this._context.canvas.height - 20);
    }

    _renderRules() {
        this._clearScreen("#fff1e8");

        this._spriteService.write("game control: ", this._context.canvas.width / 2, 15);
        this._spriteService.write("arrow keys to move", this._context.canvas.width / 2, 60);
        this._spriteService.write("'f' to toggle fullscreen", this._context.canvas.width / 2, 80);
        this._spriteService.write("'r' if you're stuck", this._context.canvas.width / 2, 100);
        this._spriteService.write("'e' to exit the game", this._context.canvas.width / 2, 120);
        this._context.fillStyle = "#83769c";
        this._context.fillRect(0, this._context.canvas.height - 35, this._context.canvas.width, 18);
        this._spriteService.write("press 'c' to return to menu", this._context.canvas.width / 2, this._context.canvas.height - 30);
    }

    _renderAbout() {
        this._clearScreen("#fff1e8");

        this._spriteService.write("about: ", this._context.canvas.width / 2, 15);
        this._spriteService.write("made with html5 canvas", this._context.canvas.width / 2, 40);
        this._spriteService.write("by gtibo on codepen", this._context.canvas.width / 2, 55);
        this._spriteService.write("credits:", this._context.canvas.width / 2, 80);
        this._spriteService.write("sound effects: noiseforfun.com", this._context.canvas.width / 2, 100);
        this._context.fillStyle = "#83769c";
        this._context.fillRect(0, this._context.canvas.height - 35, this._context.canvas.width, 18);
        this._spriteService.write("press 'c' to return to menu", this._context.canvas.width / 2, this._context.canvas.height - 30);
    }

    _renderFinishedLastLevelScreen() {
        this._clearScreen("#fff1e8");

        this._spriteService.write("thanks for playing :) !", this._context.canvas.width / 2, 15);
        this._spriteService.write("if you have something to tell me about", this._context.canvas.width / 2, 40);
        this._spriteService.write("this pen please do so", this._context.canvas.width / 2, 55);
        this._spriteService.write("in the comment section.", this._context.canvas.width / 2, 70);
        this._spriteService.write("any feedback is appreciated", this._context.canvas.width / 2, 85);
        this._context.fillStyle = "#83769c";
        this._context.fillRect(0, this._context.canvas.height - 35, this._context.canvas.width, 18);
        this._spriteService.write("press 'c' to return to menu", this._context.canvas.width / 2, this._context.canvas.height - 30);
    }

    _clearScreen(color) {
        this._context.fillStyle = color;
        this._context.fillRect(0, 0, this._context.canvas.width, this._context.canvas.height);
    }
}

AppMenu.NO_PAGE = Symbol('NO_PAGE');
AppMenu.MAIN_PAGE = Symbol('MAIN_PAGE');
AppMenu.FINISHED_LAST_LEVEL_PAGE = Symbol('FINISHED_LAST_LEVEL_PAGE');
AppMenu.RULES_PAGE = Symbol('RULES_PAGE');
AppMenu.ABOUT_PAGE = Symbol('ABOUT_PAGE');
AppMenu.LEVELS_PAGE = Symbol('LEVELS_PAGE');