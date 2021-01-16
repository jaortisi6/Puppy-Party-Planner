let searchField = $("#searchField");
let searchBtn = $("#searchBtn");
let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=";
let APIKey = "8a765c5347e389c1aced234b02a046d5";
let giphyAPIKey = "fZhobxIiFz471XOHLmXNOBjfo8xFJf5b";
let weather = $('#weather')

$(document).ready(function () {
   const apiKey = "9a0309c7af4ea96821317cd0a1f455e1";
   $("#searchBtn").on("click", function (event) {
     event.preventDefault();
     let isRain = $("#rain").prop("checked");
     let isSun = $("#sun").prop("checked");
     getWeatherData($("#searchField").val());
   });
   const getWeatherData = (searchTerm) => {
     $.ajax({
       url: `https://api.openweathermap.org/data/2.5/forecast?q=${searchTerm}&appid=${apiKey}`,
       method: "GET",
     })
       .then(function (response) {
         console.log(response);
         let potentialTimeList = response.list;
         let timeList = potentialTimeList.filter(
           (time) => time.weather[0].main !== "Clouds"
         );
         timeList.map((time) => console.log(time.weather[0].main));
         $.ajax({
           url:
             "https://api.giphy.com/v1/gifs/search?api_key=fZhobxIiFz471XOHLmXNOBjfo8xFJf5b&q=puppy+" +
             timeList[0].weather[0].main,
           method: "GET",
        }).then(function (response2) {
           console.log(response2);
         });
       })
       .catch(function () {
         $("#searchField").val("TRY AGAIN, DUDE!");
       });
  };
 });

 
/////////////////////////////////////
//question about i
//is temp in fahrenheit?

// $(document).ready(function () {
//    const apiKey = "9a0309c7af4ea96821317cd0a1f455e1";
//    $("#searchBtn").on("click", function (event) {
//      event.preventDefault();
//      let isRain = $("#rain").prop("checked");
//      let isSun = $("#sun").prop("checked");
//      getWeatherData($("#searchField").val());
//    });
//    const getWeatherData = (searchTerm) => {
//      $.ajax({
//        url: `https://api.openweathermap.org/data/2.5/forecast?q=${searchTerm}&appid=${apiKey}`,
//        method: "GET",
//      })
//        .then(function (response) {
//          console.log(response);
//          let potentialTimeList = response.list;
//          let timeList = potentialTimeList.filter(
//            (time) => time.weather[0].main !== "Clouds"
//          );
//          timeList.map((time) => console.log(time.weather[0].main));
//          $.ajax({
//            url:
//              "https://api.giphy.com/v1/gifs/search?api_key=fZhobxIiFz471XOHLmXNOBjfo8xFJf5b&q=puppy+" +
//              timeList[0].weather[0].main,
//            method: "GET",
//         }).then(function (response2) {
//            console.log(response2);
//          });
//        })
//        .catch(function () {
//          $("#searchField").val("TRY AGAIN, DUDE!");
//        });
//   };
//  });