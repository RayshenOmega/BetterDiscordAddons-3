/**
 * @name HideChatIcons
 * @author Farcrada
 * @version 1.0.0
 * @description Hides the chat icons behind a button.
 * 
 * @website https://github.com/Farcrada/DiscordPlugins
 * @source https://github.com/Farcrada/DiscordPlugins/blob/master/Hide-Chat-Icons/HideChatIcons.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Farcrada/DiscordPlugins/master/Hide-Chat-Icons/HideChatIcons.plugin.js
 */


const config = {
    info: {
        name: "Hide Chat Icons",
        id: "HideChatIcons",
        description: "Hides the chat icons behind a button.",
        version: "1.0.0",
        author: "Farcrada",
        updateUrl: "https://raw.githubusercontent.com/Farcrada/DiscordPlugins/master/Hide-Chat-Icons/HideChatIcons.plugin.js"
    }
}


class HideChatIcons {
    getName() { return config.info.name; }
    getDescription() { return config.info.description; }
    getVersion() { return config.info.version; }
    getAuthor() { return config.info.author; }

    start() {
        if (!global.ZeresPluginLibrary) {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${this.getName()} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
                        async (error, response, body) => {
                            if (error)
                                return require("electron").shell.openExternal("https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                            await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                        });
                }
            });
        }

        //First try the updater
        try {
            global.ZeresPluginLibrary.PluginUpdater.checkForUpdate(config.info.name, config.info.version, config.info.updateUrl);
        }
        catch (err) {
            console.error(this.getName(), "Plugin Updater could not be reached.", err);
        }

