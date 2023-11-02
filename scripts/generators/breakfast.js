import scriptText from './breakfastResources/breakfastScript.js';
import fs from 'fs';
import fetch from 'node-fetch';
import { load } from 'cheerio';
import { outputFile } from 'fs-extra';
import FetchUtils from '@aem-screens/screens-offlineresources-generator/src/utils/fetchUtils.js';



export default class HtmlGenerator {

    static getFranklinMarkup = async (host, path) => {
        const resp = await FetchUtils.fetchDataWithMethod(host, path, 'GET');
        return await resp.text();
    }


    static processSheetDataResponse = (sheetDataResponse) => {
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

    static fetchData = async (url) => {
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

    static generateHTML = async (host, path) => {
        const franklinString = await HtmlGenerator.getFranklinMarkup(host, path);

        const sheetDetails = HtmlGenerator.extractSheetData(franklinString) || [];

        console.log("Inside generateHTML");

        const assets = [];
        let errorFlag = false;

        try {
            const sheetDataResponse = JSON.parse(await HtmlGenerator.fetchData(sheetDetails.link));
            if (!sheetDataResponse) {
                console.warn(`Invalid sheet Link ${JSON.stringify(sheetDetails)}`);
            }

            const sheetData = HtmlGenerator.processSheetDataResponse(sheetDataResponse);
            for (let row = 0; row < sheetData.length; row++) { //iterating over each asset
                try {
                    const assetDetails = sheetData[row]; //asset object
                    assets.push({
                        'menuItem': assetDetails['Menu Item'],
                        'price': assetDetails['Price'],
                        'calories': assetDetails['Calories'],
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
        const listUrl = '/content/screens/sodexo/sodexo-content/list-of-assets.json';
        const assetLinkListObjects = JSON.parse(await HtmlGenerator.fetchData(host + listUrl));
        console.log("listURL = " + listUrl);
        const staticAssetLinkLists = [];
        assetLinkListObjects.data.forEach(object => {
            staticAssetLinkLists.push(object.ItemLink);
        });
        const generatedHtml = HtmlGenerator.createLunchCarousel(assets, sheetDetails.name, assetLinkListObjects.data);

        outputFile(`${path}.html`, generatedHtml, (err) => {
            if (err) {
                console.error(err);
            }
        });
        console.log(`HTML saved at ${path}.html`);


        staticAssetLinkLists.push("/content/screens/sodexo/sodexo-content/background.png");//adding background image for manifest
        staticAssetLinkLists.push('/content/screens/assets/Breakfast/breakfast1.jpeg');
        staticAssetLinkLists.push('/content/screens/assets/Breakfast/breakfast2.jpeg');
        console.log("assetLists = " + staticAssetLinkLists);
        return staticAssetLinkLists;
    }
    static createCSS = () => {
        let cssText = '';
        try {
            const cssPath = `${process.cwd()}/blocks/breakfast/breakfast.css`;
            cssText = fs.readFileSync(cssPath, 'utf8');
        } catch (err) {
            console.error(err);
        }
        return cssText;
    };

    static createScript = (assets, menuName, staticAssetLinkLists) => {
        let scriptString = scriptText.toString();
        scriptString = scriptString.substring(scriptString.indexOf('{') + 1);
        scriptString = scriptString.slice(0, -1);
        const assetsJson = JSON.stringify(assets);
        const staticAssetsJson = JSON.stringify(staticAssetLinkLists);
        scriptString = `const menuHeadingText = "${menuName}"; const assetLinkLists = JSON.parse('${staticAssetsJson}'); const assets = JSON.parse('${assetsJson}');  ${scriptString}`;
        return scriptString;
    };

    static createLunchCarousel = (assetsList = [], menuName, staticAssetLinkLists) => {
        const scriptString = HtmlGenerator.createScript(assetsList, menuName, staticAssetLinkLists);
        const cssString = HtmlGenerator.createCSS();
        return `<html lang="en-US">
             <head>
               <title></title>
               <script type="module">${scriptString}</script>
               <style>${cssString}</style>
             </head>
             <body>
               <div id="carousel-container"></div>
             </body>
           </html>`;
    };


    static extractSheetData = (url) => {
        var sheetDetails = {};

        const $ = load(url);
        const container = $('.locations');
        if (!container || !container.children()) {
            console.warn('No carousel data found while extracting sheet data.');
            return sheetDetails;
        }
        let skipParentProcessing = true;
        try {
            container.find('div:first-child').each((index, element) => {
                try {
                    if (skipParentProcessing) {
                        skipParentProcessing = false;
                        return;
                    }
                    const name = $(element).text();
                    const link = $(element).next().text();
                    if (name && link) {
                        sheetDetails.name = name;
                        sheetDetails.link = link;
                    }
                } catch (err) {
                    console.warn(`Exception while processing row ${index}`, err);
                }
            });
        } catch (err) {
            console.warn('Exception while extracting sheet data', err);
        }
        return sheetDetails;
    };
}
