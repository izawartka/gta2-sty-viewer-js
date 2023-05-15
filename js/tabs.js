export class Tabs {
    constructor() {
        this.tabButtons = {};
        this.tabElements = {};
        this.mainTabName = '';
        //this.tabEvents = {};
        this.currentTabName = '';

        let detectedTabs = Array.from(document.getElementsByClassName('tab'));
        detectedTabs.forEach(tabElement => {
            if(!tabElement.id.startsWith('tab_')) {
                console.warn(`Tab element has incorrect id: ${tabElement.id}, should start with 'tab_'`);
                return;
            }
            let tabName = tabElement.id.substring(4);
            let tabButton = document.getElementById(`tab_${tabName}_btn`);
            if(!tabButton) {
                console.warn(`Tab button not found: ${tabName}`);
                return;
            }

            if(!this.mainTabName) this.mainTabName = tabName;
            this.tabElements[tabName] = tabElement;
            this.tabButtons[tabName] = tabButton;

            tabButton.onclick = (e) => {
                this.showTab(tabName);
            }
        });

        this.showTab(this.mainTabName);
    }

    showTab(tabName) {
        if(!this.tabElements[tabName]) {
            console.warn(`Tab not found: ${tabName}`);
            return;
        }
        if(this.currentTabName) {
            this.tabButtons[this.currentTabName].classList.remove('activeTabBtn');
            this.tabElements[this.currentTabName].classList.remove('activeTab');
        }
        
        this.currentTabName = tabName;

        this.tabButtons[this.currentTabName].classList.add('activeTabBtn');
        this.tabElements[this.currentTabName].classList.add('activeTab');        
    }
}