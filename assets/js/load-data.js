/*
 Copyright  (c) 2020 Athrael.net
 
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */
var latestTableData = [];

let deathsList = new Map(),
    confirmedList = new Map(),
    countrySpecificConfirmed = new Map(),
    countrySpecificDeaths = new Map(),
    countrySpecificConfirmedCumulative = new Map(),
    countrySpecificDeathsCumulative = new Map(),
    globalCountryList = new Map(),
    globalCountryListCumulative = new Map(),
    datesList = [];

var areaChartListDate = [];

var dailyInfections = 0,
    dailyDeaths = 0;


var chartList = [];

async function getData(url) {
    const response = await fetch(url);
    return response.json()
}

function initData(covid19Data) {
    var previousDayDeaths = 0, previousDayConfirmed = 0;
    Object.keys(covid19Data).forEach(function (k) {
        var mortalityRate = ((covid19Data[k][covid19Data[k].length - 1].deaths /
            covid19Data[k][covid19Data[k].length - 1].confirmed) * 100).toFixed(2) + "%";
        covid19Data[k][covid19Data[k].length - 1].country = k;
        covid19Data[k][covid19Data[k].length - 1].mortalityRate = mortalityRate;

        //  Build the selectPicker Dataset
        $('#countrySelectPicker').append('<option value="' + k + '">' + k + '</option>');

        // Get latest data
        latestTableData.push(covid19Data[k][covid19Data[k].length - 1]);

        // Get global death and infections
        covid19Data[k].forEach(function (y) {
            if (confirmedList.get(y.date) == null) {
                confirmedList.set(y.date, 0);
            }
            if (deathsList.get(y.date) == null) {
                deathsList.set(y.date, 0);
            }

            if (countrySpecificConfirmed.get(y.date) == null) {
                countrySpecificConfirmed.set(y.date, 0);
            }
            if (countrySpecificDeaths.get(y.date) == null) {
                countrySpecificDeaths.set(y.date, 0);
            }

            confirmedList.set(y.date, confirmedList.get(y.date) + (y.confirmed - previousDayConfirmed));
            deathsList.set(y.date, deathsList.get(y.date) + (y.deaths - previousDayDeaths));
            countrySpecificConfirmed.set(y.date, y.confirmed - previousDayConfirmed)
            countrySpecificDeaths.set(y.date, y.deaths - previousDayDeaths)

            countrySpecificConfirmedCumulative.set(y.date, y.confirmed)
            countrySpecificDeathsCumulative.set(y.date, y.deaths)

            previousDayDeaths = y.deaths;
            previousDayConfirmed = y.confirmed;
        });
        globalCountryList.set(k, [countrySpecificConfirmed, countrySpecificDeaths]);
        globalCountryListCumulative.set(k, [countrySpecificConfirmedCumulative, countrySpecificDeathsCumulative])
        countrySpecificConfirmed = new Map(),
            countrySpecificDeaths = new Map(),
            countrySpecificConfirmedCumulative = new Map(),
            countrySpecificDeathsCumulative = new Map();
    });

    //  Refresh and set a default
    $("#countrySelectPicker").val("US");
    $("#countrySelectPicker").selectpicker("refresh");

    //  Format data for chart use.
    confirmedList.forEach(function (item, index) {
        areaChartListDate.push(index);
    });

    $('#dailyChartsFooter').text('Updated: ' + areaChartListDate[areaChartListDate.length - 1]);
    $('#cumulativeChartsFooter').text('Updated: ' + areaChartListDate[areaChartListDate.length - 1]);
    $('#worldChartsFooter').text('Updated: ' + areaChartListDate[areaChartListDate.length - 1]);
    $('#dataTableFooter').text('Updated: ' + areaChartListDate[areaChartListDate.length - 1]);
}

function populateWorldChart() {
    setLinearStep("linearStep", areaChartListDate, confirmedList, deathsList);
}

function populateTableData() {
    setDataTableData(areaChartListDate[areaChartListDate.length - 1], latestTableData);
}

function populateChartsByCountry() {
    var selectedCountry = $("#countrySelectPicker option:selected").text();
    confirmedForCountry = globalCountryList.get(selectedCountry)[0],
        deathsForCountry = globalCountryList.get(selectedCountry)[1];
    setLinearStep("statsByCountry", areaChartListDate, confirmedForCountry, deathsForCountry);
}

function populateCumulativeStatsByCountry() {
    var selectedCountry = $("#countrySelectPicker option:selected").text();
    confirmedForCountry = globalCountryListCumulative.get(selectedCountry)[0],
        deathsForCountry = globalCountryListCumulative.get(selectedCountry)[1];
    setLinearStep("cumulativeStatsByCountry", areaChartListDate, confirmedForCountry, deathsForCountry);
}

function populateLatestNumbers() {
    //  TODO: Develop functionality
    setPieChart("latestNumbers", null, [100], [9]);
}

async function main() {
    covid19Data = await getData("https://pomber.github.io/covid19/timeseries.json");

    initData(covid19Data);
    populateTableData()
    populateWorldChart();
    populateChartsByCountry();
    populateCumulativeStatsByCountry();
    //populateLatestNumbers();
}

main();