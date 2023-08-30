export default async function decorate(block) {

  let containerId = 0;
  const carouselContainerList = [];
  const scriptText = async (assetsList) => {
    console.log('script text is called');
    console.log(assetsList);
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
        //img.height = '1243';
        //img.width = '990';
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
          //itemEntry.appendChild(price);
          headingsDiv.appendChild(itemEntry);
        });
      });

      let shouldContinue = true;
      while (shouldContinue) {

        const container = carouselContainerList[containerId];
        const headings = container.getElementsByClassName('itemEntry');

        /*for (let index = 0; index < assets.length; index++) {
          const asset = assets[index];
          const startTime = parseStartTimeString(asset.startTime, asset.isGMT);
          const endTime = parseEndTimeString(asset.endTime, asset.isGMT);
          const now = new Date();

          if (now >= startTime && now <= endTime) {
            for (let i = 0; i < headings.length; i++) {
              if (headings[i].getElementsByTagName('h2')[0].textContent == asset.menuItem) {
                headings[i].classList.remove('hidden-heading');
              }
            }
          } else {
            for (let i = 0; i < headings.length; i++) {
              if (headings[i].getElementsByTagName('h2')[0].textContent == asset.menuItem) {
                headings[i].classList.add('hidden-heading');
              }
            }
          }
        }*/

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

  const runCarousel = async (assetsList = []) => {
    await scriptText(assetsList);
  }

  const getDayOfWeek = () => {
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
    return dayOfWeek;
  };

  const extractSheetData = (url) => {
    var sheetDetails = [];
    const columns = document.querySelectorAll('.locations > div');
    if (!columns) {
      console.warn('No carousel data found while extracting sheet data.');
      return sheetDetails;
    }
    for (let i = 0; i < columns.length; i++) {
      try {
        const divs = columns[i].getElementsByTagName('div');
        const value = divs[0].textContent;
        if(value == 'image1') {
          //const pic = divs[1].querySelector('picture');
          //pic.classList.add('lunchImage');
          //carouselContainer.appendChild(pic);
        } else if(value == 'image2') {
          //const pic = divs[1].querySelector('picture');
          //pic.classList.add('lunchImage');
          //carouselContainer1.appendChild(pic);
        } else {
          const link = divs[1].getElementsByTagName('a')[0].href;
          const linkUrl = new URL(link);
          const dayOfWeek = getDayOfWeek();
          const imgLink = divs[1].getElementsByTagName('a')[1].href;
          const sheetDetailsEntry = {name: value, link: url.origin + linkUrl.pathname + "?sheet=" + dayOfWeek, menuimage: imgLink};
          sheetDetails.push(sheetDetailsEntry);
        }

      } catch (err) {
        console.warn(`Exception while processing row ${i}`, err);
      }
    }
    return sheetDetails; //now it is returning an object sheet details which has the name of the sheet which I make futile and the link to the schedules.json
  }
  const validateTimeFormat = (time) => {
    if (!time) {
      return;
    }
    const timeFormatRegex = new RegExp('^(0?[1-9]|1[0-2]):[0-5][0-9]:[0-5][0-9]\\s(AM|PM)$');
    if (!timeFormatRegex.test(time)) {
      throw new Error(`Invalid time format: ${time}`);
    }
  }

  const isGMT = (timezone) => {
    return timezone && timezone.toLowerCase() === 'gmt';
  }

  const processSheetDataResponse = (sheetDataResponse) => {
    const allExcelAssets = [];
    if (sheetDataResponse[':type'] === 'sheet') {
      if(sheetDataResponse.hasOwnProperty('data')) {
        sheetDataResponse.data.forEach(asset => {
          allExcelAssets.push(asset);
        });
      }

      return allExcelAssets;
    } else {
      throw new Error(`Invalid sheet type: ${sheetDataResponse[':type']}`);
    }
    //now this function just returns the list of all the assets.
  }
  //just handles errors and exceptions for the fetch API
  const fetchData = async (url) => {
    let result = '';
    try {
      result = fetch(url)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`request to fetch ${url} failed with status code ${response.status}`);
            }
            return response.text();
          });
      return Promise.resolve(result);
    } catch (e) {
      throw new Error(`request to fetch ${url} failed with status code with error ${e}`);
    }
  }

  const parseItem = (ItemString) => {
    const lowered = ItemString.toLowerCase();
    const hyphenatedString = lowered.replace(/\s+/g, '-');
    return hyphenatedString;
  }

  const generateChannelHTML = async (url) => {
    const sheetDetailsList = extractSheetData(url) || [];
    console.log(JSON.stringify(sheetDetailsList));
    const assetsList = new Map();
    let errorFlag = false;

    for(let i = 0; i < sheetDetailsList.length; i++) {
      try {
        const sheetDetails = sheetDetailsList[i];
        if (!sheetDetails) {
          console.warn(`No sheet data available during HTML generation`);
        }
        const sheetDataResponse = JSON.parse(await fetchData(sheetDetails.link));
        console.log(JSON.stringify(sheetDataResponse));
        // console.log(JSON.stringify(assetListLinks));
        if (!sheetDataResponse) {
          console.warn(`Invalid sheet Link ${JSON.stringify(sheetDetails)}`);
        }

        const sheetData = processSheetDataResponse(sheetDataResponse);
        const assets = [];
        for (let row = 0; row < sheetData.length; row++) { //iterating over each asset
          try {
            const assetDetails = sheetData[row]; //asset object
            validateTimeFormat(assetDetails['Start Time']);
            validateTimeFormat(assetDetails['End Time']);
            assets.push({
              'menuItem': assetDetails['Menu Item'],
              'price': assetDetails['Price'],
              'startTime': assetDetails['Start Time'],
              'endTime': assetDetails['End Time'],
              'isGMT': isGMT(assetDetails['Timezone'])
            });
          } catch (err) {
            console.warn(`Error while processing asset ${JSON.stringify(sheetData[row])}`, err);
          }
        }
        assetsList.set(sheetDetails.name, [assets, sheetDetails.menuimage]);
      } catch (err) {
        errorFlag = true;
        console.warn(`Error while processing sheets`, err);
      }
    }
    if (errorFlag) {
      // Don't create HTML with no assets when there was an error
      console.log('Skipping HTML generation due to assets length zero along with error occurrence');
      return;
    }
    console.log(`Assets extracted for channel: ${JSON.stringify(assetsList)}`);
    await runCarousel(assetsList);
  };
  const header = document.getElementsByTagName('header');
  if (header && header[0]) {
    header[0].remove();
  }
  const main = document.getElementsByTagName('main')[0];
  main.style.opacity = 0;
  //const carouselContainer = document.createElement('div');
  //carouselContainer.id = 'carousel-container';
  //const carouselContainer1 = document.createElement('div');
  //carouselContainer1.id = 'carousel-container1';
  //main.parentNode.insertBefore(carouselContainer, main);
  //main.parentNode.insertBefore(carouselContainer1, main);
  const url = new URL(document.URL);
  await generateChannelHTML(url);
}
