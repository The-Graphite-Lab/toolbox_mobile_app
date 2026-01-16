const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var ApiContracts = require('authorizenet').APIContracts;
var ApiControllers = require('authorizenet').APIControllers;

function getAnAcceptPaymentPage({amount, description, transactionId, userEmail },callback) {

	console.log('running payment page')

	var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName(process.env.REACT_APP_AUTHNET_LOGIN_ID);
	merchantAuthenticationType.setTransactionKey(process.env.REACT_APP_AUTHNET_TRANSACTION_KEY);

	var transactionRequestType = new ApiContracts.TransactionRequestType();
	transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
	transactionRequestType.setAmount(amount);
    transactionRequestType.setOrder({
        description
    })

    transactionRequestType.setCustomer({
        email: userEmail
    })
	
	var setting1 = new ApiContracts.SettingType();
	setting1.setSettingName('hostedPaymentButtonOptions');
	setting1.setSettingValue('{\"text\": \"Purchase Credits\"}');

    var setting3 = new ApiContracts.SettingType();
	setting3.setSettingName('hostedPaymentReturnOptions');
	setting3.setSettingValue(`{"showReceipt": true, "url": "https://toolbox.thegraphitelab.com/account", "urlText": "Continue", "cancelUrl": "https://toolbox.thegraphitelab.com/account", "cancelUrlText": "Cancel"}`);

    var setting4 = new ApiContracts.SettingType();
	setting4.setSettingName('hostedPaymentOrderOptions');
	setting4.setSettingValue('{\"show\": true, \"merchantName\": "The Graphite Lab LLC"}');


	var settingList = [];
	settingList.push(setting1);
    settingList.push(setting3);
    settingList.push(setting4);

	var alist = new ApiContracts.ArrayOfSetting();
	alist.setSetting(settingList);

	var getRequest = new ApiContracts.GetHostedPaymentPageRequest();
	getRequest.setMerchantAuthentication(merchantAuthenticationType);
	getRequest.setTransactionRequest(transactionRequestType);
	getRequest.setHostedPaymentSettings(alist);
    getRequest.setRefId(transactionId)

	//console.log(JSON.stringify(getRequest.getJSON(), null, 2));
		
	var ctrl = new ApiControllers.GetHostedPaymentPageController(getRequest.getJSON());

	ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.GetHostedPaymentPageResponse(apiResponse);

		//pretty print response
		//console.log(JSON.stringify(response, null, 2));

		if(response != null) 
		{
			if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK)
			{
				console.log('Hosted payment page token :');
				console.log(response.getToken());
			}
			else
			{
				//console.log('Result Code: ' + response.getMessages().getResultCode());
				console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		}
		else
		{
			console.log('Null response received');
		}

		callback(response);
	});
}

function getAcceptCustomerProfilePage({customerProfileId}, callback) {

	var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName(process.env.REACT_APP_AUTHNET_LOGIN_ID);
	merchantAuthenticationType.setTransactionKey(process.env.REACT_APP_AUTHNET_TRANSACTION_KEY);
	
	var setting = new ApiContracts.SettingType();
	setting.setSettingName('hostedProfileReturnUrl');
	setting.setSettingValue('https://toolbox.thegraphitelab.com/account');

	var settingList = [];
	settingList.push(setting);

	var alist = new ApiContracts.ArrayOfSetting();
	alist.setSetting(settingList);

	var getRequest = new ApiContracts.GetHostedProfilePageRequest();
	getRequest.setMerchantAuthentication(merchantAuthenticationType);
	getRequest.setCustomerProfileId(customerProfileId);
	getRequest.setHostedProfileSettings(alist);

	//console.log(JSON.stringify(getRequest.getJSON(), null, 2));
		
	var ctrl = new ApiControllers.GetHostedProfilePageController(getRequest.getJSON());

	ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.GetHostedProfilePageResponse(apiResponse);

		//pretty print response
		//console.log(JSON.stringify(response, null, 2));

		if(response != null) 
		{
			if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK)
			{
				console.log('Hosted profile page token :');
				console.log(response.getToken());
			}
			else
			{
				//console.log('Result Code: ' + response.getMessages().getResultCode());
				console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		}
		else
		{
			console.log('Null response received');
		}

		callback(response);
	});
}

