const { GoogleSpreadsheet } = require("google-spreadsheet");

let fs = require('fs');
let credsFile = Runtime.getAssets()['/creds.json'].path;
let creds = JSON.parse(fs.readFileSync(credsFile, 'utf8'));
async function getCritter(critterName) {
  const doc = new GoogleSpreadsheet('1XVGM2EdvM2kOFrYuGWV8UwaPwds3RnKGZxjeirpi-mA');
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();

  const fishSheet = doc.sheetsByIndex[0];
  const bugSheet = doc.sheetsByIndex[1];

  const bugs = await bugSheet.getRows();
  const fish = await fishSheet.getRows();

  const rows = bugs.concat(fish);
  
  const critter = rows.find(row => row.Name.toLowerCase() === critterName.toLowerCase());

  return critter;
}

exports.handler = async function(context, event, callback) {
  const twiml = new Twilio.twiml.MessagingResponse();
  const critterName = event.Body.trim();
  console.log(critterName);

  const critter = await getCritter(critterName);

  if(critter) {
    twiml.message(`The price of your ${critterName} is: ${critter.Price} bells.`);
  } else {
    twiml.message(`Sorry, I can't find a price for ${event.Body}. Please try again.`)
  }
  callback(null, twiml);

};