const { Builder, Browser, By, until } = require('selenium-webdriver');

module.exports = {
    exportEntireTimeTables: async function (urls) {
        var peopleTimeTables = [];
        const chrome = require('selenium-webdriver/chrome');
        const options = new chrome.Options();
        options.addArguments('--no-sandbox');
        options.addArguments('--headless');
        options.addArguments('window-size=1920x1080')
        options.addArguments('user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36');

        let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

        try {
            for (var i = 0; i < urls.length; i++) {
                if (urls[i] != '')
                    peopleTimeTables.push(await this.exportTimeTabe(driver, urls[i]));
            }
        } finally {
            await driver.quit();
        }
        // console.log("exportEntire");
        // console.log(peopleTimeTables);
        return peopleTimeTables;
    },

    exportTimeTabe: async function (driver, url) {
        var colsIndex = 0;
        var hIndex = 0;
        var tIndex = 0;
        var gridIndex = 0;

        var temp = 0;

        var height = 0;
        var top = 0;

        var cols_array = [];
        var girds_array = [];
        var height_array = [];
        var top_array = [];
        var height_index_array = [];
        var top_index_array = [];

        await driver.get(url);
        const pageSource = await driver.wait(until.elementLocated(By.css('body')), 1000).getAttribute('innerHTML');

        // className 이 cols와 grids 인 tag의 index 구해서 array에 저장
        while (1) {
            colsIndex = pageSource.indexOf("class=\"cols\"", (colsIndex + 1));
            if (colsIndex == -1) break;
            cols_array.push(colsIndex);
            gridIndex = pageSource.indexOf("class=\"grids\"", (colsIndex + 1));
            girds_array.push(gridIndex);
        }
        // 'height:' 인 index 찾고, value도 저장
        while (1) {
            hIndex = pageSource.indexOf("height:", (hIndex + 1));
            if (hIndex == -1) break;
            height_index_array.push(hIndex);
            if (hIndex < cols_array[0]) continue;
            else {
                temp = pageSource.indexOf(';', (hIndex + 1));
                height = pageSource.slice(hIndex + 7, temp - 2);
                height_array.push(height);
            }
        }
        // 'top:' 인 index 찾고, value도 저장
        while (1) {
            tIndex = pageSource.indexOf("top:", (tIndex + 1));
            if (tIndex == -1) break;
            top_index_array.push(tIndex);
            if (tIndex < cols_array[0]) continue;
            else {
                temp = pageSource.indexOf(';', (tIndex + 1));
                top = pageSource.slice(tIndex + 4, temp - 2);
                top_array.push(top);
            }
        }

        // console.log("height");
        // console.log(height_array);
        // console.log("top");
        // console.log(top_array);

        var mon_object = [];
        var tues_object = [];
        var wed_object = [];
        var thu_object = [];
        var fri_object = [];

        let bottom;
        for (var i = 1; i < height_index_array.length; i++) {
            bottom = 0;
            if ((height_index_array[i] > cols_array[0]) && (height_index_array[i] < girds_array[0])) {
                bottom = parseInt(top_array[i - 1]) + parseInt(height_array[i - 1]);
                mon_object.push({ top: parseInt(top_array[i - 1]), bottom: bottom });
            }
            else if ((height_index_array[i] > cols_array[1]) && (height_index_array[i] < girds_array[1])) {
                bottom = parseInt(top_array[i - 1]) + parseInt(height_array[i - 1]);
                tues_object.push({ top: parseInt(top_array[i - 1]), bottom: bottom });
            }
            else if ((height_index_array[i] > cols_array[2]) && (height_index_array[i] < girds_array[2])) {
                bottom = parseInt(top_array[i - 1]) + parseInt(height_array[i - 1]);
                wed_object.push({ top: parseInt(top_array[i - 1]), bottom: bottom });
            }
            else if ((height_index_array[i] > cols_array[3]) && (height_index_array[i] < girds_array[3])) {
                bottom = parseInt(top_array[i - 1]) + parseInt(height_array[i - 1]);
                thu_object.push({ top: parseInt(top_array[i - 1]), bottom: bottom });
            }
            else if ((height_index_array[i] > cols_array[4]) && (height_index_array[i] < girds_array[4])) {
                bottom = parseInt(top_array[i - 1]) + parseInt(height_array[i - 1]);
                fri_object.push({ top: parseInt(top_array[i - 1]), bottom: bottom });
            }
        }
        var timetable = {
            'Mon': mon_object,
            'Tue': tues_object,
            'Wed': wed_object,
            'Thu': thu_object,
            'Fri': fri_object
        }
        // console.log(timetable);

        return timetable;
    },

    sumTimeTables: function (peopleTimeTables) {

        // console.log('peopleTimeTables');
        // console.log(peopleTimeTables);
        var sum_mon_table = [];
        var sum_tue_table = [];
        var sum_wed_table = [];
        var sum_thu_table = [];
        var sum_fri_table = [];

        for (let table of peopleTimeTables) {
            sum_mon_table = [...sum_mon_table, ...table.Mon];
            sum_tue_table = [...sum_tue_table, ...table.Tue];
            sum_wed_table = [...sum_wed_table, ...table.Wed];
            sum_thu_table = [...sum_thu_table, ...table.Thu];
            sum_fri_table = [...sum_fri_table, ...table.Fri];
        }

        // console.log("sumtables");
        // console.log(sum_mon_table);
        // console.log(sum_tue_table);
        // console.log(sum_wed_table);
        // console.log(sum_thu_table);
        // console.log(sum_fri_table);

        var entireTimeTables = {
            'Mon': sum_mon_table,
            'Tue': sum_tue_table,
            'Wed': sum_wed_table,
            'Thu': sum_thu_table,
            'Fri': sum_fri_table
        }

        // console.log("entire");
        // console.log(entireTimeTables);

        return entireTimeTables;

    },

    chooseEntireEmpty: async function (entireTimeTables) {
        // console.log(entireTimeTables);
        var empty_mon_table = await this.findEmptyTime(this.sort_set(entireTimeTables['Mon']));
        var empty_tue_table = await this.findEmptyTime(this.sort_set(entireTimeTables['Tue']));
        var empty_wed_table = await this.findEmptyTime(this.sort_set(entireTimeTables['Wed']));
        var empty_thu_table = await this.findEmptyTime(this.sort_set(entireTimeTables['Thu']));
        var empty_fri_table = await this.findEmptyTime(this.sort_set(entireTimeTables['Fri']));

        var entireEmptyTimeTables = {
            'Mon': empty_mon_table,
            'Tue': empty_tue_table,
            'Wed': empty_wed_table,
            'Thu': empty_thu_table,
            'Fri': empty_fri_table
        };
        return entireEmptyTimeTables;
    },

    chooseEmpty: async function (new_set) {

        var start = 0;
        var finish = 1440;
        // var finish = 1200;

        var emptyTime = [];

        var curr_s = 0;
        var curr_f = 0;
        // var prev_s = 0;3
        var prev_f = 0;

        for (var i = 0; i < new_set.length; i++) {

            curr_s = new_set[i]['top'];
            curr_f = new_set[i]['bottom'];

            if (i == 0) {
                if (start != curr_s) {
                    var temp_set = { top: 0, bottom: curr_s };
                    emptyTime.push(temp_set);
                }
                prev_f = curr_f;
            }
            else {
                if (curr_s < prev_f) continue;
                else {
                    if (prev_f != curr_s) {
                        var temp_set = { top: prev_f, bottom: curr_s };
                        emptyTime.push(temp_set);
                    }
                    prev_f = curr_f;
                }
            }

        }

        if (prev_f < finish) {
            var temp_set = { top: prev_f, bottom: finish };
            emptyTime.push(temp_set);
        }

        return emptyTime
    },

    sort_set: function (set) {
        set.sort(function (a, b) {
            if (a['top'] == b['top']) {
                return b['bottom'] - a['bottom'];

            } else {
                return a['top'] - b['top'];
            }
        })

        return set;
    },

    findEmptyTime: async function (arr) {
        var empty = await this.chooseEmpty(arr);
        empty = await this.fixEmpty(empty);

        return empty;
    },

    fixEmpty: async function (emptyTime) {

        var bobgoTime = [];
        for (let time of emptyTime) {
            if (time['bottom'] - time['top'] >= 60) {
                bobgoTime.push(time);
            }
        }

        return bobgoTime;
    },

    // pixelToTime_entire: function (emptyTime_obj) {

    //     return emptyTime;
    // },

    // pixelToTime_day: async function (emptyTime_arr) {

    // }

}