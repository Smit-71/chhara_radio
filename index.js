/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const stripe = require("stripe")("pk_test_51OYp3BSHghRJ3oEkfbCZ5xlvFukxzJ5kIKI8IZLK8q7PHsO33rYCOZ8SszcbVgLM5qyTa1Auu4FIKhGGMRTJmk2700df7ui2d7");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.stripPaymentIntentRequest = functions.https.onRequest(async (req, res) => {
  try {
  let customerId;

  const customerList = await stripe.customers.list({
        phone: req.body.phone,
        limit: 1
  });

  //check if the user exist
  if (customerList.data.length !== 0) {
     customerId = customerList.data[0].id;
  }
  else {
   const customer = await stripe.customer.create({
               phone: req.body.phone
      });
    customerId = customer.data.id;
  }

  const ephemeralKey = await stripe.ephemeralKeys.create(
     {customer: customerId },
     { apiVersion: '2024-01-22'}

  );

  const paymentIntent = await stripe.paymentIntents.create ({
     amount: parsInt(req.body.amount),
     currency: 'usd',
     customer: customerId,
   });

   res.status(200).send ({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customerId,
      success: true,
   });

  } catch (error) {
   res.status(404).send({ success: false, error: error.message});
  }
});
