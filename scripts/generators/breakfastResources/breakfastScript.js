export default async function scriptText(assets, menuHeadingText, assetLinkLists) {
    console.log('script text is called');
    console.log(assets);


    const checkForPlayableAssets = async (assets = []) => {
        console.log("check for playable assets called");
        if (assets.length === 0) {
            return;
        }
        let isActive = false;
        assets.forEach((asset) => {
            const now = new Date();
            const dayOfWeekNumber = now.getDay();
            let dayOfWeek;
            switch (dayOfWeekNumber) {
                case 0:
                    dayOfWeek = 'Sunday';
                    break;
                case 1:
                    dayOfWeek = 'Monday';
                    break;
                case 2:
                    dayOfWeek = 'Tuesday';
                    break;
                case 3:
                    dayOfWeek = 'Wednesday';
                    break;
                case 4:
                    dayOfWeek = 'Thursday';
                    break;
                case 5:
                    dayOfWeek = 'Friday';
                    break;
                case 6:
                    dayOfWeek = 'Saturday';
                    break;
                default:
                    break;
            }
            // console.log(dayOfWeek);
            if (asset.day == dayOfWeek) {
                isActive = true;
            }
        });
        if (!isActive) {
            await new Promise(r => setTimeout(r, 5000));
            await checkForPlayableAssets(assets);
        }
    };

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    const parseItem = (ItemString) => {
        const lowered = ItemString.toLowerCase();
        const hyphenatedString = lowered.replace(/\s+/g, '-');
        return hyphenatedString;
    }

    async function playAds() { //this function runs on loop and never stops working bcoz of the incrementad index it's always supposed to loop over the assets
        console.log("play ads is called");
        const container = document.getElementById('carousel-container');
        await checkForPlayableAssets(assets); //just checks if at least one is active to take it in the loop so that it doesnt throw any error
        console.log("check for playable assets exited");
        const headingsDiv = document.createElement('div');
        const menuHeading = document.createElement('h1');
        headingsDiv.classList.add('headingsDiv');
        container.appendChild(headingsDiv);
        headingsDiv.appendChild(menuHeading);
        menuHeading.textContent = menuHeadingText;
        const photoDiv = document.createElement('div');
        photoDiv.classList.add('photoDiv');
        container.appendChild(photoDiv);
        const img1 = document.createElement('img');
        const img2 = document.createElement('img');
        photoDiv.appendChild(img1);
        photoDiv.appendChild(img2);
        console.log(assetLinkLists);
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
            itemEntry.appendChild(price);
            itemEntry.classList.add('hidden-heading');
            const dayString = asset.day;
            itemEntry.classList.add(dayString);
            headingsDiv.appendChild(itemEntry);
        });
        const headings = document.getElementsByClassName('itemEntry');
        let shouldContinue = true;
        while (shouldContinue) {
            if (assets.length == 0) {
                break;
            }
            for (let index = 0; index < assets.length; index++) {
                const asset = assets[index];
                const now = new Date();
                const dayOfWeekNumber = now.getDay();
                let dayOfWeek;
                switch (dayOfWeekNumber) {
                    case 0:
                        dayOfWeek = 'Sunday';
                        break;
                    case 1:
                        dayOfWeek = 'Monday';
                        break;
                    case 2:
                        dayOfWeek = 'Tuesday';
                        break;
                    case 3:
                        dayOfWeek = 'Wednesday';
                        break;
                    case 4:
                        dayOfWeek = 'Thursday';
                        break;
                    case 5:
                        dayOfWeek = 'Friday';
                        break;
                    case 6:
                        dayOfWeek = 'Saturday';
                        break;
                    default:
                        break;
                }

                if (asset.day == dayOfWeek) {
                    // console.log("condition true");
                    for (let i = 0; i < headings.length; i++) {
                        if (headings[i].getElementsByTagName('h2')[0].textContent == asset.menuItem && headings[i].classList.contains(asset.day)) {
                            headings[i].classList.remove('hidden-heading');
                        }
                    }
                } else {
                    // console.log("condition false");
                    for (let i = 0; i < headings.length; i++) {
                        if (headings[i].getElementsByTagName('h2')[0].textContent == asset.menuItem && headings[i].classList.contains(asset.day)) {
                            headings[i].classList.add('hidden-heading');
                        }
                    }
                }
            }
            var img1Flag = 0;
            var numberOfVisibleItems = 0;
            for (let i = 0; i < headings.length; i++) {
                if (!headings[i].classList.contains('hidden-heading')) {
                    const item = parseItem(headings[i].getElementsByTagName('h2')[0].textContent);
                    assetLinkLists.forEach(link => {
                        if (link.includes(item)) {
                            if (img1Flag == 0) {
                                console.log(item);
                                const image = new Image();
                                image.onload = () => {
                                    // Once the image is loaded, update the img tag's src attribute
                                    img1.src = link;
                                };
                                image.src = link;
                                img1Flag = 1;
                            } else {
                                console.log(item);
                                const image = new Image();
                                image.onload = () => {
                                    // Once the image is loaded, update the img tag's src attribute
                                    img2.src = link;
                                };
                                image.src = link;
                            }
                        }
                    });
                    console.log(img1.src);
                    console.log(img2.src);
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

            await delay(3000);
        }
    }

    playAds();
};
