// GOAL: Your boss wants to understand the average runtime of movies by release year.

/**
 * Your boss wants to understand the average runtime of movies by release year.
 */
function filterData(data) {
    let year_dict = {};
    for (let i = 0; i < data.length; i++) {
        if (data['type'] === "movie") {
            const row = data[i];
            const ugly_year = row['release_year'];
            const year = parseInt(ugly_year, 10);
            const duration = row['duration'];
            if (year in year_dict) {
                year_dict[year].push(duration);
            } else {
                year_dict[year] = [duration];
            }
        }
    }
    let return_list = [];
    for (let year in year_dict) {
        let durations = year_dict[year]
        let sum = 0;
        for (let i = 0; i < durations.length; i++) {
            sum += durations[i]
        }
        let average = sum / durations.length
        return_list.push({"year": year, "duration": average})
    }
    return return_list;
}
