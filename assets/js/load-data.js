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
var latestTableData = [], areaChartListDate = [], chartList = [];

let deathsList = new Map(), confirmedList = new Map(), recoveredList = new Map(),
    countrySpecificConfirmed = new Map(), countrySpecificDeaths = new Map(), countrySpecificRecovered = new Map(),
    countrySpecificConfirmedCumulative = new Map(), countrySpecificDeathsCumulative = new Map(), globalCountryList = new Map(),
    globalCountryListCumulative = new Map();

var dailyInfections = 0, dailyDeaths = 0;

async function getData(url) {
    const response = await fetch(url);
    return response.json()
}

function initData(covid19Data) {
    var previousDayDeaths = 0, previousDayConfirmed = 0, previousDayRecovered = 0;

    Object.keys(covid19Data).forEach(function (k) {
        var mortalityRate = ((covid19Data[k][covid19Data[k].length - 1].deaths /
            covid19Data[k][covid19Data[k].length - 1].confirmed) * 100).toFixed(2) + "%";
        covid19Data[k][covid19Data[k].length - 1].country = k;
        covid19Data[k][covid19Data[k].length - 1].mortalityRate = mortalityRate;

        //  Build the selectPicker Dataset
        updateSelectPickers(k);
        // Get latest data
        latestTableData.push(covid19Data[k][covid19Data[k].length - 1]);

        // Get global death and infections
        covid19Data[k].forEach(function (country) {

            if (confirmedList.get(country.date) == null) {
                confirmedList.set(country.date, 0);
                deathsList.set(country.date, 0);
                recoveredList.set(country.date, 0);
            }

            confirmedList.set(country.date, confirmedList.get(country.date) + (country.confirmed - previousDayConfirmed));
            deathsList.set(country.date, deathsList.get(country.date) + (country.deaths - previousDayDeaths));
            recoveredList.set(country.date, recoveredList.get(country.date) + (country.recovered - previousDayRecovered));

            countrySpecificConfirmed.set(country.date, country.confirmed - previousDayConfirmed);
            countrySpecificDeaths.set(country.date, country.deaths - previousDayDeaths);
            countrySpecificRecovered.set(country.date, country.recovered - previousDayRecovered);

            countrySpecificConfirmedCumulative.set(country.date, country.confirmed);
            countrySpecificDeathsCumulative.set(country.date, country.deaths);

            previousDayDeaths = country.deaths;
            previousDayConfirmed = country.confirmed;
            previousDayRecovered = country.recovered;
        });

        globalCountryList.set(k, [countrySpecificConfirmed, countrySpecificDeaths, countrySpecificRecovered]);
        globalCountryListCumulative.set(k, [countrySpecificConfirmedCumulative, countrySpecificDeathsCumulative]);

        countrySpecificConfirmed = new Map(), countrySpecificDeaths = new Map(), countrySpecificRecovered = new Map(),
            countrySpecificConfirmedCumulative = new Map(), countrySpecificDeathsCumulative = new Map();
    });

    //  Format data for chart use.
    confirmedList.forEach(function (item, index) {
        areaChartListDate.push(index);
    });

    //  Refresh and set a default
    updateSelectPickersAndFooters();
}

function populateWorldChart() {
    setLinearStep("linearStep", areaChartListDate, confirmedList, deathsList, ['Confirmed', 'Deaths']);
}

function populateTableData() {
    setDataTableData(areaChartListDate[areaChartListDate.length - 1], latestTableData);
}

function populateChartsByCountry() {
    var selectedCountry = $("#countrySelectPicker option:selected").text();
    confirmedForCountry = globalCountryList.get(selectedCountry)[0],
        deathsForCountry = globalCountryList.get(selectedCountry)[1];
    setLinearStep("statsByCountry", areaChartListDate, confirmedForCountry, deathsForCountry, ['Confirmed', 'Deaths']);
}

function populateCumulativeChartsByCountry() {
    var selectedCountry = $("#countrySelectPicker option:selected").text();
    confirmedForCountry = globalCountryListCumulative.get(selectedCountry)[0],
        deathsForCountry = globalCountryListCumulative.get(selectedCountry)[1];
    setLinearStep("cumulativeStatsByCountry", areaChartListDate, confirmedForCountry, deathsForCountry, ['Confirmed', 'Deaths']);
}

function populateCompareCountryChart() {
    var selectedCountryA = $("#compareCountryAPicker option:selected").text();
    var selectedCountryB = $("#compareCountryBPicker option:selected").text();
    var selectedData = $("input[name='options']:checked").val();
    var countryDataA = globalCountryList.get(selectedCountryA)[selectedData],
        countryDataB = globalCountryList.get(selectedCountryB)[selectedData];
    setLinearStep("compareCountryDataChart", areaChartListDate, countryDataA, countryDataB, [selectedCountryA, selectedCountryB]);
}
function updateSelectPickers(k) {
    $('#countrySelectPicker').append('<option value="' + k + '">' + k + '</option>');
    $('#compareToCountrySelectPicker').append('<option value="' + k + '">' + k + '</option>');
    $('#compareCountryAPicker').append('<option value="' + k + '">' + k + '</option>');
    $('#compareCountryBPicker').append('<option value="' + k + '">' + k + '</option>');
}

function updateSelectPickersAndFooters() {
    $("#countrySelectPicker").val("US");
    $("#countrySelectPicker").selectpicker("refresh");

    $("#compareCountryAPicker").val("Italy");
    $("#compareCountryAPicker").selectpicker("refresh");
    $("#compareCountryBPicker").val("Spain");
    $("#compareCountryBPicker").selectpicker("refresh");

    $('#dailyChartsFooter').text('Updated: ' + areaChartListDate[areaChartListDate.length - 1]);
    $('#cumulativeChartsFooter').text('Updated: ' + areaChartListDate[areaChartListDate.length - 1]);
    $('#worldChartsFooter').text('Updated: ' + areaChartListDate[areaChartListDate.length - 1]);
    $('#dataTableFooter').text('Updated: ' + areaChartListDate[areaChartListDate.length - 1]);
}

async function main() {
    covid19Data = await getData("https://pomber.github.io/covid19/timeseries.json");

    initData(covid19Data);
    populateTableData()
    populateWorldChart();
    populateChartsByCountry();
    populateCumulativeChartsByCountry();
    populateCompareCountryChart();
}

main();