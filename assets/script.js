$(document).ready(function () {
  const apiKey = "9a0309c7af4ea96821317cd0a1f455e1";
  let searchTerms = {
    minTemp: 0,
    isSun: true,
    isClouds: true,
    isRain: false,
    isWind: false,
    isSnow: false,
  };

  let availableTimes = {
    morning: true,
    lunch: true,
    afternoon: true,
    evening: true,
  };

  let timeZone = 0;

  $("#searchBtn").on("click", function (event) {
    event.preventDefault();

    searchTerms = {
      minTemp: $("#min-temp").val().trim() || 0,
      isSun: $("#sun").prop("checked"),
      isClouds: $("#clouds").prop("checked"),
      isRain: $("#rain").prop("checked"),
      isSnow: $("#snow").prop("checked"),
      isWind: $("#wind").prop("checked"),
    };

    availableTimes = {
      morning: $("#morning").prop("checked"),
      lunch: $("#lunch").prop("checked"),
      afternoon: $("#afternoon").prop("checked"),
      evening: $("#evening").prop("checked"),
    };

    getWeatherData($("#searchField").val().trim());
  });

  const getWeatherData = (searchTerm) => {
    $.ajax({
      url: `https://api.openweathermap.org/data/2.5/forecast?q=${searchTerm}&appid=${apiKey}`,
      method: "GET",
    })
      .then(function (response) {
        console.log(response);
        timeZone = response.city.timezone / 3600;
        let potentialTimeList = response.list;
        let timeList = filterConditions(potentialTimeList);
        timeList = filterTimes(timeList);
        console.log(timeList);
        $("#results").empty();
        if (timeList.length > 0) {
          timeList.map((time, index) => displayTimeInfo(time, index));
        } else {
          displayNoResults();
        }
      })

      .catch(function () {
        $("#searchField").val("Enter a city");
      });
  };

  function filterConditions(times) {
    times = times.filter(
      (time) => convertTemp(time.main.temp) >= searchTerms.minTemp
    );
    if (!searchTerms.isSun) {
      times = times.filter((time) => time.weather[0].main !== "Clear");
    }
    if (!searchTerms.isClouds) {
      times = times.filter((time) => time.weather[0].main !== "Clouds");
    }
    if (!searchTerms.isWind) {
      times = times.filter((time) => time.wind.speed <= 10);
    }
    if (!searchTerms.isRain) {
      times = times.filter((time) => time.weather[0].main !== "Rain");
    }

    if (!searchTerms.isSnow) {
      times = times.filter((time) => time.weather[0].main !== "Snow");
    }
    times = times.filter((time) => time.weather[0].main !== "Thunderstorm");

    return times;
  }

  function filterTimes(times) {
    let filteredTimes = [];
    for (let i = 0; i < times.length; i++) {
      if (
        availableTimes.morning &&
        convertTimeToHour(times[i].dt) < 12 &&
        convertTimeToHour(times[i]) >= 9
      ) {
        times[i].timeslot = "Morning";
        filteredTimes.push(times[i]);
      }
      if (
        availableTimes.lunch &&
        convertTimeToHour(times[i].dt) >= 12 &&
        convertTimeToHour(times[i].dt) < 15
      ) {
        times[i].timeslot = "Lunch";
        filteredTimes.push(times[i]);
      }
      if (
        availableTimes.afternoon &&
        convertTimeToHour(times[i].dt) >= 15 &&
        convertTimeToHour(times[i].dt) < 18
      ) {
        times[i].timeslot = "Afternoon";
        filteredTimes.push(times[i]);
      }
      if (
        availableTimes.evening &&
        convertTimeToHour(times[i].dt) >= 18 &&
        convertTimeToHour(times[i].dt) < 21
      ) {
        times[i].timeslot = "Evening";
        filteredTimes.push(times[i]);
      }
    }
    return filteredTimes;
  }

  function displayTimeInfo(time, index) {
    $.ajax({
      url:
        "https://api.giphy.com/v1/gifs/search?api_key=fZhobxIiFz471XOHLmXNOBjfo8xFJf5b&q=puppy+" +
        time.weather[0].main,
      method: "GET",
    }).then(function (response2) {
      // assigns currentGif a random gif from the response data array.
      let currentGif =
        response2.data[Math.floor(Math.random() * response2.data.length)].images
          .fixed_height_small.url;
      let result = $("<div>").addClass("row results").attr("id", index);
      // assembles element for the gif
      let gifHolder = $("<div>").addClass("col s4 blue");
      let gif = $("<img>")
        .addClass("gif circle")
        .attr("src", currentGif)
        .attr("id", `gif${index}`);
      gifHolder.append(gif);
      //assembles 1st column of data
      let column1 = $("<div>").addClass("col info");
      let currentCity = $("<p>")
        .addClass("currentCity")
        .attr("id", `city${index}`)
        .text($("#searchField").val().trim());
      let timeAndDate = $("<p>")
        .addClass("time")
        .attr("id", `time${index}`)
        .text(time.dt_txt);
      let weatherDescription = $("<p>")
        .addClass("time")
        .text(time.weather[0].description)
        .attr("id", `weather${index}`);
      column1.append(currentCity, timeAndDate, weatherDescription);
      //assembles secnod column of data
      let column2 = $("<div>").addClass("col info");
      let temp = $("<p>")
        .addClass("temp")
        .attr("id", `temp${index}`)
        .text(convertTemp(time.main.temp));
      let feelsLike = $("<p>")
        .addClass("feelsLike")
        .attr("id", `feelsLike${index}`)
        .text(convertTemp(time.main.feels_like));
      column2.append(temp, feelsLike);
      // adds everything together and renders it to the display
      result.append(gifHolder, column1, column2);
      $("#results").append(result);
    });
  }

  function convertTimeToHour(dt) {
    return dayjs.unix(dt).hour() + timeZone;
  }

  function displayNoResults() {
    $("#results").html(
      "there were no results matching your search, please try"
    );
  }

  function convertTemp(temp) {
    return Math.floor((temp - 273) * 1.8 + 32);
  }
});
