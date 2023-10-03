export default async function decorate(block) {
  const scriptText = async (assets) => {
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
        switch (dayOfWeekNumber){
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
      const menuHeadingText = carouselContainer.getAttribute('menuHeading');
      menuHeading.textContent = menuHeadingText;
      const photoDiv = document.createElement('div');
      photoDiv.classList.add('photoDiv');
      container.appendChild(photoDiv);
      const img1 = document.createElement('img');
      const img2 = document.createElement('img');
      photoDiv.appendChild(img1);
      photoDiv.appendChild(img2);
      const listUrl = '/content/screens/sodexo/sodexo-content/list-of-assets.json';
      const assetLinkListObjects = JSON.parse(await fetchData(listUrl));
      const assetLinkLists = assetLinkListObjects.data;

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
        if(assets.length == 0){
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
          if(!headings[i].classList.contains('hidden-heading')){
            const item = headings[i].getElementsByTagName('h2')[0].textContent;
            assetLinkLists.forEach(object => {
              if(object.Asset.toLowerCase() === item.toLowerCase()){
                if (img1Flag == 0) {
                  console.log(item);
                  const image = new Image();
                  image.onload = () => {
                    // Once the image is loaded, update the img tag's src attribute
                    img1.src = object.ItemLink;
                  };
                  image.src = object.ItemLink;
                  img1Flag = 1;
                }else{
                  console.log(item);
                  const image = new Image();
                  image.onload = () => {
                    // Once the image is loaded, update the img tag's src attribute
                    img2.src = object.ItemLink;
                  };
                  image.src = object.ItemLink;
                }
              }
            });
            console.log(img1.src);
            console.log(img2.src);
            numberOfVisibleItems++;
          }
        }
        const maxHeight = 600 - 10*numberOfVisibleItems; // Define the maximum height you want the h2 elements to occupy
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

  const runCarousel = async (assets = []) => {
    await scriptText(assets);
  }

  const extractSheetData = (url) => {
    var sheetDetails;
    const columns = document.querySelectorAll('.locations > div');
    if (!columns) {
      console.warn('No carousel data found while extracting sheet data.');
      return sheetDetails;
    }
    for (let i = 0; i < columns.length; i++) {
      try {
        const divs = columns[i].getElementsByTagName('div');
        const value = divs[0].textContent;
        const link = divs[1].getElementsByTagName('a')[0].href;
        const linkUrl = new URL(link);
        sheetDetails = {name: value, link: url.origin + linkUrl.pathname};
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
    if (sheetDataResponse[':type'] === 'multi-sheet') {
      for(let key in sheetDataResponse){
        if(sheetDataResponse[key].hasOwnProperty('data')){
          sheetDataResponse[key].data.forEach(asset => {
            asset.day = key;
            allExcelAssets.push(asset);
          });
        }
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

  const generateChannelHTML = async (url) => {
    const sheetDetails = extractSheetData(url) || []; //object containing name which is futile and the link to schedules.json
    // var breakfastHeading = document.createElement('h1');
    // const menuHeading = document.createAttribute('menuHeading');
    carouselContainer.setAttribute('menuHeading',sheetDetails.name);
    // carouselContainer.parentNode.insertBefore(breakfastHeading,carouselContainer);
    console.log(JSON.stringify(sheetDetails));
    if (!sheetDetails) {
      console.warn(`No sheet data available during HTML generation`);
    }
    const assets = [];
    let errorFlag = false;
    try {
        const sheetDataResponse = JSON.parse(await fetchData(sheetDetails.link)); //sheetdataresponse has the object in sodexo-schedules.json
        console.log(JSON.stringify(sheetDataResponse));
        // console.log(JSON.stringify(assetListLinks));
        if (!sheetDataResponse) {
          console.warn(`Invalid sheet Link ${JSON.stringify(sheetDetails)}`);
        }

        const sheetData = processSheetDataResponse(sheetDataResponse);
        for (let row = 0; row < sheetData.length; row++) { //iterating over each asset
          try {
            const assetDetails = sheetData[row]; //asset object
            assets.push({
              'menuItem': assetDetails['Menu Item'],
              'price': assetDetails['Price'],
              'day': assetDetails['day']
            });
          } catch (err) {
            console.warn(`Error while processing asset ${JSON.stringify(sheetData[row])}`, err);
          }
        }
      } catch (err) {
        errorFlag = true;
        console.warn(`Error while processing sheet ${JSON.stringify(sheetDetails)}`, err);
      }
    if (assets.length === 0 && errorFlag) {
      // Don't create HTML with no assets when there was an error
      console.log('Skipping HTML generation due to assets length zero along with error occurrence');
      return;
    }
    console.log(`Assets extracted for channel: ${JSON.stringify(assets)}`);
    await runCarousel(assets);
  };
  const header = document.getElementsByTagName('header');
  if (header && header[0]) {
    header[0].remove();
  }
  const main = document.getElementsByTagName('main')[0];
  main.style.opacity = 0;
  const carouselContainer = document.createElement('div');
  carouselContainer.id = 'carousel-container';
  main.parentNode.insertBefore(carouselContainer, main);
  const url = new URL(document.URL);
  await generateChannelHTML(url);
}
