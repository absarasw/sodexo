import scriptText from './lunchResources/lunchScript.js';
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

    static isGMT = (timezone) => {
        return timezone && timezone.toLowerCase() === 'gmt';
    }

    static processSheetDataResponse = (sheetDataResponse) => {
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
        const additionalAssets = [];
        const franklinString = await HtmlGenerator.getFranklinMarkup(host, path);
        const $ = load(franklinString);
        const sheetDetailsList = HtmlGenerator.extractSheetData($) || [];

        console.log("Inside generateHTML");

        const assetsList = new Map();
        let errorFlag = false;
        for(let i = 0; i < sheetDetailsList.length; i++) {
            try {
                const sheetDetails = sheetDetailsList[i];
                if (!sheetDetails) {
                    console.warn(`No sheet data available during HTML generation`);
                }
                const sheetDataResponse = JSON.parse(await HtmlGenerator.fetchData(sheetDetails.link));

                const imgUrl = new URL(sheetDetails.menuimage);

                additionalAssets.push(imgUrl.pathname);
                if (!sheetDataResponse) {
                    console.warn(`Invalid sheet Link ${JSON.stringify(sheetDetails)}`);
                }

                const sheetData = HtmlGenerator.processSheetDataResponse(sheetDataResponse);
                const assets = [];
                for (let row = 0; row < sheetData.length; row++) { //iterating over each asset
                    try {
                        const assetDetails = sheetData[row]; //asset object
                        assets.push({
                            'menuItem': assetDetails['Menu Item'],
                            'calories': assetDetails['Calories']
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

        if (additionalAssets.length === 0 && errorFlag) {
            // Don't create HTML with no assets when there was an error
            console.log('Skipping HTML generation due to assets length zero along with error occurrence');
            return;
        }

        const startTime = $('meta[name="start-time"]').attr('content');
        const endTime = $('meta[name="end-time"]').attr('content');


        const generatedHtml = HtmlGenerator.createLunchCarousel(assetsList, startTime, endTime);

        outputFile(`${path}.html`, generatedHtml, (err) => {
            if (err) {
                console.error(err);
            }
        });
        console.log(`HTML saved at ${path}.html`);

        additionalAssets.push("/content/screens/sodexo/sodexo-content/background.png"); //adding background image for manifest
        return additionalAssets;
    }
    static createCSS = () => {
        let cssText = '';
        try {
            const cssPath = `${process.cwd()}/blocks/lunch/lunch.css`;
            cssText = fs.readFileSync(cssPath, 'utf8');
        } catch (err) {
            console.error(err);
        }
        return cssText;
    };

    static createScript = (assetsList, startTime, endTime) => {
        let scriptString = scriptText.toString();
        scriptString = scriptString.substring(scriptString.indexOf('{') + 1);
        scriptString = scriptString.slice(0, -1);
        console.log('assetsList = ' + assetsList);
        const assetsJson = JSON.stringify(Array.from(assetsList.entries()));
        scriptString = `const assetsList = new Map(JSON.parse('${assetsJson}')) ; const startTime = \'${startTime}\'; const endTime = \'${endTime}\'; ${scriptString}`;
        //console.log("Create Script = " + scriptString);
        return scriptString;
    };

    static createLunchCarousel = (assetsList = [], startTime, endTime) => {
        const scriptString = HtmlGenerator.createScript(assetsList, startTime, endTime);
        const cssString = HtmlGenerator.createCSS();
        return `<html lang="en-US">
             <head>
               <title></title>
               <script type="module">${scriptString}</script>
               <style>${cssString}</style>
             </head>
             <body>
             <main>
             </main>
             </body>
           </html>`;
    };


    static getDayOfWeek = () => {
        var currentTime = new Date();

        var currentOffset = currentTime.getTimezoneOffset();

        var ISTOffset = 330;   // IST offset UTC +5:30

        var ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);

        const dayOfWeekNumber = ISTTime.getDay();
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

    static extractSheetData = ($) => {
        var sheetDetails = [];

        const container = $('.locations');
        if (!container || !container.children()) {
            console.warn('No carousel data found while extracting sheet data.');
            return sheetDetails;
        }
        let skipParentProcessing = true;

        const dayOfWeek = HtmlGenerator.getDayOfWeek();
        try {
            container.find('div:first-child').each((index, element) => {
                try {
                    if (skipParentProcessing) {
                        skipParentProcessing = false;
                        return;
                    }
                    const name = $(element).text();

                    const link = $(element).next().find('p:first-child').text();
                    const imgLink = $(element).next().find('p:nth-child(2)').text();

                    if (name && link && imgLink) {
                        const sheetDetailsEntry = {name: name, link: link + "?sheet=" + dayOfWeek, menuimage: imgLink}
                        sheetDetails.push(sheetDetailsEntry);
                    }
                } catch (err) {
                    console.warn(`Exception while processing row ${index}`, err);
                }
            });
        } catch (err) {
            console.warn('Exception while extracting sheet data', err);
        }

        return sheetDetails; //now it is returning an object sheet details which has the name of the sheet which I make futile and the link to the schedules.json
    };
}
