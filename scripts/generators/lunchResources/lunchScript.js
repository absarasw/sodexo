export default async function scriptText(assetsList) {
    let containerId = 0;
    const carouselContainerList = [];

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    const timeStringCheck = (timeString) => {
        return new RegExp('^([01]?[0-9]|2[0-3]):[0-5][0-9]$').test(timeString);
    }


    const checkTime = (startTime, endTime) => {
        const date = new Date();
        const startDateTime = new Date();
        if(timeStringCheck(startTime)) {
            const parts = startTime.split(':');
            startDateTime.setHours(parts[0]);
            startDateTime.setMinutes(parts[1]);
            startDateTime.setSeconds(0);
        }

        const endDateTime = new Date();

        if(timeStringCheck(endTime)) {
            const parts = endTime.split(':');
            endDateTime.setHours(parts[0]);
            endDateTime.setMinutes(parts[1]);
            endDateTime.setSeconds(0);
        } else {
            endDateTime.setFullYear(date.getFullYear() + 10);
        }

        return date.getTime() > startDateTime.getTime() && date.getTime() < endDateTime.getTime();

    }

    function hideCarousels() {
        carouselContainerList.forEach((carousel, i) => {
            carousel.classList.remove('carousel-container-show');
            carousel.classList.add('hidden-div');
        });
    }

    function hideMessage() {
        const oldContainer = document.getElementsByClassName('message-container')[0];
        if(oldContainer) {
            oldContainer.remove();
        }
    }

    function displayMessage(message) {
        const main = document.getElementsByTagName('main')[0];
        const oldContainer = document.getElementsByClassName('message-container')[0];
        if(oldContainer) {
            oldContainer.remove();
        }
        hideCarousels();
        const container = document.createElement('div');
        main.parentNode.insertBefore(container, main);
        container.classList.add('message-container');
        const heading = document.createElement('h1');
        container.appendChild(heading);
        heading.textContent = message;
    }

    async function playMenu() {
        console.log("play menu is called");
        let notShowMenu = false;
        if(!checkTime(startTime, endTime)) {
            displayMessage("Coming Soon");
            notShowMenu = true;
        }

        while(notShowMenu) {
            await delay(5000);
            if(checkTime(startTime, endTime)) {
                notShowMenu = false;
                hideMessage();
            }
        }

        assetsList.forEach((lunchAssets, lunchName) => {

            const main = document.getElementsByTagName('main')[0];
            const container = document.createElement('div');
            container.classList.add('carousel-container');
            container.classList.add('hidden-div');
            carouselContainerList.push(container);
            main.parentNode.insertBefore(container, main);
            const assets = lunchAssets[0];
            const headingsDiv = document.createElement('div');
            const menuHeading = document.createElement('h1');
            headingsDiv.classList.add('headingsDiv');
            container.appendChild(headingsDiv);
            headingsDiv.appendChild(menuHeading);
            menuHeading.textContent = lunchName;
            const photoDiv = document.createElement('div');
            photoDiv.classList.add('photoDiv');
            container.appendChild(photoDiv);
            const img = document.createElement('img');
            img.src = lunchAssets[1];
            img.classList.add('lunchImage');
            photoDiv.append(img);

            assets.forEach(asset => {
                const itemEntry = document.createElement('div');
                itemEntry.classList.add('itemEntry');
                const heading = document.createElement('h2');
                heading.classList.add('itemName');
                heading.textContent = asset.menuItem;
                if(asset.calories) {
                    heading.textContent = `${heading.textContent} (' + asset.calories + ')`;
                }
                itemEntry.appendChild(heading);
                headingsDiv.appendChild(itemEntry);
            });
        });

        let shouldContinue = true;
        while (shouldContinue) {

            const container = carouselContainerList[containerId];
            const headings = container.getElementsByClassName('itemEntry');


            var numberOfVisibleItems = 0;
            for (let i = 0; i < headings.length; i++) {
                if(!headings[i].classList.contains('hidden-heading')) {
                    numberOfVisibleItems++;
                }
            }

            const numContainer = carouselContainerList.length;
            if(numberOfVisibleItems === 0) {
                containerId = (containerId + 1) % numContainer;
                continue;
            }
            const maxHeight = 600 - 10 * numberOfVisibleItems; // Define the maximum height you want the h2 elements to occupy
            const maxFontSize = 40; // Define the maximum font size you want to apply

            const suitableFontSize = maxHeight / numberOfVisibleItems;
            const finalFontSize = Math.min(maxFontSize, suitableFontSize);

            const h2Elements = document.querySelectorAll('h2');
            for (let i = 0; i < h2Elements.length; i++) {
                h2Elements[i].style.fontSize = finalFontSize + 'px';
            }

            const prev = (containerId + numContainer - 1) % numContainer;
            carouselContainerList[containerId].classList.add('carousel-container-show');
            carouselContainerList[containerId].classList.remove('hidden-div');
            carouselContainerList[prev].classList.remove('carousel-container-show');
            carouselContainerList[prev].classList.add('hidden-div');
            containerId = (containerId + 1) % numContainer;

            await delay(5000);
            if(!checkTime(startTime, endTime)) {
                shouldContinue = false;
            }
        }
        displayMessage("Lunch Over");
    }
    playMenu();
};
