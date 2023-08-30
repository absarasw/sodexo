export default async function scriptText(assetsList) {
    let containerId = 0;
    const carouselContainerList = [];
    const parseTimeString = (timeString, isGMT) => {
        const parts = timeString.split(':');
        let hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = parseInt(parts[2].split(' ')[0], 10);
        const isPM = (timeString.indexOf('PM') > -1);
        if (isPM && hours < 12) {
            hours += 12;
        }
        if (!isPM && hours === 12) {
            hours -= 12;
        }
        const dateObj = new Date();
        if (isGMT) {
            dateObj.setUTCHours(hours);
            dateObj.setUTCMinutes(minutes);
            dateObj.setUTCSeconds(seconds);
        } else {
            dateObj.setHours(hours);
            dateObj.setMinutes(minutes);
            dateObj.setSeconds(seconds);
        }
        return dateObj;
    };

    const parseStartTimeString = (timeString, isGMT) => {
        if (!timeString) {
            return new Date();
        }
        return parseTimeString(timeString, isGMT);
    };

    const parseEndTimeString = (timeString, isGMT) => {
        if (!timeString) {
            const date = new Date();
            date.setFullYear(date.getFullYear() + 10);
            return date;
        }
        return parseTimeString(timeString, isGMT);
    };

    const checkForPlayableAssets = async (assets = []) => {
        console.log("check for playable assets called");
        if (assets.length === 0) {
            return;
        }
        let isActive = false;
        assets.forEach((asset) => {
            const startTime = parseStartTimeString(asset.startTime, asset.isGMT);
            const endTime = parseEndTimeString(asset.endTime, asset.isGMT);
            const now = new Date();
            if (now >= startTime && now <= endTime) {
                isActive = true;
            }
        });
    };

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function playAds() { //this function runs on loop and never stops working because of the incremented index it's always supposed to loop over the assets
        console.log("play ads is called");
        assetsList.forEach((lunchAssets, lunchName) => {

            const main = document.getElementsByTagName('main')[0];
            const container = document.createElement('div');
            container.classList.add('carousel-container');
            container.classList.add('hidden-div');
            carouselContainerList.push(container);
            main.parentNode.insertBefore(container, main);
            const assets = lunchAssets[0];
            //await checkForPlayableAssets(assets); //just checks if at least one is active to take it in the loop so that it doesnt throw any error
            console.log("check for playable assets exited");
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
                const price = document.createElement('h2');
                price.classList.add('price');
                heading.textContent = asset.menuItem;
                price.textContent = '@' + asset.price + '/-';
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
            const maxHeight = 600 - 10 * numberOfVisibleItems; // Define the maximum height you want the h2 elements to occupy
            const maxFontSize = 40; // Define the maximum font size you want to apply

            const suitableFontSize = maxHeight / numberOfVisibleItems;
            const finalFontSize = Math.min(maxFontSize, suitableFontSize);

            const h2Elements = document.querySelectorAll('h2');
            for (let i = 0; i < h2Elements.length; i++) {
                h2Elements[i].style.fontSize = finalFontSize + 'px';
            }

            const numContainer = carouselContainerList.length;

            const prev = (containerId + numContainer - 1) % numContainer;
            carouselContainerList[containerId].classList.add('carousel-container-show');
            carouselContainerList[containerId].classList.remove('hidden-div');
            carouselContainerList[prev].classList.remove('carousel-container-show');
            carouselContainerList[prev].classList.add('hidden-div');
            containerId = (containerId + 1) % numContainer;

            await delay(5000);
        }
    }
    playAds();
};
