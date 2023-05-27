import { options } from "./constants.js";

export const PromptPaletteModes = {
    Any: 0,
    Used: 1,
    Unused: 2,
    Empty: 4,
    Unempty: 8,
}

export const Prompt = {
    promptCont: document.getElementById('prompt'),
    promptBox: document.getElementById('promptbox'),
    prompts: [],

    prompt: (html, buttons, onShow = null) => {
        return new Promise((resolve, reject) => {
            Prompt.prompts.push({html, buttons, onShow, resolve});
            Prompt.update();
        });
    },

    notice: (text) => {
        Prompt.prompt(text, ['OK']);
    },

    confirm: (text) => {
        return new Promise(async (resolve, reject) => {
            let resp = await Prompt.prompt(text, ['OK', 'Cancel']);
            resolve(resp == 0);
        });
    },

    palette: (text, renderer) => {
        return new Promise(async (resolve, reject) => {
            let selectedPal = -1;
            let buttons = ['OK', 'Cancel'];
            let html = text + `<br><br><div class="scrollCont"><canvas id="promptpalcanv"></canvas></div><span id="promptpaltext"></span>`;
            let onShow = () => {
                let canvas = document.getElementById('promptpalcanv');
                let text = document.getElementById('promptpaltext');
                
                canvas.onclick = (e) => {
                    selectedPal = renderer.getPointedFromX(canvas, e, options.palettesListScale);
                    renderer.renderPalettesList(canvas, selectedPal);
                    text.innerHTML = selectedPal == -1 ? '' : `Selected palette: ${selectedPal}`;
                };

                renderer.renderPalettesList(canvas);
            };

            let resp = await Prompt.prompt(html, buttons, onShow);
            if(resp == 1) resolve(-1);

            resolve(selectedPal);
        });
    },

    update: () => {
        let anyPrompts = Prompt.prompts.length > 0;

        Prompt.promptCont.style.display = anyPrompts ? 'flex' : 'none';
        if(!anyPrompts) return;

        let prompt = Prompt.prompts.at(-1);
        let html = prompt.html;
        
        html += '<br><br><div class="promptbuttons">';
        prompt.buttons.forEach((button, id) => {
            html += `<button class="promptbutton" id="promptbutton_${id}">${button}</button>`;
        });
        html += '</div>';
        Prompt.promptBox.innerHTML = html;

        prompt.buttons.forEach((button, id) => {
            let buttonElem = document.getElementById(`promptbutton_${id}`);
            buttonElem.onclick = () => {
                Prompt.prompts.pop();
                prompt.resolve(id);
                Prompt.update();
            };
        });

        if(prompt.onShow) prompt.onShow();
    }
}