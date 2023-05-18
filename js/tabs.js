export class Tabs {
    constructor() {
        this.tabs = {};
        this.mainTabName = '';
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
            this.tabs[tabName] = {
                element: tabElement,
                button: tabButton,
                locked: false,
            };

            tabButton.onclick = (e) => {
                this.showTab(tabName);
            }
        });

        this.showTab(this.mainTabName);
    }

    lockTab(tabName, lock = true) {
        if(!this.tabs[tabName]) {
            console.warn(`Tab not found: ${tabName}`);
            return;
        }

        this.tabs[tabName].locked = lock;

        if(lock)
            this.tabs[tabName].button.classList.add('lockedTabBtn');
        else
            this.tabs[tabName].button.classList.remove('lockedTabBtn');
    }

    lockAllTabs(lock = true) {
        Object.keys(this.tabs).forEach(tabName => {
            this.lockTab(tabName, lock);
        });
    }

    showTab(tabName) {
        if(!this.tabs[tabName]) {
            console.warn(`Tab not found: ${tabName}`);
            return;
        }
        if(this.tabs[tabName].locked) {
            return;
        }   
        if(this.currentTabName) {
            this.tabs[this.currentTabName].button.classList.remove('activeTabBtn');
            this.tabs[this.currentTabName].element.classList.remove('activeTab');
        }
        
        this.currentTabName = tabName;

        this.tabs[this.currentTabName].button.classList.add('activeTabBtn');
        this.tabs[this.currentTabName].element.classList.add('activeTab');        
    }
}