function createCustomerProfile({
	id,
	email,
	cardNumber, 
	expirationDate, 
	cardCode,
	firstName, 
	lastName, 
	streetAddress,
	city,
	state,
	zip,
	country
}) {

	console.log({
		id,
		email,
		cardNumber, 
		expirationDate, 
		cardCode,
		firstName, 
		lastName, 
		streetAddress,
		city,
		state,
		zip,
		country
	})
	var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName(process.env.REACT_APP_AUTHNET_LOGIN_ID);
	merchantAuthenticationType.setTransactionKey(process.env.REACT_APP_AUTHNET_TRANSACTION_KEY);

	var creditCard = new ApiContracts.CreditCardType();
	creditCard.setCardNumber(cardNumber);
	creditCard.setExpirationDate(expirationDate);
	creditCard.setCardCode(cardCode);

	var paymentType = new ApiContracts.PaymentType();
	paymentType.setCreditCard(creditCard);
	
	var customerAddress = new ApiContracts.CustomerAddressType();
	customerAddress.setFirstName(firstName);
	customerAddress.setLastName(lastName);
	customerAddress.setAddress(streetAddress);
	customerAddress.setCity(city);
	customerAddress.setState(state);
	customerAddress.setZip(zip);
	customerAddress.setCountry(country);

	var customerPaymentProfileType = new ApiContracts.CustomerPaymentProfileType();
	customerPaymentProfileType.setCustomerType(ApiContracts.CustomerTypeEnum.INDIVIDUAL);
	customerPaymentProfileType.setPayment(paymentType);
	customerPaymentProfileType.setBillTo(customerAddress);

	var paymentProfilesList = [];
	paymentProfilesList.push(customerPaymentProfileType);

	var customerProfileType = new ApiContracts.CustomerProfileType();
	customerProfileType.setDescription(id);
	customerProfileType.setEmail(email);
	customerProfileType.setPaymentProfiles(paymentProfilesList);

	var createRequest = new ApiContracts.CreateCustomerProfileRequest();
	createRequest.setProfile(customerProfileType);
	createRequest.setValidationMode(ApiContracts.ValidationModeEnum.TESTMODE);
	createRequest.setMerchantAuthentication(merchantAuthenticationType);
	createRequest.setValidationMode('liveMode')

	//pretty print request
	//console.log(JSON.stringify(createRequest.getJSON(), null, 2));


	return new Promise((resolve, reject) => {
		try {
		  const ctrl = new ApiControllers.CreateCustomerProfileController(createRequest.getJSON());
		  ctrl.execute(function(){
				var apiResponse = ctrl.getResponse();
				var response = new ApiContracts.CreateCustomerProfileResponse(apiResponse);
		
				//pretty print response
				//console.log(JSON.stringify(response, null, 2));
		
				if(response != null) 
				{
					if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK)
					{
						console.log('Successfully created a customer profile with id: ' + response.getCustomerProfileId());
					}
					else
					{
						console.log('Result Code: ' + response.getMessages().getResultCode());
						console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
						console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
					}
				}
				else
				{
					console.log('Null response received');
				}
		
				resolve(response);
			})
	  }catch (error) {
		console.error(error);
		reject(error);
	  }})
}

function getPaymentProfile({customerProfileId}){

	var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName(process.env.REACT_APP_AUTHNET_LOGIN_ID);
	merchantAuthenticationType.setTransactionKey(process.env.REACT_APP_AUTHNET_TRANSACTION_KEY);

	var getRequest = new ApiContracts.GetCustomerProfileRequest();
	getRequest.setMerchantAuthentication(merchantAuthenticationType);
	getRequest.setCustomerProfileId(customerProfileId);

	//pretty print request
	//console.log(JSON.stringify(createRequest.getJSON(), null, 2));
	return new Promise((resolve, reject) => {
		try {	
	var ctrl = new ApiControllers.GetCustomerProfileController(getRequest.getJSON());

	ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.GetCustomerProfileResponse(apiResponse);
		resolve(response)
	})}catch (error) {
		console.error(error);
		reject(error);
	}
})
}