        //Now try to initialize.
        try {
            this.initialize();
        }
        catch (err) {
            try {
                console.error("Attempting to stop after initialization error...", err)
                this.stop();
            }
            catch (err) {
                console.error(this.getName() + ".stop()", err);
            }
        }
    }

    initialize() {
        HideChatIcons.cssStyle = "HideChatIconsStyle";
        HideChatIcons.parentID = "buttonsParent";
        HideChatIcons.buttonID = "iconButton";
        HideChatIcons.iconsHiddenBool = false;
        HideChatIcons.buttonHidden = "iconsHidden";
        HideChatIcons.buttonVisible = "iconsVisible";
        HideChatIcons.hideElementsName = "hideIconElement";
        HideChatIcons.forceWidth = "forceIconWidth"
        HideChatIcons.animationTime = 325;

        HideChatIcons.buttonClasses = BdApi.findModuleByProps("buttons");

        BdApi.clearCSS(HideChatIcons.cssStyle);
        BdApi.injectCSS(HideChatIcons.cssStyle, `
        /* Button CSS */
        #${HideChatIcons.buttonID} {
            min-width: 12px;
            width: 12px;
            min-height: 12px;
            height: 12px;
            display: flex;
            background-position: center !important;
            background-size: 100% !important;
            opacity: 0.8;
            cursor: pointer;
        }

        /* How the button looks */
        .theme-dark #${HideChatIcons.buttonID}.${HideChatIcons.buttonVisible} {
            background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+CgkJCgkJCgkJCgkJCgkJPHBhdGggZD0iTTguNTkgMTYuNTlMMTMuMTcgMTIgOC41OSA3LjQxIDEwIDZsNiA2LTYgNi0xLjQxLTEuNDF6IiBmaWxsPSIjYjliYmJlIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz4KCTwvc3ZnPg==) no-repeat;
        }
        .theme-dark #${HideChatIcons.buttonID}.${HideChatIcons.buttonHidden} {
            background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+CgkJCgkJCgkJCgkJCgkJPHBhdGggZD0iTTE1LjQxIDE2LjU5TDEwLjgzIDEybDQuNTgtNC41OUwxNCA2bC02IDYgNiA2IDEuNDEtMS40MXoiIGZpbGw9IiNiOWJiYmUiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPgoJPC9zdmc+) no-repeat;
        }
        /* In light theme */
        .theme-light #${HideChatIcons.buttonID}.${HideChatIcons.buttonVisible} {
            background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+CgkJCgkJCgkJCgkJCgkJPHBhdGggZD0iTTguNTkgMTYuNTlMMTMuMTcgMTIgOC41OSA3LjQxIDEwIDZsNiA2LTYgNi0xLjQxLTEuNDF6IiBmaWxsPSIjNGY1NjYwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz4KCTwvc3ZnPg==) no-repeat;
        }
        .theme-light #${HideChatIcons.buttonID}.${HideChatIcons.buttonHidden} {
            background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+CgkJCgkJCgkJCgkJCgkJPHBhdGggZD0iTTE1LjQxIDE2LjU5TDEwLjgzIDEybDQuNTgtNC41OUwxNCA2bC02IDYgNiA2IDEuNDEtMS40MXoiIGZpbGw9IiM0ZjU2NjAiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPgoJPC9zdmc+) no-repeat;
        }

        .${HideChatIcons.forceWidth} {
            width: 0px;
        }
        
        /* Attached class to buttons */
        .${HideChatIcons.hideElementsName} {
            transform: translateX(200px);
            opacity: 0;
        }
        /* buttons container */
        .${HideChatIcons.buttonClasses.buttons} {
            transition: transform ${HideChatIcons.animationTime}ms ease, opacity ${HideChatIcons.animationTime}ms ease;
        }`)

        //Render the button and we're off to the races!
        this.renderButton();
    }

    //Everytime we switch the chat window is reloaded;
    //as a result we need to check and potentially render the button again.
    onSwitch() {
        if (!document.getElementById(HideChatIcons.buttonID))
            this.renderButton();
    }

    //Creation and appending our button, i.e. rendering.
    renderButton() {
        //Create our button, and fetch it's home.
        let button = document.createElement('div'),
            inner = document.querySelector(`.${HideChatIcons.buttonClasses.inner}`),
            parent = document.querySelector(`#${HideChatIcons.parentID}`);

        //If there is no title bar, dump
        if (!inner)
            return;

        //Set ID for easy targeting.
        button.setAttribute('id', HideChatIcons.buttonID);
        //Set class according to the current visibility
        button.setAttribute('class', HideChatIcons.iconsHiddenBool ? HideChatIcons.buttonHidden : HideChatIcons.buttonVisible);
        //Add our click event.
        button.addEventListener('click', () => this.toggleIcons());

        //Check for one of my other plugins
        let deleteButton = inner.querySelector("#deleteButton");

        //Insert it nested, so it all looks uniform
        if (!parent) {
            parent = document.createElement('div');
            parent.setAttribute('id', HideChatIcons.parentID);
        }

        if (deleteButton)
            parent.insertBefore(button, deleteButton);
        else
            parent.appendChild(button);

        inner.appendChild(parent);
    }

    //Toggle McToggleson.
    toggleIcons() {
        //Get our button and icon holder
        let button = document.getElementById(HideChatIcons.buttonID),
            icons = document.querySelector(`.${HideChatIcons.buttonClasses.buttons}`)

        //If it is showing, we need to hide it.
        if (!HideChatIcons.iconsHiddenBool) {
            //Change class for CSS
            button.setAttribute('class', HideChatIcons.buttonHidden);
            //And add our hide class to the icon holder for the animation
            icons.classList.add(HideChatIcons.hideElementsName);
            //Also set the memory.
            HideChatIcons.iconsHiddenBool = true;
            setTimeout(_ => {
                icons.classList.add(HideChatIcons.forceWidth);
            }, HideChatIcons.animationTime);
        }
        //If it is hidden, we need to show it.
        else {
            icons.classList.remove(HideChatIcons.forceWidth);
            button.setAttribute('class', HideChatIcons.buttonVisible);
            icons.classList.remove(HideChatIcons.hideElementsName);

            HideChatIcons.iconsHiddenBool = false;
        }
    }

    //Gotta remove all our patches
    stop() {
        //Our CSS
        BdApi.clearCSS(HideChatIcons.cssStyle)

        //Our button
        let button = document.getElementById(HideChatIcons.buttonID);
        if (button)
            button.remove();

        //And if there are remnants of css left,
        //make sure we remove the class from the sidebar to ensure visual confirmation.
        let icons = document.querySelector(`.${HideChatIcons.buttonClasses.buttons}`);
        
        if (icons.classList.contains(HideChatIcons.hideElementsName))
            icons.classList.remove(HideChatIcons.hideElementsName);

        if (icons.classList.contains(HideChatIcons.forceWidth))
            icons.classList.remove(HideChatIcons.forceWidth);
    }
}
