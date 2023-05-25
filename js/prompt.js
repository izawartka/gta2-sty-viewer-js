export const Prompt = {
    promptCont: document.getElementById('prompt'),
    promptBox: document.getElementById('promptbox'),
    prompts: [],

    prompt: (html, buttons) => {
        return new Promise((resolve, reject) => {
            Prompt.prompts.push({html, buttons, resolve});
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

    update: () => {
        let anyPrompts = Prompt.prompts.length > 0;

        Prompt.promptCont.style.display = anyPrompts ? 'flex' : 'none';
        if(!anyPrompts) return;

        let prompt = Prompt.prompts.at(-1);

        let html = prompt.html + '<br><br>';
        prompt.buttons.forEach((button, id) => {
            html += `<button class="promptbutton" id="promptbutton_${id}">${button}</button>`;
        });
        Prompt.promptBox.innerHTML = html;

        prompt.buttons.forEach((button, id) => {
            let buttonElem = document.getElementById(`promptbutton_${id}`);
            buttonElem.onclick = () => {
                Prompt.prompts.pop();
                prompt.resolve(id);
                Prompt.update();
            };
        });
    }
}