function getCustomerTransactions({customerProfileId}){
	var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName(process.env.REACT_APP_AUTHNET_LOGIN_ID);
	merchantAuthenticationType.setTransactionKey(process.env.REACT_APP_AUTHNET_TRANSACTION_KEY);

	var paging = new ApiContracts.Paging();
	paging.setLimit(100);
	paging.setOffset(1);

	var sorting = new ApiContracts.TransactionListSorting();
	sorting.setOrderBy(ApiContracts.TransactionListOrderFieldEnum.ID);
	sorting.setOrderDescending(true);

	var getRequest = new ApiContracts.GetTransactionListForCustomerRequest();
	getRequest.setMerchantAuthentication(merchantAuthenticationType);
	getRequest.setCustomerProfileId(customerProfileId);
	getRequest.setPaging(paging);
	getRequest.setSorting(sorting);
	
	return new Promise((resolve, reject) => {
		try {	
			var ctrl = new ApiControllers.GetTransactionListForCustomerController(getRequest.getJSON());

			ctrl.execute(function(){

				var apiResponse = ctrl.getResponse();

				var response = new ApiContracts.GetTransactionListResponse(apiResponse);
				
				resolve(response);
		})}catch (error) {
			console.error(error);
			reject(error);
		}
})}

function chargeCustomerPaymentProfile({customerProfileId, customerPaymentProfileId, description, productCode, productDescription, productPrice, productQuantity}){
	var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName(process.env.REACT_APP_AUTHNET_LOGIN_ID);
	merchantAuthenticationType.setTransactionKey(process.env.REACT_APP_AUTHNET_TRANSACTION_KEY);

	var profileToCharge = new ApiContracts.CustomerProfilePaymentType();
	profileToCharge.setCustomerProfileId(customerProfileId);

	var paymentProfile = new ApiContracts.PaymentProfile();
	paymentProfile.setPaymentProfileId(customerPaymentProfileId);
	profileToCharge.setPaymentProfile(paymentProfile);

	var orderDetails = new ApiContracts.OrderType();
	orderDetails.setDescription(description);

	var lineItem_id1 = new ApiContracts.LineItemType();
	lineItem_id1.setItemId('1');
	lineItem_id1.setName(productCode);
	lineItem_id1.setDescription(productDescription);
	lineItem_id1.setQuantity(productQuantity);
	lineItem_id1.setUnitPrice(productPrice);

	var lineItemList = [];
	lineItemList.push(lineItem_id1);

	var lineItems = new ApiContracts.ArrayOfLineItem();
	lineItems.setLineItem(lineItemList);

	var transactionRequestType = new ApiContracts.TransactionRequestType();
	transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
	transactionRequestType.setProfile(profileToCharge);
	transactionRequestType.setAmount(productPrice);
	transactionRequestType.setLineItems(lineItems);
	transactionRequestType.setOrder(orderDetails);

	var createRequest = new ApiContracts.CreateTransactionRequest();
	createRequest.setMerchantAuthentication(merchantAuthenticationType);
	createRequest.setTransactionRequest(transactionRequestType);

	//pretty print request
	console.log(JSON.stringify(createRequest.getJSON(), null, 2));
	return new Promise((resolve, reject) => {
		try {	
			var ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());

			ctrl.execute(function(){

				var apiResponse = ctrl.getResponse();

				var response = new ApiContracts.CreateTransactionResponse(apiResponse);

				//pretty print response
				console.log(JSON.stringify(response, null, 2));
				resolve(response);
			});
		}catch (error) {
			console.error(error);
			reject(error);
		}})
}

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

app.post('/processPayment', function(req, res) {
    const body =req?.body;
	getAnAcceptPaymentPage(body, (response)=>{res.json(response)})
});

app.post('/createCustomerProfileToken', function(req, res) {
    const body =req?.body;
	getAcceptCustomerProfilePage(body, (response)=>{res.json(response)})
});

app.post('/customerProfile', async function(req, res){
	const body = req?.body;
	const customerProfileResponse = await createCustomerProfile(body)
	res.json(customerProfileResponse)
})

app.get('/customerPaymentProfile', async function(req, res){
	const body = req?.query;
	const paymentProfileResponse = await getPaymentProfile(body)
	res.json(paymentProfileResponse)
})

app.get('/customerTransactions', async function(req, res){
	const body = req?.query;
	const transactionsResponse = await getCustomerTransactions(body)
	res.json(transactionsResponse)
})

app.post('/chargeCustomerPaymentProfile', async function(req, res){
	let body = req?.body;
	const productCode = body?.productCode;
	const priceMap = {
		'Credits50': '5',
		'Credits100': '10',
		'Credits200': '15'
	}
	const productPrice = priceMap[productCode];
	if(!productPrice){
		res.json({
			status: 'error',
			message: 'Product Code is not recognized.'
		})
	}
	body.productPrice = productPrice;
	const transactionsResponse = await chargeCustomerPaymentProfile(body)
	res.json(transactionsResponse)
})


app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
