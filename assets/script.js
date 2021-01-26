//Calling document.ready to make sure JQuery works as expected
$(document).ready(function () {
  //Initializing variables
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
  let timeList = [];
  let currentCitySearch = "";
  //Loading saved parties from local storage if they exist, if none, setting puppyParties = to an empty array
  let puppyParties = JSON.parse(localStorage.getItem("puppyParties")) || [];
  //If there are saved parties, renders parties to the screen
  if (puppyParties.length > 0) {
    //Removes any parties with past dates from the screen
    puppyParties = puppyParties.filter(
      (party) => party.date >= Date.now() / 1000
    );
    // function begins process of rendering saved results
    preparedSavedResults();
  }
  //Calling the openweathermap API with the search term in the input field
  function getWeatherData(searchTerm) {
    $.ajax({
      url: `https://api.openweathermap.org/data/2.5/forecast?q=${searchTerm}&appid=${apiKey}`,
      method: "GET",
    })
      .then(function (response) {
        //Assigns current city and time zone from the API response
        currentCitySearch = response.city.name;
        timeZone = response.city.timezone / 3600;
        //Filtering potential time slots from response data
        let potentialTimeList = response.list;
        timeList = filterConditions(potentialTimeList);
        timeList = filterTimes(timeList);
        //Clearing the results field and displaying new results
        $("#results").empty();
        //If there are results, calls displayTimeInfo for each result
        if (timeList.length > 0) {
          // .map fuction sends each item in the array to the function displayTimeInfo
          timeList.map((time, index) => displayTimeInfo(time, index));
        } else {
          displayNoResults();
        }
      })

      .catch(function () {
        $("#searchField").val("");
      });
  }
  //Filter out any weather conditions that do not match the search criteria

  function filterConditions(conditions) {}

  function filterConditions(times) {
    //For each time, the .filter function returns values that align with the desired weather conditions set by the user
    times = times.filter(
      (time) =>
        convertTemp(time.main.temp) >= searchTerms.minTemp &&
        convertTemp(time.main.temp) >= 0
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
    //No, you cannot actually take you precious puppy out in a thunderstorm!
    times = times.filter((time) => time.weather[0].main !== "Thunderstorm");

    // Changes weather tag to Sun on days with clear weather
    times.forEach((time) => {
      if (time.weather[0].main === "Clear") {
        time.weather[0].main = "Sun";
      }
    });

    return times;
  }
  //Returns time-slots that match the time of day selected by the user
  function filterTimes(times) {
    let filteredTimes = [];
    for (let i = 0; i < times.length; i++) {
      //Looks at each individual result, compares time of day with selected time options
      //Then, gives object value corresponding to time of day
      //Adds object to array to be returned
      if (
        availableTimes.morning &&
        convertTimeToHour(times[i].dt) < 12 &&
        convertTimeToHour(times[i].dt) >= 9
      ) {
        times[i].timeOfDay = "Morning";
        filteredTimes.push(times[i]);
      }
      if (
        availableTimes.lunch &&
        convertTimeToHour(times[i].dt) >= 12 &&
        convertTimeToHour(times[i].dt) < 15
      ) {
        times[i].timeOfDay = "Lunch";
        filteredTimes.push(times[i]);
      }
      if (
        availableTimes.afternoon &&
        convertTimeToHour(times[i].dt) >= 15 &&
        convertTimeToHour(times[i].dt) < 18
      ) {
        times[i].timeOfDay = "Afternoon";
        filteredTimes.push(times[i]);
      }
      if (
        availableTimes.evening &&
        convertTimeToHour(times[i].dt) >= 18 &&
        convertTimeToHour(times[i].dt) < 21
      ) {
        times[i].timeOfDay = "Evening";
        filteredTimes.push(times[i]);
      }
    }
    //Sorts results into chronological order
    filteredTimes.sort((a, b) => a.dt - b.dt);
    return filteredTimes;
  }

  // converts unix time to an hour with adjustments for timezone
  function convertTimeToHour(dt) {
    return dayjs.unix(dt).hour() + timeZone;
  }

  // returns feedback if their search returns no results
  function displayNoResults() {
    $("#results").html(
      "<div class='row results'>There were no results matching your search, please try again!</div>"
    );
  }

  // converts temp from Kelvin to Fahrenheit
  function convertTemp(temp) {
    return Math.floor((temp - 273) * 1.8 + 32);
  }

  // This function displays search results
  function displayTimeInfo(time, index) {
    // This calls the gifphy api for images with puppys matching the weather conditions
    $.ajax({
      url:
        "https://api.giphy.com/v1/gifs/search?api_key=fZhobxIiFz471XOHLmXNOBjfo8xFJf5b&rating=g&q=cute+puppy+in+the+" +
        time.weather[0].main,
      method: "GET",
    }).then(function (response2) {
      // gives current object a key of gif with a value of a gif randomly selected from the response
      time.gif =
        response2.data[
          Math.floor(Math.random() * response2.data.length)
        ].images.fixed_height.url;
      // start assembling the individual display div
      let result = $("<div>").addClass("row results");
      // assembles element for the gif
      let gifHolder = $("<div>").addClass("col s4");
      let gif = $("<img>")
        .addClass("gif circle img-responsive search-img")
        .attr("src", time.gif)
        .attr("alt", "an adorable puppy");

      gifHolder.append(gif);
      // assembles 1st column of data
      let column1 = $("<div>").addClass("col s4 info");
      let currentCity = $("<p>")
        .addClass("currentCity")
        .text(currentCitySearch);
      let timeAndDate = $("<p>")
        .addClass("time")
        .text(dayjs.unix(time.dt).format("ddd, MMM D"));
      let timeOfDay = $("<p>").text(time.timeOfDay);
      let weatherDescription = $("<p>")
        .addClass("time")
        .text(time.weather[0].description);

      column1.append(currentCity, timeAndDate, timeOfDay, weatherDescription);
      // assembles second column of data
      let column2 = $("<div>").addClass("col s4 info");
      let temp = $("<p>")
        .addClass("temp")
        .text(`Temperature: ${convertTemp(time.main.temp)}`);
      let feelsLike = $("<p>")
        .addClass("feelsLike")
        .text(`Feels Like: ${convertTemp(time.main.feels_like)}`);
      $("<span>").html("&#176;F").appendTo(temp);
      $("<span>").html("&#176;F").appendTo(feelsLike);

      let wind = $("<p>")
        .addClass("wind")
        .text(`Wind Speed: ${time.wind.speed} m/s`);
      // creates a save button
      let saveButton = $("<button>")
        .attr("id", index)
        .addClass("save-button btn waves-effect waves-yellow")
        .text("save");
      column2.append(temp, feelsLike, wind, saveButton);
      // adds everything together and renders it to the display
      result.append(gifHolder, column1, column2);
      $("#results").append(result);
    });
  }

  function preparedSavedResults() {
    localStorage.setItem("puppyParties", JSON.stringify(puppyParties));
    $("#savedResults").empty();
    //Check if saved parties exist
    if (puppyParties.length > 0) {
      $("#savedResults").append(
        "<div class='savedResults smoosh row'><h3>Saved Parties</h3></div>"
      );
      // Update Display with current puppyParties
      puppyParties.map((party, index) => displaySavedResults(party, index));
    } else {
      // Indicate that no parties have been saved
      $("#savedResults").append(
        "<div class='savedResults smoosh'><p>You don’t have any puppy parties planned. Check the weather in your area to get the party started.</p></div>"
      );
    }
  }

  function displaySavedResults(party, index) {
    let result = $("<div>").addClass("row savedResults");
    // assembles element for the gif
    let gifHolder = $("<div>").addClass("col s4");
    let gif = $("<img>")
      .addClass("gif circle img-responsive save-img")
      .attr("src", party.gif)
      .attr("alt", "an adorable puppy");
    gifHolder.append(gif);
    // assembles 1st column of data
    let column1 = $("<div>").addClass("col s4");
    let currentCity = $("<p>").addClass("currentCity").text(party.city);
    let timeAndDate = $("<p>")
      .addClass("party")
      .text(dayjs.unix(party.date).format("ddd, MMM D"));
    let timeOfDay = $("<p>").text(party.timeOfDay);
    let weatherDescription = $("<p>").addClass("party").text(party.weather);
    column1.append(currentCity, timeAndDate, timeOfDay, weatherDescription);
    // assembles second column of data
    let column2 = $("<div>").addClass("col s4");
    let temp = $("<p>").addClass("temp").text(`Temperature: ${party.temp}`);
    let feelsLike = $("<p>")
      .addClass("feelsLike")
      .text(`Feels Like: ${party.feelsLike}`);
    $("<span>").html("&#176;F").appendTo(temp);
    $("<span>").html("&#176;F").appendTo(feelsLike);

    let wind = $("<p>").addClass("wind").text(`Wind Speed: ${party.wind} m/s`);
    // creates a delete button
    let deleteButton = $("<button>")
      .attr("key", index)
      .addClass("delete-button btn waves-effect waves-yellow")
      .text("X");
    column2.append(temp, feelsLike, wind, deleteButton);
    // adds everything together and renders it to the display
    result.append(column1, column2, gifHolder);
    $("#savedResults").append(result);
  }

  //Click event for user performing search
  $("#searchBtn").on("click", function (event) {
    event.preventDefault();
    //Set data for preferred weather conditions
    searchTerms = {
      minTemp: $("#min-temp").val().trim() || 0,
      isSun: $("#sun").prop("checked"),
      isClouds: $("#clouds").prop("checked"),
      isRain: $("#rain").prop("checked"),
      isSnow: $("#snow").prop("checked"),
      isWind: $("#wind").prop("checked"),
    };
    //Setting data for preferred time of day
    availableTimes = {
      morning: $("#morning").prop("checked"),
      lunch: $("#lunch").prop("checked"),
      afternoon: $("#afternoon").prop("checked"),
      evening: $("#evening").prop("checked"),
    };
    //Sets current city search to the value of the search field
    currentCitySearch = $("#searchField").val().trim();
    getWeatherData(currentCitySearch);
  });
  //Click event for saving party
  $("#results").on("click", function (event) {
    event.preventDefault();
    //Confirm that the user has clicked the save button
    if (event.target.id) {
      //Save needed data to object
      let newSavedItem = {
        city: currentCitySearch,
        date: timeList[event.target.id].dt,
        timeOfDay: timeList[event.target.id].timeOfDay,
        weather: timeList[event.target.id].weather[0].description,
        gif: timeList[event.target.id].gif,
        temp: convertTemp(timeList[event.target.id].main.temp),
        feelsLike: convertTemp(timeList[event.target.id].main.feels_like),
        wind: timeList[event.target.id].wind.speed,
      };
      //Check to make sure that we do not already have a party planned at that time
      let listIndex = puppyParties.findIndex(
        (party) => party.date === newSavedItem.date
      );
      //If no results are found, the list index will equal -1, and it will add to list of parties
      if (listIndex === -1) {
        puppyParties.push(newSavedItem);
      } else {
        console.log("You already have a party at that time!");
      }
      //Sorts puppy parties by soonest to latest date/time
      puppyParties.sort((a, b) => a.date - b.date);
      //Displays the saved results and saves to local storage
      preparedSavedResults();
    }
  });
  //Delete a party
  $("#savedResults").on("click", function (event) {
    event.preventDefault();
    //Make sure user is clicking delete button
    if ($(event.target).attr("key")) {
      //Remove matching item from array
      puppyParties.splice($(event.target).attr("key"), 1);
      preparedSavedResults();
    }
  });
});
