const fetch = require("node-fetch");
const inquirer = require("inquirer");
const currentYear = new Date().getFullYear();
const reduceMethod = true; //   this is used to execute 2.1.2 - Using reduce.
//   to execute 2.1.1 - Recursive toggle the value to false

if (process.argv.length >= 3) {
  const n = Number(process.argv.slice(2));
  if (n) {
    console.log("thank you");
  } else {
    console.log("please try again using a digit");
  }
  sendRequest().then(function (data) {
    const people = data.result.people;
    switch (n) {
      //average age of all the people currently alive for a specific occupation
      case 1:
        let specificOccupation = "";
        var questions = [
          {
            type: "input",
            name: "occupation",
            message:
              "which occupation? enter 1 for farming, 2 for fishing, 3 for trading",
          },
        ];
        inquirer
          .prompt(questions)
          .then((answers) => {
            if (answers["occupation"] == 1) {
              specificOccupation = "farming";
            } else if (answers["occupation"] == 2) {
              specificOccupation = "fishing";
            } else if (answers["occupation"] == 3) {
              specificOccupation = "trading";
            }
            let counter = 0;
            let ageArray = [];
            for (let index = 0; index < people.length; index++) {
              const person = people[index];
              if (
                person.occupation == specificOccupation &&
                person.deathYear == undefined
              ) {
                counter++;
                ageArray.push(currentYear - person.birthYear);
              }
            }
            const reducer = (accumulator, currentValue) =>
              accumulator + currentValue;
            // the line below is what makes the code use either recursion of reduce
            let averagAgeOfAllThePeopleAlive = reduceMethod
              ? ageArray.reduce(reducer) / counter
              : recursion(ageArray, counter);
            console.log("     ");
            console.log(
              `average age of all the people currently alive in ${specificOccupation} is ${Math.round(
                averagAgeOfAllThePeopleAlive
              )}`
            );
            console.log("     ");
          })
          .catch((error) => {
            console.error(error);
            if (error.isTtyError) {
              // Prompt couldn't be rendered in the current environment
              console.error("current environment does not allow for prompts");
            }
          });
        break;
      //people current alive ordered by age
      case 2:
        let livingAgeMap = new Map();
        for (let index = 0; index < people.length; index++) {
          const person = people[index];
          if (person.deathYear == undefined) {
            let age = currentYear - person.birthYear;
            livingAgeMap.set(age, person.name);
          }
        }
        mapSort(livingAgeMap);

        for (let [key, value] of livingAgeMap.entries()) {
          console.log(` the age of ${value} is ${key}`);
        }

        break;
      //average life expectancy per occupation
      case 3:
        let farmingArray = [];
        let tradingArray = [];
        let fishingArray = [];
        let farmingCounter = 0;
        let tradingCounter = 0;
        let fishingCounter = 0;
        let farmingExpectancy = 0;
        let tradingExpectancy = 0;
        let fishingExpectancy = 0;

        for (let index = 0; index < people.length; index++) {
          const person = people[index];

          if (person.deathYear != undefined) {
            switch (person.occupation) {
              case "farming":
                farmingCounter++;
                farmingArray.push(person.deathYear - person.birthYear);
                break;
              case "trading":
                tradingCounter++;
                tradingArray.push(person.deathYear - person.birthYear);
                break;
              case "fishing":
                fishingCounter++;
                fishingArray.push(person.deathYear - person.birthYear);
                break;
            }
          } else {
          }
        }
        const reducer = (accumulator, currentValue) =>
          accumulator + currentValue;
        farmingExpectancy = Math.round(
          farmingArray.reduce(reducer) / farmingCounter
        );
        tradingExpectancy = Math.round(
          tradingArray.reduce(reducer) / tradingCounter
        );
        fishingExpectancy = Math.round(
          fishingArray.reduce(reducer) / fishingCounter
        );
        console.log("     ");
        console.log(`fishing ${fishingExpectancy} years`);
        console.log(`farming ${farmingExpectancy} years`);
        console.log(`trading ${tradingExpectancy} years`);
        console.log("     ");
        break;
      //year with the most people alive
      case 4:
        let counters = new Map();
        const startYear = 1900;
        const endYear = 2020;
        let yearWithMostPeopleAlive = startYear; // initialing variable with first year of the study period
        for (let index = startYear; index <= endYear; index++) {
          // iterating through all years of study period
          let counter = 0;
          for (let j = 0; j < people.length; j++) {
            const person = people[j];
            if (person.deathYear != undefined) {
              if (person.birthYear <= index && person.deathYear >= index) {
                //person was alive on index year
                counter++;
              }
            } else {
              if (person.birthYear <= index) {
                //person was/ is alive on index year
                counter++;
              }
            }

            counters.set(index, counter);
          }
          mapSort(counters);
          yearWithMostPeopleAlive =
            counter > counters.get(counters.size - 1)
              ? index
              : yearWithMostPeopleAlive;
        }
        console.log("     ");
        console.log(
          `The year with most people alive has been ${yearWithMostPeopleAlive} with ${
            counters.size - 1
          } people alive`
        );
        console.log("     ");
        break;
      //person(s) who has(have) lived the longest
      case 5:
        let yearsLivedMap = new Map();
        for (let index = 0; index < people.length; index++) {
          const person = people[index];
          let yearsLived = 0;
          yearsLived =
            person.deathYear != undefined
              ? person.deathYear - person.birthYear
              : currentYear - person.birthYear;
          yearsLivedMap.set(yearsLived, person.name);
        }
        mapSort(yearsLivedMap);
        console.log("     ");
        console.log(
          `The person who has lived the longest has been ${yearsLivedMap.get(
            yearsLivedMap.size - 1
          )} `
        );
        console.log("     ");
        break;
    }
  });
} else {
  console.log(
    "please enter node server followed by a digit argument from 1 to 5:"
  );
  console.log(
    "     1: average age of all the people currently alive for a specific occupation"
  );
  console.log("     2: people current alive ordered by age");
  console.log("     3: average life expectancy per occupation");
  console.log("     4: year with the most people alive");
  console.log("     5: person(s) who has(have) lived the longest");
  console.log("     ");
}
async function sendRequest() {
  return new Promise(async (resolve, reject) => {
    try {
      const apiUrl =
        "https://leaf-assessments.vercel.app/api/towns/fort-joy/people";
      const response = await fetch(apiUrl);
      const json = response.json();
      resolve(json);
    } catch (error) {
      console.error(error);
    }
  });
}
function recursion(aa, c) {
  let group = 0;
  for (let index = 0; index < aa.length; index++) {
    const age = aa[index];
    group += age;
  }
  return group / c;
}
function mapSort(map) {
  let keys = [...map.keys()];
  // I used a technique to fix the default behaviour or Array.sort()  [1, 10, 12, 14, 2, 23...]
  // reference:  https://www.javascripttutorial.net/javascript-array-sort/
  sortedKeys = keys.sort(function (a, b) {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });
  // I was inspired by the following https://stackoverflow.com/questions/31158902/is-it-possible-to-sort-a-es6-map-object/51242261
  // to sort the map
  sortedKeys.forEach((key) => {
    const value = map.get(key);
    map.delete(key);
    map.set(key, value);
  });
}
