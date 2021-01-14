let searchField = $("#searchField");
let searchBtn = $("#searchBtn");
let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=";
let APIKey = "8a765c5347e389c1aced234b02a046d5";


searchBtn.on("click", function (event) {
    event.preventDefault();
    let citySearch = searchField.val();
    if (citySearch === "") {
        return citySearch;
    } else {
        let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + citySearch + "&Appid=" + APIKey + "&units=imperial";
        console.log(citySearch);
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            //for loop
            console.log(response);
            $('#currentCity').html(response.name);
            $('#time').val(response.list[0].dt_text);
            $('#temp').val(response.list[0].main.temp).toFixed(1);
            $('#feelLike').val(response.list[0].main.feels_like);
            $('#weather').val(response.city.list[0].weather[0].description);
            $('#wind').val(response.list[0].wind.speed);
        });
    }
});

/////////////////////////////////////
//question about i
//is temp in fahrenheit?
