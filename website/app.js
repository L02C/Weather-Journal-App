/* global variables */
// personal API Key for OpenWeatherMap API
const keyAPI = '65074e42b1b563b0a35e13cfcb35d33f&units=imperial';
const baseURL = 'https://api.openweathermap.org/data/2.5/weather?zip=';
// full URLto access weather by zip exmaple for reference:
// https://api.openweathermap.org/data/2.5/weather?zip={zip code},{countrycode code}&appid={API key}

// create a new date instance dynamically with JS
let d = new Date();
let newDate = d.getMonth()+'.'+ d.getDate()+'.'+ d.getFullYear();

// adding event listener to the generate button
const generatebutton = document.getElementById("generate");
generatebutton.addEventListener("click", generate);


// async function to get data from OpenWeatherMap API
async function getweather(baseURL, zip, countrycode, keyAPI) {
    try {
      const res = await fetch(`${baseURL}${zip},${countrycode}&appid=${keyAPI}`);
      const entrydata = await res.json();
      if (entrydata.cod == 200) { // 200 is the cod code when weather data was successfully retrieved
        console.log('data obtained from API:', entrydata);
        return(entrydata);
      } else { // if data wasn't succesfully retrived:
        const noresult = entrydata.message;
        console.log('reason for no weather from API:', noresult); // the API shows a message why if weather couldn't be retrieved, log it
        return(noresult);
        };
  } catch (error) {
    console.log("error getting data from API", error);
  }
};

// async generate function to call getweather and updateUI functions
async function generate(event) {
  event.preventDefault();
  console.log('BUTTON CLICKED');
  const zip = document.getElementById("zip").value;
  const countrycode = document.getElementById("countrycode").value;
  getweather(baseURL, zip, countrycode, keyAPI)
  .then((entrydata) => { // once data was retrieved from API, populate newentry with relevant information:
    if (entrydata.cod == 200) {
      const feelings = document.getElementById("feelings").value;
      newentry = {
        date: newDate,
        temp: entrydata.main.temp,
        feelings: feelings
      }
      console.log('relevant data:', newentry);
      postData('/add', newentry)
        .then(updateUI(newentry)); // after data has been added to endpoint, update the UI
    } else {
        newentry = {
          APImessage: entrydata // newentry will contain the message the API provided as to why the weather couldn't be retrieved
        }
        console.log('relevant data:',newentry);
        postData('/add', newentry)
        .then (updateUI(newentry));
      }
  });
};



// POST request to add the API data and user-entered data to endpoint
const postData = async ( url = '/add', data = newentry)=> {
    console.log('posting data to endpoint:', data);
      const res = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
          'Content-Type': 'application/json',
      },
     // Body data type must match "Content-Type" header
      body: JSON.stringify(data),
    });
      try {
        const newData = await res.json();
        return newData;
      } catch(error) {
        console.log("error adding entry to endpoint:", error);
      }
};


// async function to GET project data from endpoint and update UI
const updateUI = async () => {
 const req = await fetch('/all');
 try {
 // Transform into JSON
 const entrydata = await req.json()
 console.log('retrieveing data from endpoint:', entrydata);
 // Write updated data to DOM elements
   if ('temp' in entrydata) { // if the data contains 'temp', that means weather has been retrieved, can update all divs
   console.log('Updating UI with API data..');
   document.getElementById('date').innerHTML = 'Date: ' + entrydata.date;
   document.getElementById('content').innerHTML = 'Feelings: ' + entrydata.feelings;
   document.getElementById('temp').innerHTML = 'Temp: ' + Math.round(entrydata.temp) + ' degrees';
  } else { // data's content is a message from the API
    console.log('Updating UI with API message...');
    document.getElementById('date').innerHTML = entrydata.APImessage; // display the message in first child div
    // clear other divs:
    document.getElementById('content').innerHTML = '';
    document.getElementById('temp').innerHTML = '';
  }
}
 catch(error) {
   console.log('error updating UI:', error);
   // appropriately handle the error
 }
};
