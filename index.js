const puppeteer = require("puppeteer");
const nodemailer = require('nodemailer')
require('dotenv').config();

//STEPS
//First launch the browser
//Create page
//Go to a url
//Wait for the element to load
//Select the element 
//Get text content from the element
//Convert the text(Price in string) into a number 
//Then we see if the price is below 50000
//Send the email notification to me
//Else ignore

let website = "https://webscraper.io/test-sites/e-commerce/allinone";
let x_path = "/html/body/div[1]/div[3]/div/div[2]/div[2]/div[1]/div/div[1]/h4[1]";


const fetchData  = async function(url){
    //Measuring time from start to end of operation
    console.time("fetch_time");
    //Start an instance of browser class
    const browser = await puppeteer.launch({headless:true , defaultViewport:false});
    //Get the first tab from list of open browswer tabs
    const [page] = await browser.pages();
    //Go to the desired url and wait untill everything loads (networkidle0)
    await page.goto(url , {waitUntil:"networkidle0"});
    //Wait for the HTML element with price text to appear
    await page.waitForXPath(x_path);
    //Get the element using X-path
    let [element] = await page.$x(x_path);
    //Evaluate the element and get text content from it
    let text = await page.evaluate(function(elem){
        return elem.textContent
    } , element);
    //Printing the text content
    console.log("Text is" , text);
    await browser.close();

    console.timeEnd("fetch_time");
    //Replace "$" and "," from the text to convert it into the string
    text = text.replace(/(\$|,)/g ,"");

    //convert the text string into number 
    let price = parseFloat(text);

    //Check if the price is below point 
    if(price <400){
        //Send the notification
        notifyMe(text);
    }else {
        //If the price is hight dont sent the email
        console.log('Price too high so not sending alert');
    }
    
}

//Function to send email
const notifyMe = async function(price){

    //Create SMTP transporter in nodemailer
    let transporter = nodemailer.createTransport({
        service:'gmail',//Service priovider
        host:"smpt.gmail.com",//smtp hostname for gmail
        auth:{
            user:process.env.EMAIL,//Your gmail email 
            pass:process.env.PASS,//Your gmail pass
        }
     })

     //Send the email with price
     let info =  await transporter.sendMail({
        to:"your-email@gmail.com",
        from:"your-email@gmail.com",
        subject:"Price alert",
        html:`<h1>This is a price drop alert ${price}</h1>`,
        text:`This is a price drop alert ${price}`
    })

    //Log the message id (only logged if the email sent successfully)
    console.log('Message id' , info.messageId);
    }
 
fetchData(website);